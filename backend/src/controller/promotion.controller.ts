import { Request, Response } from 'express';
import { INVALID_DATA } from '../constants/client.error.name';
import { BadRequestError } from '../errors/client.error';
import { PromotionService } from '../service/promotion.service';
import { CreatePromotionRequest } from '../types/request/promotion.request';
import { uploadPromotionImage } from '../utils/aws.upload';

async function createPromotion(req: CreatePromotionRequest, res: Response) {
  const body = req.body;
  const file = req.file;
  if (!file) throw new BadRequestError(INVALID_DATA);
  const imagePath = await uploadPromotionImage(file);
  const result = await PromotionService.createPromotion(body, imagePath);
  res.status(201).json({ result });
}

async function getPromotions(req: Request, res: Response) {
  const result = await PromotionService.getPromotions();
  res.status(200).json({ result });
}

async function deletePromotion(req: Request, res: Response) {
  const promotionId = Number(req.params.id);
  await PromotionService.deletePromotion(promotionId);
  res.sendStatus(204);
}

async function increasePromotionView(req: Request, res: Response) {
  const promotionId = Number(req.params.id);
  await PromotionService.increasePromotionView(promotionId);
  res.sendStatus(204);
}

async function getPromotionChartData(req: Request, res: Response) {
  const result = await PromotionService.getPromotionChartData();
  res.status(200).json({ result });
}

export const PromotionController = {
  createPromotion,
  getPromotions,
  deletePromotion,
  increasePromotionView,
  getPromotionChartData,
};
