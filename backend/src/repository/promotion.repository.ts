import { DeleteResult, getRepository, UpdateResult } from 'typeorm';
import { PROMOTION_DB_ERROR } from '../constants/database.error.name';
import { Promotion } from '../entity/Promotion';
import { DatabaseError } from '../errors/base.error';

async function createPromotion(goodsId: number, imgUrl: string): Promise<Promotion> {
  try {
    const promotionRepo = getRepository(Promotion);
    const newPromotionEntity = promotionRepo.create({
      goods: { id: goodsId },
      imgUrl,
    });
    return await promotionRepo.save(newPromotionEntity);
  } catch (err) {
    console.error(err);
    throw new DatabaseError(PROMOTION_DB_ERROR);
  }
}

async function getPromotions(): Promise<Promotion[]> {
  try {
    const promotionRepo = getRepository(Promotion);
    return await promotionRepo.find({ order: { createdAt: 'DESC' }, relations: ['goods'] });
  } catch (err) {
    console.error(err);
    throw new DatabaseError(PROMOTION_DB_ERROR);
  }
}

async function deletePromotion(promotionId: number): Promise<DeleteResult> {
  try {
    return getRepository(Promotion).delete({ id: promotionId });
  } catch (err) {
    console.error(err);
    throw new DatabaseError(PROMOTION_DB_ERROR);
  }
}

async function increasePromotionView(promotionId: number): Promise<UpdateResult> {
  try {
    return await getRepository(Promotion)
      .createQueryBuilder()
      .update('promotion')
      .where(`promotion.id = ${promotionId}`)
      .set({ view: () => 'view + 1' })
      .execute();
  } catch (err) {
    console.error(err);
    throw new DatabaseError(PROMOTION_DB_ERROR);
  }
}

export const PromotionRepository = {
  createPromotion,
  getPromotions,
  deletePromotion,
  increasePromotionView,
};
