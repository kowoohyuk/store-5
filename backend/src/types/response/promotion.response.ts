import { Goods } from '../../entity/Goods';

export interface PromotionResponse {
  id: number;
  imgUrl: string;
  view: number;
  goodsId?: number;
  title?: string;
  goods?: Goods;
}
