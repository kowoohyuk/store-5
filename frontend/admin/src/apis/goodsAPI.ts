import { GoodsItem } from './../types/Goods';
import { APIResponse, checkedFetch } from '@src/apis/base';
import { CreatedGoods, GetGoodsByOptionProps, GoodsPaginationResult } from '@src/types/Goods';
import { GoodsImg } from '@src/types/GoodsImg';

const createGoods = async (formData: FormData): Promise<APIResponse<CreatedGoods>> => {
  const res = await checkedFetch(`/api/goods`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return await res.json();
};

const updateGoods = async (formData: FormData, goodsId: number): Promise<APIResponse<CreatedGoods>> => {
  const res = await checkedFetch(`/api/goods/${goodsId}`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return await res.json();
};

const DEFAULT_LIMIT = 10;

export const getGoodsByOption = async (option: GetGoodsByOptionProps): Promise<APIResponse<GoodsPaginationResult>> => {
  const res = await checkedFetch(getGoodsOptionURL(option), {
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
};

const getGoodsImgById = async (goodsId: number): Promise<APIResponse<GoodsImg[]>> => {
  const res = await checkedFetch(`/api/goods/${goodsId}/img`, {
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
};

const getBestSellingGoodsForDashboard = async (): Promise<APIResponse<GoodsItem[]>> => {
  const res = await checkedFetch(`/api/goods/dashboard/best`, {
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
};

const getGoodsOptionURL = ({
  page,
  limit = DEFAULT_LIMIT,
  keyword = '',
  flag = 'create',
  sort = 'ASC',
}: GetGoodsByOptionProps): string => {
  return `/api/goods/admin?page=${page}&limit=${limit}${keyword ? `&keyword=${keyword}` : ''}${
    flag ? `&flag=${flag}` : ''
  }${sort ? `&sort=${sort}` : ''}`;
};

export const GoodsAPI = {
  createGoods,
  updateGoods,
  getGoodsByOption,
  getGoodsImgById,
  getBestSellingGoodsForDashboard,
};
