import { DeleteResult, getRepository } from 'typeorm';
import { WISH_DB_ERROR } from '../constants/database.error.name';
import { Wish } from '../entity/Wish';
import { DatabaseError } from '../errors/base.error';

async function getWishByIds(userId: number, goodsId: number): Promise<Wish | undefined> {
  try {
    const wishRepo = getRepository(Wish);
    return await wishRepo.findOne({ where: { userId, goodsId } });
  } catch (err) {
    console.error(err);
    throw new DatabaseError(WISH_DB_ERROR);
  }
}

async function createWish(userId: number, goodsId: number): Promise<Wish> {
  try {
    const wishRepo = getRepository(Wish);
    return await wishRepo.save({ userId, goodsId });
  } catch (err) {
    console.error(err);
    throw new DatabaseError(WISH_DB_ERROR);
  }
}

async function deleteWish(userId: number, goodsId: number): Promise<DeleteResult> {
  try {
    const wishRepo = getRepository(Wish);
    return await wishRepo.delete({ userId, goodsId });
  } catch (err) {
    console.error(err);
    throw new DatabaseError(WISH_DB_ERROR);
  }
}

async function getWishByUserId(userId: number): Promise<number[]> {
  try {
    const result = await getRepository(Wish)
      .createQueryBuilder('wish')
      .select('wish.goodsId')
      .where('wish.userId = :userId', { userId })
      .getMany();

    return result.map((wish) => wish.goodsId);
  } catch (error) {
    console.error(error);
    throw new DatabaseError(WISH_DB_ERROR);
  }
}

async function getWishCountByGoodsIdAndUserId(goodsId: number, userId: number): Promise<number> {
  try {
    const result = await getRepository(Wish)
      .createQueryBuilder('wish')
      .select('wish.goodsId')
      .where('wish.goodsId = :goodsId', { goodsId })
      .andWhere('wish.userId = :userId', { userId })
      .getCount();
    return result;
  } catch (error) {
    console.error(error);
    throw new DatabaseError(WISH_DB_ERROR);
  }
}

async function getWishCountByUserId(userId: number): Promise<number> {
  try {
    const result = await getRepository(Wish)
      .createQueryBuilder('wish')
      .select('wish.goodsId')
      .where('wish.userId = :userId', { userId })
      .getCount();
    return result;
  } catch (error) {
    console.error(error);
    throw new DatabaseError(WISH_DB_ERROR);
  }
}

export const WishRepository = {
  getWishByUserId,
  getWishByIds,
  getWishCountByUserId,
  getWishCountByGoodsIdAndUserId,
  createWish,
  deleteWish,
};
