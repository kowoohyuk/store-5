import { GoodsImg } from './../entity/GoodsImg';
import { ColumnTypeUndefinedError, getConnection, MoreThan } from 'typeorm';
import { Goods } from '../entity/Goods';
import { GoodsRepository } from '../repository/goods.repository';
import {
  DetailGoodsResponse,
  GoodsListResponse,
  GoodsListMetaData,
  TaggedGoodsType,
  BestGoodsType,
} from '../types/response/goods.response';
import { WishRepository } from '../repository/wish.repository';
import {
  FindAllCategoryProps,
  FindAllColumnNameProps,
  FindAllKeywordProps,
  FindAllUserIdProps,
  GetAllByCategoryProps,
  GetAllByKeywordProps,
  GetAllByUserIdProps,
} from '../types/Goods';
import { pagination } from '../utils/pagination';
import { BadRequestError } from '../errors/client.error';
import { GOODS_DB_ERROR } from '../constants/database-error-name';
import { CategoryRepository } from '../repository/category.repository';
import { GoodsStateMap } from '../controller/goods.controller';
import { CreateGoodsBody } from '../types/request/goods.request';
import { OrderItemRepository } from '../repository/order.item.repository';

async function createGoods(body: CreateGoodsBody, uploadFileUrls: string[]): Promise<Goods> {
  return await getConnection().transaction(async (transactionalEntityManager) => {
    const goods = await transactionalEntityManager.save(Goods, { ...body, thumbnailUrl: uploadFileUrls[0] });
    await Promise.all(
      uploadFileUrls.map(async (url) => await transactionalEntityManager.save(GoodsImg, { goods: goods.id, url }))
    );
    return goods;
  });
}

// 비회원은 isWish를 확인하지 않습니다.
async function getDetailById(goodsId: number, userId?: number): Promise<DetailGoodsResponse> {
  const data = await GoodsRepository.findGoodsDetailById(goodsId);
  const imgs = data?.goodsImgs.map((goodsImg) => goodsImg.url);
  const res = JSON.parse(JSON.stringify(data));
  delete res.goodsImgs;
  if (data && userId) {
    res.isWish = (await WishRepository.findWishCountByGoodsIdAndUserId(goodsId, userId)) > 0;
  }
  return { ...res, goodsImgs: imgs };
}

async function getAllSaleGoodsByCategory({
  categoryName,
  page,
  flag,
  limit,
  userId,
}: GetAllByCategoryProps): Promise<GoodsListResponse> {
  // TODO: 함수로 빼도 될듯?
  const category = await CategoryRepository.getCategoryByName(categoryName);
  if (!category) throw new BadRequestError(GOODS_DB_ERROR);
  const totalCount = await GoodsRepository.findTotalCountByCategory(category.id);
  page = Math.min(getTotalPage(totalCount, limit), page);
  const option: FindAllCategoryProps = setAllByCategoryOption(category.id, page, limit, flag);
  const wishSet = userId && new Set(await WishRepository.findWishByUserId(userId));
  const goodsSellCountAverage = await GoodsRepository.findSellCountAverage();
  const goodsList = await GoodsRepository.findAllByCategory(option);
  if (!goodsList) throw new BadRequestError(GOODS_DB_ERROR);

  goodsList.forEach((goods) => {
    if (wishSet) goods.isWish = wishSet.has(goods.id);
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = isNewGoods(goods.createdAt);
  });

  return {
    meta: getListGoodsMeta(page, limit, totalCount),
    goodsList,
  };
}

async function getAllSaleGoodsByKeyword({
  keyword,
  page,
  limit,
  userId,
}: GetAllByKeywordProps): Promise<GoodsListResponse> {
  const totalCount = await GoodsRepository.findTotalCountByKeyword(keyword);
  page = Math.min(getTotalPage(totalCount, limit), page);

  const option: FindAllKeywordProps = {
    keyword,
    offset: pagination.calculateOffset(page, limit),
    limit,
  };

  const wishSet = userId && new Set(await WishRepository.findWishByUserId(userId));
  const goodsSellCountAverage = await GoodsRepository.findSellCountAverage();
  const goodsList = await GoodsRepository.findAllByKeyword(option);
  if (!goodsList) throw new BadRequestError(GOODS_DB_ERROR);

  goodsList.forEach((goods) => {
    if (wishSet) goods.isWish = wishSet.has(goods.id);
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = isNewGoods(goods.createdAt);
  });

  return {
    meta: getListGoodsMeta(page, limit, totalCount),
    goodsList,
  };
}

