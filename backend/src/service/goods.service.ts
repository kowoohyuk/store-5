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

// 'best' = 인기, 'low' = 낮은 가격, 'high' = 높은 가격, 'latest' = 최신순
const GoodsFlag: {
  [keyword: string]: keyof Goods;
} = {
  best: 'countOfSell',
  low: 'price',
  high: 'price',
  latest: 'createdAt',
};

const INVALID_DISCOUNT_RATE = '할인율은 0~99% 범위 내에서 가능합니다.';
const INVALID_DELIVERY_INFO = '해당 배송 정보는 없는 정보입니다.';
const MIN_DISCOUNT_RATE = 0;
const MAX_DISCOUNT_RATE = 99;
const BEST_SELLING_GOODS_LIMIT = 5;

async function createGoods(body: CreateGoodsBody, uploadFileUrls: string[]): Promise<Goods> {
  await checkValidateCreateGoods(body);
  const { title, category, isGreen, price, stock, state, discountRate, deliveryInfo } = body;

  if (
    !title ||
    isGreen === undefined ||
    isNumber(body.stock) ||
    !state ||
    isNaN(body.price) ||
    isNaN(body.category) ||
    isNaN(body.deliveryInfo)
  ) {
    throw new BadRequestError(INVALID_DATA);
  }

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
      thumbnailUrl: oldImages?.length ? thumbnailUrl : uploadFileUrls[0],
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
  const data = await GoodsRepository.findGoodsDetailById(goodsId);
  const imgs = data?.goodsImgs.map((goodsImg) => goodsImg.url);
  const res = JSON.parse(JSON.stringify(data));
  delete res.goodsImgs;
  if (data && userId) {
    res.isWish = (await WishRepository.findWishCountByGoodsIdAndUserId(goodsId, userId)) > 0;
  }
  await GoodsRepository.increaseGoodsViewById(goodsId);
  return { ...res, goodsImgs: imgs };
}

async function getAllGoodsByUserId(page: number, limit: number, userId: number): Promise<GoodsListResponse> {
  if (isNaN(page) || isNaN(limit)) {
    throw new BadRequestError(INVALID_DATA);
  }

  const totalCount = await WishRepository.findWishCountByUserId(userId);
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
  const state = isAdmin ? GoodsStateMap.sale : null;

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

  const totalCount = await GoodsRepository.findTotalCountByOption(totalCountOption);
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

  const wishSet = userId && new Set(await WishRepository.findWishByUserId(userId));
  const goodsSellCountAverage = await GoodsRepository.findSellCountAverage();
  const goodsList = await GoodsRepository.findAllByOption(option);

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

  const bestGoodsList = await GoodsRepository.findAllByOption(bestProps);
  const latestGoodsList = await GoodsRepository.findAllByOption(latestProps);
  const discountGoodsList = await GoodsRepository.findAllByOption(discountProps);
  if (userId) {
    const wishSet = new Set(await WishRepository.findWishByUserId(userId));
    if (wishSet) {
      bestGoodsList.forEach((goods) => (goods.isWish = wishSet.has(goods.id)));
      latestGoodsList.forEach((goods) => (goods.isWish = wishSet.has(goods.id)));
      discountGoodsList.forEach((goods) => (goods.isWish = wishSet.has(goods.id)));
    }
  }
  return {
    bestGoodsList,
    latestGoodsList,
    discountGoodsList,
  };
}

async function getBestSellingGoodsForDashboard(): Promise<Goods[]> {
  return GoodsRepository.findBestSellingGoods(BEST_SELLING_GOODS_LIMIT);
}

async function getGoodsStockById(goodsId: number): Promise<number> {
  return await GoodsRepository.findStockById(goodsId);
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
};
