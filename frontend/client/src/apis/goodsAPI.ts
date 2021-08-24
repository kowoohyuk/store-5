import { DetailGoods, GoodsPaginationResult, MainGoodsListResult, ThumbnailGoods } from '@src/types/Goods';
import { APIResponse, checkedFetch } from './base';

export interface GetGoodsByCategoryProps {
  categoryName: string;
  page: number;
  flag: string;
  sort?: 'ASC' | 'DESC';
  limit?: number;
}

// TODO: 상품 수가 충분해지면 페이지당 상품 수 조정
const DEFAULT_GOODS_LIMIT = 5;

const DEFAULT_SORT = 'DESC';

export const getGoodsByCategory = async ({
  categoryName,
  page,
  flag,
  sort = DEFAULT_SORT,
  limit = DEFAULT_GOODS_LIMIT,
}: GetGoodsByCategoryProps): Promise<APIResponse<GoodsPaginationResult>> => {
  const res = await checkedFetch(
    `/api/goods/category?category=${categoryName}&flag=${flag}&limit=${limit}&sort=${sort}&page=${page}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );
  return await res.json();
};

export interface GetGoodsByKeywordProps {
  keyword: string;
  page: number;
  limit?: number;
  sort?: 'ASC' | 'DESC';
}

export const getGoodsByKeyword = async ({
  keyword,
  page,
  sort = DEFAULT_SORT,
  limit = DEFAULT_GOODS_LIMIT,
}: GetGoodsByKeywordProps): Promise<APIResponse<GoodsPaginationResult>> => {
  const res = await checkedFetch(`/api/goods/keyword?keyword=${keyword}&limit=${limit}&sort=${sort}&page=${page}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
};

export const getMainGoodsListMap = async (): Promise<APIResponse<MainGoodsListResult>> => {
  const res = await checkedFetch(`/api/goods/main`, {
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
};

export const getGoodsDetail = async (goodsId: number): Promise<APIResponse<DetailGoods>> => {
  const res = await checkedFetch(`/api/goods/${goodsId}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
};

export const getGoodsStockCount = async (goodsId: number): Promise<APIResponse<number>> => {
  const res = await checkedFetch(`/api/goods/${goodsId}/stock`, {
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
};

// 같은 카테고리인 상품을 4개까지 가져옴
export const getRelationGoods = async (categoryName: string): Promise<APIResponse<GoodsPaginationResult>> => {
  const RELATION_LIMIT = 4;
  const res = await checkedFetch(
    `/api/goods/category?category=${categoryName}&sort=${DEFAULT_SORT}&limit=${RELATION_LIMIT}&page=1`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );
  return await res.json();
};

export interface GetMyWishGoodsProps {
  page: number;
  limit?: number;
}

export const getMyWishGoods = async ({
  page,
  limit = DEFAULT_GOODS_LIMIT,
}: GetMyWishGoodsProps): Promise<APIResponse<GoodsPaginationResult>> => {
  const res = await checkedFetch(`/api/user/wish?limit=${limit}&page=${page}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
};
