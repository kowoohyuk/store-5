import { DeleteResult } from 'typeorm';
import { INVALID_ACCESS } from '../constants/client.error.name';
import { Cart } from '../entity/Cart';
import { Goods } from '../entity/Goods';
import { NotFoundError } from '../errors/client.error';
import CartRepository from '../repository/cart.repository';
import { GoodsRepository } from '../repository/goods.repository';
import { CartBody } from '../types/request/cart.request';
import { CartResponse, CartsResponse } from '../types/response/cart.response';

async function getAllCartByUserId(userId: number): Promise<CartsResponse> {
  const rawCarts = await CartRepository.getCartsByUserId(userId);

  // 해당 상품의 재고와 판매상태를 확인하면서 필터링한다.
  const carts = rawCarts.map((rawCart) => {
    const { amount, goods } = rawCart;
    return { ...rawCart, amount: Math.min(amount, goods.stock) };
  });

  return carts.filter(({ amount }) => amount > 0);
}

async function createCart(userId: number, goodsId: number, body: CartBody): Promise<CartResponse> {
  // goods가 존재하는지 체크한다.
  const goods = await GoodsRepository.getGoodsDetailById(goodsId);
  if (!goods) throw new NotFoundError(INVALID_ACCESS);

  // 기존 cart가 존재한다면 기존 것을 지운다.
  const cart = (await CartRepository.getCartByUserIdAndGoodsId(userId, goods.id)) as Cart;
  if (cart) {
    await CartRepository.deleteCart(cart.id);
  }

  return await CartRepository.createCart(userId, goodsId, body);
}

async function updateCart(userId: number, cartId: number, body: CartBody): Promise<CartResponse> {
  await checkMineCart(userId, cartId);

  // cart의 amount를 goods의 재고 범위 안에 놓는다.
  const cart = (await CartRepository.getCartByUserIdAndCartId(userId, cartId)) as Cart;
  const goods = (await GoodsRepository.getGoodsDetailById(cart.goods.id)) as Goods;

  let { amount } = body;
  if (amount < 1) {
    amount = 1;
  }
  if (amount > goods.stock) {
    amount = goods.stock;
  }

  return await CartRepository.updateCart(cartId, { ...body, amount });
}

async function deleteCarts(userId: number, cartIds: number[]) {
  async function getDeletePromise(cartId: number) {
    await checkMineCart(userId, cartId);
    await CartRepository.deleteCart(cartId);
  }

  await Promise.all(cartIds.map((cartId) => getDeletePromise(cartId)));
}

async function checkMineCart(userId: number, cartId: number): Promise<boolean> {
  const cart = await CartRepository.getCartByUserIdAndCartId(userId, cartId);
  if (cart) return true;
  throw new NotFoundError(INVALID_ACCESS);
}

const CartService = {
  getAllCartByUserId,
  createCart,
  updateCart,
  deleteCarts,
};

export default CartService;
