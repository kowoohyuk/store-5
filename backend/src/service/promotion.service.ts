import { GoodsRepository } from './../repository/goods.repository';
import { DeleteResult } from 'typeorm';
import { BadRequestError } from '../errors/client.error';
import { PromotionRepository } from '../repository/promotion.repository';
import { CreatePromotionBody } from '../types/request/promotion.request';
import { PromotionResponse } from '../types/response/promotion.response';

const PROMOTION_PARAMETER_ERROR = '프로모션을 등록하기위해서 imgUrl 값은 필수입니다.';
const PROMOTION_GOODS_ERROR = '프로모션을 진행하려는 해당 상품은 존재하지 않는 상품입니다.';

async function createPromotion(body: CreatePromotionBody, imgUrl: string): Promise<PromotionResponse> {
  await checkValidateCreatePromotion(body, imgUrl);
  const { goodsId } = body;
  const newPromotion = await PromotionRepository.createPromotion(goodsId, imgUrl);
  return {
    id: newPromotion.id,
    imgUrl: newPromotion.imgUrl,
  };
}

async function getPromotions(): Promise<PromotionResponse[]> {
  const promotions = await PromotionRepository.getPromotions();

  return promotions.map((p) => ({
    id: p.id,
    imgUrl: p.imgUrl,
  }));
}

async function deletePromotion(promotionId: number): Promise<DeleteResult> {
  return await PromotionRepository.deletePromotion(promotionId);
}

async function checkValidateCreatePromotion(body: CreatePromotionBody, imgUrl: string): Promise<void> {
  const { goodsId } = body;
  const foundGoods = await GoodsRepository.findGoodsById(goodsId);
  if (!foundGoods) throw new BadRequestError(PROMOTION_GOODS_ERROR);
  if (!imgUrl) throw new BadRequestError(PROMOTION_PARAMETER_ERROR);
}

export const PromotionService = {
  createPromotion,
  getPromotions,
  deletePromotion,
};
