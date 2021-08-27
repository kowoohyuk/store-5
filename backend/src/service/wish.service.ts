import { DeleteResult } from 'typeorm';
import { INVALID_ACCESS } from '../constants/client.error.name';
import { NotFoundError } from '../errors/client.error';
import { WishRepository } from '../repository/wish.repository';
import { CreateWishResponse } from '../types/response/wish.response';

async function createWish(userId: number, goodsId: number): Promise<CreateWishResponse> {
  return await WishRepository.createWish(userId, goodsId);
}

async function deleteWish(userId: number, goodsId: number): Promise<DeleteResult> {
  await checkMineWish(userId, goodsId);
  return await WishRepository.deleteWish(userId, goodsId);
}

async function checkMineWish(userId: number, goodsId: number): Promise<void> {
  const wish = await WishRepository.getWishByIds(userId, goodsId);
  if (!wish) throw new NotFoundError(INVALID_ACCESS);
}

export default {
  createWish,
  deleteWish,
};
