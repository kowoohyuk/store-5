import { DeliveryInfoRepository } from './../repository/delivery.info.repository';
import { INVALID_DATA } from './../constants/client.error.name';
import { GoodsImg } from './../entity/GoodsImg';
import { getConnection } from 'typeorm';
import { Goods } from '../entity/Goods';
import { GoodsRepository } from '../repository/goods.repository';
import {
  DetailGoodsResponse,
  GoodsListResponse,
  GoodsListMetaData,
  TaggedGoodsType,
} from '../types/response/goods.response';
import { WishRepository } from '../repository/wish.repository';
import { FindAllProps, FindTotalCountProps, GoodsState } from '../types/Goods';
import { getTotalPage, pagination } from '../utils/pagination';
import { BadRequestError } from '../errors/client.error';
import { GOODS_DB_ERROR } from '../constants/database.error.name';
import { CreateGoodsBody, GetAllGoodsQuery, UpdateGoodsBody } from '../types/request/goods.request';
import { isBoolean, isNumber, isString } from '../utils/check.primitive.type';
import { GoodsImgRepository } from '../repository/goods.img.repository';
import { CategoryRepository } from '../repository/category.repository';

export const GoodsStateMap: {
  [keyword: string]: GoodsState;
} = {
  sale: 'S',
  temp: 'T',
  destroy: 'D',
};

const INVALID_DISCOUNT_RATE = '할인율은 0~99% 범위 내에서 가능합니다.';
const INVALID_DELIVERY_INFO = '해당 배송 정보는 없는 정보입니다.';
const INVALID_CATEGORY = '유효한 카테고리가 존재하지 않습니다.';
const MIN_DISCOUNT_RATE = 0;
const MAX_DISCOUNT_RATE = 99;
const BEST_SELLING_GOODS_LIMIT = 5;

async function createGoods(body: CreateGoodsBody, uploadFileUrls: string[]): Promise<Goods> {
  await checkValidateCreateGoods(body);
  const { title, category, isGreen, price, stock, state, discountRate, deliveryInfo } = body;

  return await getConnection().transaction(async (transactionalEntityManager) => {
    const goods = await transactionalEntityManager.save(Goods, {
      title,
      price,
      stock,
      discountRate,
      state,
      isGreen,
      category: {
        id: category,
      },
      deliveryInfo: {
        id: deliveryInfo,
      },
      thumbnailUrl: uploadFileUrls[0],
    });

    await Promise.all(
      uploadFileUrls.map(
        async (url) => await transactionalEntityManager.save(GoodsImg, { goods: { id: goods.id }, url })
      )
    );

    return goods;
  });
}

async function updateGoods(body: UpdateGoodsBody, goodsId: number, uploadFileUrls: string[]): Promise<Goods> {
  await checkValidateCreateGoods(body);
  const { title, category, isGreen, price, stock, state, discountRate, deliveryInfo, thumbnailUrl, oldImages } = body;

  if (
    !isString(title) ||
    isGreen === undefined ||
    !isNumber(stock) ||
    !isString(state) ||
    !isNumber(price) ||
    !isNumber(category) ||
    !isNumber(deliveryInfo) ||
    (thumbnailUrl && !isString(thumbnailUrl))
  ) {
    throw new BadRequestError(INVALID_DATA);
  }

  return await getConnection().transaction(async (transactionalEntityManager) => {
    const goods = await transactionalEntityManager.save(Goods, {
      id: goodsId,
      title,
      price,
      stock,
      discountRate,
      state,
      isGreen,
      category: {
        id: category,
      },
      deliveryInfo: {
        id: deliveryInfo,
      },
      thumbnailUrl: thumbnailUrl ?? uploadFileUrls[0],
    });

    if (oldImages) {
      const imgIds = oldImages ? oldImages.split(',').map((img) => Number(img)) : [];
      for (const id of imgIds) {
        if (isNaN(id)) throw new BadRequestError(INVALID_DATA);
      }
      await GoodsImgRepository.deleteGoodsImgByNotInImgIds(transactionalEntityManager, goodsId, imgIds);
    } else {
      await GoodsImgRepository.deleteGoodsImgByGoodsId(transactionalEntityManager, goodsId);
    }

    await Promise.all(
      uploadFileUrls.map(
        async (url) => await transactionalEntityManager.save(GoodsImg, { goods: { id: goods.id }, url })
      )
    );

    return goods;
  });
}