async function getAllGoodsByUserId({ page, limit, userId }: GetAllByUserIdProps): Promise<GoodsListResponse> {
  const totalCount = await WishRepository.findWishCountByUserId(userId);
  page = Math.min(getTotalPage(totalCount, limit), page);

  const option: FindAllUserIdProps = {
    offset: pagination.calculateOffset(page, limit),
    limit,
    userId,
  };

  const wishSet = new Set(await WishRepository.findWishByUserId(userId));
  const goodsSellCountAverage = await GoodsRepository.findSellCountAverage();
  const goodsList = await GoodsRepository.findAllWishByUserId(option);
  if (!goodsList) throw new BadRequestError(GOODS_DB_ERROR);

  goodsList.forEach((goods) => {
    if (wishSet) goods.isWish = wishSet.has(goods.id);
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = isNewGoods(goods.createdAt);
  });

  return {
    meta: getListGoodsMeta(page, limit, totalCount),
    goodsList,
  };
}

// TODO: 각 조회를 하나의 함수로 분리?
async function getMainGoodsListMap(): Promise<{
  bestGoodsList: TaggedGoodsType[];
  latestGoodsList: TaggedGoodsType[];
  discountGoodsList: TaggedGoodsType[];
}> {
  const bestProps: FindAllColumnNameProps = {
    columnName: 'countOfSell',
    limit: 4,
  };
  const latestProps: FindAllColumnNameProps = {
    columnName: 'createdAt',
    limit: 8,
  };
  const discountProps: FindAllColumnNameProps = {
    columnName: 'discountRate',
    limit: 8,
  };

  const bestGoodsList = await GoodsRepository.findAllByColumnName(bestProps);
  const latestGoodsList = await GoodsRepository.findAllByColumnName(latestProps);
  const discountGoodsList = await GoodsRepository.findAllByColumnName(discountProps);
  return {
    bestGoodsList,
    latestGoodsList,
    discountGoodsList,
  };
}

// 백오피스용 목록 조회 함수입니다, 추가적인 작업 예정 :)
async function getAllByCategory({ categoryName, page, flag, limit, state }: GetAllByCategoryProps) {
  // TODO: 함수로 빼도 될듯?
  const category = await CategoryRepository.getCategoryByName(categoryName);
  if (!category) throw new BadRequestError(GOODS_DB_ERROR);
  const totalCount = await GoodsRepository.findTotalCountByCategory(category.id);
  page = Math.min(getTotalPage(totalCount, limit), page);

  const option: FindAllCategoryProps = {
    category: category.id,
    offset: pagination.calculateOffset(page, limit),
    limit: limit,
    where: {
      state,
      stock: MoreThan(0),
    },
    order: getCategoryByFlag(flag),
    sort: getSortByFlag(flag),
  };

  const goodsList = await GoodsRepository.findAllByCategory(option);
  if (!goodsList) throw new BadRequestError(GOODS_DB_ERROR);

  const goodsSellCountAverage = await GoodsRepository.findSellCountAverage();

  goodsList.forEach((goods) => {
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = isNewGoods(goods.createdAt);
  });

  return {
    meta: getListGoodsMeta(page, limit, totalCount),
    goods: goodsList,
  };
}

async function getGoodsStockById(goodsId: number): Promise<number> {
  const stock = await GoodsRepository.findStockById(goodsId);
  return stock;
}

function setAllByCategoryOption(category: number, page: number, limit: number, flag: string): FindAllCategoryProps {
  return {
    category: category,
    offset: pagination.calculateOffset(page, limit),
    limit: limit,
    where: {
      state: GoodsStateMap.sale,
      stock: MoreThan(0),
    },
    order: getCategoryByFlag(flag),
    sort: getSortByFlag(flag),
  };
}

function getCategoryByFlag(flag: string): keyof Goods {
  switch (flag) {
    case 'low':
    case 'high':
      return 'price';
    case 'best':
      return 'countOfSell';
    case 'latest':
      return 'createdAt';
    default:
      return 'createdAt';
  }
}

function getSortByFlag(flag: string): 'DESC' | 'ASC' {
  return flag === 'low' ? 'ASC' : 'DESC';
}

function isNewGoods(date: Date): boolean {
  const DAY_DIVIDE = 1000 / 60 / 60 / 24;
  const NEW_PRODUCT_BASE_DAY = 7;
  const nowTime = new Date().getTime();
  return (nowTime - date.getTime()) / DAY_DIVIDE < NEW_PRODUCT_BASE_DAY;
}

function getListGoodsMeta(page: number, limit: number, totalCount: number): GoodsListMetaData {
  return {
    page,
    limit,
    totalPage: getTotalPage(totalCount, limit),
    totalCount,
  };
}

function getTotalPage(totalCount: number, limit: number): number {
  return Math.ceil(totalCount / limit);
}

async function getBestByPeriod(startDate: Date, endDate: Date, limit: number): Promise<BestGoodsType[]> {
  const any: any[] = await OrderItemRepository.findCountByPeriod(startDate, endDate, limit);
  console.log(any);
  const stock = await GoodsRepository.findBestByPeriod(startDate, endDate);
  return stock;
}

export const GoodsService = {
  createGoods,
  getDetailById,
  getAllByCategory,
  getAllSaleGoodsByKeyword,
  getAllSaleGoodsByCategory,
  getAllGoodsByUserId,
  getMainGoodsListMap,
  getGoodsStockById,
  // 관리자
  getBestByPeriod,
};
