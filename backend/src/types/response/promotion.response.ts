import { Goods } from '../../entity/Goods';

export interface PromotionResponse {
  id: number;
  imgUrl: string;
}

export type PromotionChartResponse = PromotionResponse & {
  view: number;
  goodsId: number;
  title: string;
  goods?: Goods;
};
