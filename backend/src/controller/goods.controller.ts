import { Request, Response } from 'express';
import { INVALID_DATA } from '../constants/client.error.name';
import { BadRequestError } from '../errors/client.error';
import { GoodsService } from '../service/goods.service';
import {
  CreateGoodsBody,
  CreateGoodsRequest,
  GetAllGoodsQuery,
  UpdateGoodsBody,
  UpdateGoodsRequest,
} from '../types/request/goods.request';
import { uploadProductImages } from '../utils/aws.upload';

async function createGoods(req: CreateGoodsRequest, res: Response) {
  const { title, isGreen, stock, state, price, discountRate, category, deliveryInfo } = req.body;
  const body: CreateGoodsBody = {
    title,
    isGreen: Boolean(isGreen),
    stock: Number(stock),
    state,
    price: Number(price),
    discountRate: Number(discountRate),
    category: Number(category),
    deliveryInfo: Number(deliveryInfo),
  };

  const files = req.files;

  if (!files || !Array.isArray(files)) throw new BadRequestError(INVALID_DATA);

  const uploadFileUrls = await uploadProductImages(files);

  const result = await GoodsService.createGoods(body, uploadFileUrls);

  res.status(201).json({ result });
}

async function updateGoods(req: UpdateGoodsRequest, res: Response) {
  const goodsId = Number(req.params.id);
  const { title, isGreen, stock, state, price, discountRate, category, deliveryInfo, thumbnailUrl, oldImages } =
    req.body;

  const body: UpdateGoodsBody = {
    title,
    isGreen: Boolean(isGreen),
    stock: Number(stock),
    state,
    price: Number(price),
    discountRate: Number(discountRate),
    category: Number(category),
    deliveryInfo: Number(deliveryInfo),
    oldImages,
    thumbnailUrl,
  };

  const files = req.files;

  if (!files || !Array.isArray(files)) throw new BadRequestError(INVALID_DATA);

  const uploadFileUrls = await uploadProductImages(files);

  const result = await GoodsService.updateGoods(body, goodsId, uploadFileUrls);

  res.status(201).json({ result });
}

async function getGoodsDetail(req: Request, res: Response) {
  const goodsId = Number(req.params.id);
  const userId = req.session.userId;
  const result = await GoodsService.getDetailById(goodsId, userId);
  res.status(200).json({ result });
}

async function getAllGoodsForClient(req: Request, res: Response) {
  const { page, limit, flag, category, keyword, sort } = req.query;
  const query: GetAllGoodsQuery = {
    page: Number(page),
    limit: Number(limit),
    sort: String(sort),
  };
  if (category) query.category = String(category);
  if (flag) query.flag = String(flag);
  if (keyword) query.keyword = String(keyword);
  const userId = req.session.userId;
  const isAdmin = false;
  const result = await GoodsService.getGoodsByOption(query, isAdmin, userId);
  return res.status(200).json({ result });
}

async function getAllGoodsForAdmin(req: Request, res: Response) {
  const { page, limit, flag, keyword, sort } = req.query;
  const query: GetAllGoodsQuery = {
    page: Number(page),
    limit: Number(limit),
    sort: String(sort),
  };
  if (keyword) query.keyword = String(keyword);
  if (flag) query.flag = String(flag);
  const userId = req.session.userId;
  const isAdmin = true;
  const result = await GoodsService.getGoodsByOption(query, isAdmin, userId);
  return res.status(200).json({ result });
}

async function getMainGoodsListMap(req: Request, res: Response) {
  const userId = req.session.userId;
  const result = await GoodsService.getMainGoodsListMap(userId);
  res.status(200).json({ result });
}

async function getGoodsStockById(req: Request, res: Response) {
  const goodsId = Number(req.params.id);
  const result = await GoodsService.getGoodsStockById(goodsId);
  res.status(200).json({ result });
}

async function getGoodsImgById(req: Request, res: Response) {
  const goodsId = Number(req.params.id);
  const result = await GoodsService.getGoodsImgById(goodsId);
  return res.status(200).json({ result });
}

async function getBestGoodsForDashboard(req: Request, res: Response) {
  const result = await GoodsService.getBestSellingGoodsForDashboard();
  res.status(200).json({ result });
}

export const GoodsController = {
  createGoods,
  updateGoods,
  getGoodsDetail,
  getMainGoodsListMap,
  getGoodsStockById,
  getAllGoodsForClient,
  getAllGoodsForAdmin,
  getGoodsImgById,
  getBestGoodsForDashboard,
};
