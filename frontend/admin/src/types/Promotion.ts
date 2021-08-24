export interface Promotion {
  id: number;
  imgUrl: string;
}

export type PromotionChartData = Promotion & {
  view: number;
  title: string;
  goodsId: number;
};
