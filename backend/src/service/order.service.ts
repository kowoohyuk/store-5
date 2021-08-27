import { Goods } from './../entity/Goods';
import { OrderItem } from './../entity/OrderItem';
import { CreateOrderBody } from './../types/request/order.request';
import { Order } from '../entity/Order';
import { OrderListRepository } from '../repository/order.list.repository';
import { OrderItemRepository } from '../repository/order.item.repository';
import { GoodsRepository } from '../repository/goods.repository';
import { BadRequestError } from '../errors/client.error';
import { INVALID_DATA } from '../constants/client.error.name';
import { GetAllOrderByUserIdProps, OrderGoods } from '../types/Order';
import { OrderListPaginationResponse } from '../types/response/order.response';
import { getTotalPage, pagination } from '../utils/pagination';
import { PaginationProps } from '../types/Pagination';
import { PaymentRepository } from '../repository/payment.repository';
import CartService from './cart.service';
import { GoodsService } from './goods.service';
import { getConnection, EntityManager } from 'typeorm';
import { Cart } from '../entity/Cart';

async function getOwnOrdersPagination(
  { page, limit }: GetAllOrderByUserIdProps,
  userId: number
): Promise<OrderListPaginationResponse> {
  const totalCount = await OrderListRepository.getOwnOrderTotalCount(userId);

  const newPage = Math.min(getTotalPage(totalCount, limit), page);

  const option: PaginationProps = {
    offset: pagination.calculateOffset(newPage, limit),
    limit,
  };

  const orders = await OrderListRepository.getOwnOrdersPagination(option, userId);

  return {
    meta: {
      page: newPage,
      limit,
      totalPage: getTotalPage(totalCount, limit),
      totalCount,
    },
    orderList: orders,
  };
}

async function getAllOrdersPagination({ page, limit }: GetAllOrderByUserIdProps): Promise<OrderListPaginationResponse> {
  const totalCount = await OrderListRepository.getAllOrderTotalCount();

  const newPage = Math.min(getTotalPage(totalCount, limit), page);

  const option: PaginationProps = {
    offset: pagination.calculateOffset(newPage, limit),
    limit,
  };

  const orders = await OrderListRepository.getAllOrdersPagination(option);

  return {
    meta: {
      page: newPage,
      limit,
      totalPage: getTotalPage(totalCount, limit),
      totalCount,
    },
    orderList: orders,
  };
}

async function createOrder(userId: number, body: CreateOrderBody): Promise<Order> {
  const validateResult = await validateCreateOrder(body);
  if (!validateResult) throw new BadRequestError(INVALID_DATA);

  const { orderMemo, receiver, zipCode, address, subAddress, paymentId, goodsList, cartIds } = body;

  return await getConnection().transaction(async (transactionalEntityManager) => {
    // 장바구니 제거
    if (cartIds) await Promise.all(cartIds.map((id) => transactionalEntityManager.delete(Cart, { id })));

    // 재고 감소
    await Promise.all(
      goodsList.map(({ id, amount }) => transactionalEntityManager.decrement(Goods, { id }, 'stock', amount))
    );

    // 주문 생성
    const order = await OrderListRepository.createOrder(transactionalEntityManager, userId, {
      orderMemo,
      receiver,
      zipCode,
      address,
      subAddress,
      paymentId,
    });

    await Promise.all(
      goodsList.map((orderedItem) => createOrderItem(transactionalEntityManager, orderedItem, order.id))
    );

    return order;
  });
}

async function createOrderItem(
  transactionalEntityManager: EntityManager,
  orderedItem: OrderGoods,
  orderId: number
): Promise<void> {
  const goods = await GoodsRepository.getGoodsDetailById(orderedItem.id);
  if (!goods) throw new BadRequestError(INVALID_DATA + `(id:${orderId}는 존재하지않는 상품입니다.)`);

  const { price, discountRate, state } = goods;
  await transactionalEntityManager.save(OrderItem, {
    goods: { id: goods.id },
    order: { id: orderId },
    price,
    discountRate,
    state,
    amount: orderedItem.amount,
  });
}

async function validateCreateOrder(body: CreateOrderBody): Promise<boolean> {
  const { orderMemo, receiver, zipCode, address, subAddress, paymentId, goodsList } = body;
  if (!orderMemo || !receiver || !zipCode || !address || !subAddress || !paymentId || !goodsList) return false;
  const payment = await PaymentRepository.getPaymentById(paymentId);
  if (!payment) return false;

  // 재고 검사
  for (const { id, amount } of goodsList) {
    const stock = await GoodsService.getGoodsStockById(id);
    if (stock < amount) return false;
  }

  return true;
}

export const OrderService = {
  getAllOrdersPagination,
  getOwnOrdersPagination,
  createOrder,
};