// 비회원은 isWish를 확인하지 않습니다.
async function getDetailById(goodsId: number, userId?: number): Promise<DetailGoodsResponse> {
  const data = await GoodsRepository.getGoodsDetailById(goodsId);
  const imgs = data?.goodsImgs.map((goodsImg) => goodsImg.url);
  const res = JSON.parse(JSON.stringify(data));
  delete res.goodsImgs;
  if (data && userId) {
    res.isWish = (await WishRepository.getWishCountByGoodsIdAndUserId(goodsId, userId)) > 0;
  }
  await GoodsRepository.increaseGoodsViewById(goodsId);
  return { ...res, goodsImgs: imgs };
}

async function getAllGoodsByUserId(page: number, limit: number, userId: number): Promise<GoodsListResponse> {
  if (isNaN(page) || isNaN(limit)) {
    throw new BadRequestError(INVALID_DATA);
  }

  const totalCount = await WishRepository.getWishCountByUserId(userId);
  page = Math.min(getTotalPage(totalCount, limit), page);

  const option: FindAllProps = {
    offset: pagination.calculateOffset(page, limit),
    limit,
    userId,
    order: 'createdAt',
    sort: 'DESC',
    // 찜하기한 상품이므로 재고가 0개인 경우도 보입니다.
    stock: -1,
  };

  const wishSet = new Set(await WishRepository.getWishByUserId(userId));
  const goodsSellCountAverage = await GoodsRepository.getSellCountAverage();
  const goodsList = await GoodsRepository.getAllWishByUserId(option);
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

async function getGoodsByOption(
  query: GetAllGoodsQuery,
  isAdmin: boolean,
  userId?: number
): Promise<GoodsListResponse> {
  const { page, limit, flag = 'create', category: categoryName, keyword: title, sort } = query;
  if (
    !isNumber(page) ||
    !isNumber(limit) ||
    !flag ||
    (categoryName && !isString(categoryName)) ||
    (sort !== 'ASC' && sort !== 'DESC')
  ) {
    throw new BadRequestError(INVALID_DATA);
  }

  const GoodsFlag: {
    [keyword: string]: keyof Goods;
  } = {
    title: 'title',
    price: 'price',
    discount: 'discountRate',
    stock: 'stock',
    sell: 'countOfSell',
    create: 'createdAt',
    update: 'updatedAt',
  };

  const order = GoodsFlag[flag];
  // 관리자는 재고가 0인 상품도 조회 가능
  const stock = isAdmin ? -1 : 0;
  const state = isAdmin ? null : GoodsStateMap.sale;

  const totalCountOption: FindTotalCountProps = {
    stock,
    state,
    title,
  };
  if (categoryName) {
    const category = await CategoryRepository.getCategoryByName(categoryName);
    if (category) {
      totalCountOption.category = category.id;
    }
  }

  const totalCount = await GoodsRepository.getTotalCountByOption(totalCountOption);
  const newPage = Math.min(getTotalPage(totalCount, limit), page);

  const option: FindAllProps = {
    offset: pagination.calculateOffset(newPage, limit),
    limit,
    stock,
    order,
    sort,
    state,
    title,
    category: totalCountOption.category,
  };

  const wishSet = userId && new Set(await WishRepository.getWishByUserId(userId));
  const goodsSellCountAverage = await GoodsRepository.getSellCountAverage();
  const goodsList = await GoodsRepository.getAllByOption(option);

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

async function getMainGoodsListMap(userId?: number): Promise<{
  bestGoodsList: TaggedGoodsType[];
  latestGoodsList: TaggedGoodsType[];
  discountGoodsList: TaggedGoodsType[];
}> {
  const bestProps: FindAllProps = {
    order: 'countOfSell',
    offset: 0,
    sort: 'ASC',
    limit: 4,
    stock: 0,
  };
  const latestProps: FindAllProps = {
    order: 'createdAt',
    offset: 0,
    sort: 'ASC',
    limit: 8,
    stock: 0,
  };
  const discountProps: FindAllProps = {
    order: 'discountRate',
    offset: 0,
    sort: 'ASC',
    limit: 8,
    stock: 0,
  };

  const goodsSellCountAverage = await GoodsRepository.getSellCountAverage();
  const bestGoodsList = await GoodsRepository.getAllByOption(bestProps);
  const latestGoodsList = await GoodsRepository.getAllByOption(latestProps);
  const discountGoodsList = await GoodsRepository.getAllByOption(discountProps);

  const wishSet = userId && new Set(await WishRepository.getWishByUserId(userId));

  bestGoodsList.forEach((goods) => {
    if (wishSet) goods.isWish = wishSet.has(goods.id);
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = isNewGoods(goods.createdAt);
  });

  latestGoodsList.forEach((goods) => {
    if (wishSet) goods.isWish = wishSet.has(goods.id);
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = isNewGoods(goods.createdAt);
  });

  discountGoodsList.forEach((goods) => {
    if (wishSet) goods.isWish = wishSet.has(goods.id);
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = isNewGoods(goods.createdAt);
  });

  return {
    bestGoodsList,
    latestGoodsList,
    discountGoodsList,
  };
}

async function getRandomGoodsList(goodsId: number, categoryName: string, limit: number, userId?: number) {
  if (!isNumber(goodsId) || !isNumber(limit) || !isString(categoryName) || categoryName === 'undefined') {
    throw new BadRequestError(INVALID_DATA);
  }

  const category = await CategoryRepository.getCategoryByName(categoryName);
  if (!category) {
    throw new BadRequestError(INVALID_CATEGORY);
  }

  const wishSet = userId && new Set(await WishRepository.getWishByUserId(userId));
  const goodsSellCountAverage = await GoodsRepository.getSellCountAverage();
  const goodsList = await GoodsRepository.getRandomGoods(goodsId, category.id, limit);

  if (!goodsList) throw new BadRequestError(GOODS_DB_ERROR);

  goodsList.forEach((goods) => {
    if (wishSet) goods.isWish = wishSet.has(goods.id);
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = isNewGoods(goods.createdAt);
  });

  return {
    goodsList,
  };
}

async function getBestSellingGoodsForDashboard(): Promise<Goods[]> {
  return GoodsRepository.getBestSellingGoods(BEST_SELLING_GOODS_LIMIT);
}

async function getGoodsStockById(goodsId: number): Promise<number> {
  return await GoodsRepository.getStockById(goodsId);
}

async function getGoodsImgById(goodsId: number): Promise<
  {
    url: string;
    id: number;
  }[]
> {
  const goodsImgs = await GoodsImgRepository.findGoodsImgById(goodsId);
  return goodsImgs.map((goodsImg) => ({
    id: goodsImg.id,
    url: goodsImg.url,
  }));
}

function isNewGoods(date: Date): boolean {
  const DAY_DIVIDE = 1000 * 60 * 60 * 24;
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

async function checkValidateCreateGoods(body: CreateGoodsBody): Promise<void> {
  const { title, category, isGreen, price, stock, state, discountRate, deliveryInfo } = body;
  if (!title || !state) throw new BadRequestError(INVALID_DATA);

  if (!isBoolean(isGreen)) throw new BadRequestError(INVALID_DATA);

  if (!isNumber(category) || !isNumber(price) || !isNumber(stock) || !isNumber(deliveryInfo))
    throw new BadRequestError(INVALID_DATA);

  if (discountRate < MIN_DISCOUNT_RATE || discountRate > MAX_DISCOUNT_RATE)
    throw new BadRequestError(INVALID_DISCOUNT_RATE);

  const foundDeliveryInfo = await DeliveryInfoRepository.getDeliveryInfoById(deliveryInfo);
  if (!foundDeliveryInfo) throw new BadRequestError(INVALID_DELIVERY_INFO);
}

export const GoodsService = {
  createGoods,
  updateGoods,
  getDetailById,
  getGoodsByOption,
  getAllGoodsByUserId,
  getMainGoodsListMap,
  getGoodsStockById,
  getGoodsImgById,
  getBestSellingGoodsForDashboard,
  getRandomGoodsList,
};
