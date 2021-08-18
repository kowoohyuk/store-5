import { DeliveryInfo } from './../../entity/DeliveryInfo';
import { Response } from 'express';
import { Goods } from '../../entity/Goods';

export interface GoodsListMetaData {
  page: number;
  limit: number;
  totalPage: number;
  totalCount: number;
}

export type TaggedGoodsType = Goods & {
  isNew?: boolean;
  isBest?: boolean;
  isGreen?: boolean;
  isWish?: boolean;
};

export type DetailGoodsResponse = Response &
  TaggedGoodsType & {
    goodsImgs: string[] | undefined;
    deliveryInfo: DeliveryInfo;
  };

export interface GoodsListResponse {
  meta?: GoodsListMetaData;
  goodsList?: TaggedGoodsType[];
}

export type BestGoodsType = Goods & {
  sellCount: number;
};
