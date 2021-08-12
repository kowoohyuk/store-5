import React from 'react';
import styled from 'styled-components';
import { ThumbnailGoods } from '@src/types/Goods';
import GoodsSection from '@src/components/GoodsSection/GoodsSection';
import PromotionCarousel from '@src/components/PromotionCarousel/PromotionCarousel';
import { Promotion } from '@src/types/Promotion';

const mockProductImagePath =
  'https://user-images.githubusercontent.com/20085849/128866958-900ad32a-cd32-4b97-be79-1dbbc9dcb02d.jpeg';

const mock_best_products: ThumbnailGoods[] = [
  { id: 1, thumbnailImg: mockProductImagePath, title: '맥쥬짠', price: 10000, isGreen: true, isBest: true },
  { id: 2, thumbnailImg: mockProductImagePath, title: '맥쥬짠', price: 10000, isNew: true },
  { id: 3, title: 'NoImage 맥쥬짠', price: 10000, isSale: true, discountRate: 20 },
  { id: 4, thumbnailImg: mockProductImagePath, title: '맥쥬짠', price: 10000 },
];

const mock_new_products: ThumbnailGoods[] = [
  {
    id: 1,
    thumbnailImg: mockProductImagePath,
    title: '맥쥬짠',
    price: 10000,
    isNew: true,
    isGreen: true,
    isBest: true,
  },
  {
    id: 2,
    thumbnailImg: mockProductImagePath,
    title: '맥쥬짠',
    price: 10000,
    isNew: true,
    isSale: true,
    discountRate: 20,
  },
  {
    id: 3,
    thumbnailImg: mockProductImagePath,
    title: '맥쥬짠',
    price: 10000,
    isNew: true,
    isSale: true,
    discountRate: 20,
  },
  { id: 4, thumbnailImg: mockProductImagePath, title: '맥쥬짠', price: 10000, isNew: true },
  { id: 5, thumbnailImg: mockProductImagePath, title: '맥쥬짠', price: 10000, isNew: true },
  { id: 6, thumbnailImg: mockProductImagePath, title: '맥쥬짠', price: 10000, isNew: true },
  { id: 7, thumbnailImg: mockProductImagePath, title: '맥쥬짠', price: 10000, isNew: true },
  { id: 8, thumbnailImg: mockProductImagePath, title: '맥쥬짠', price: 10000, isNew: true },
];

const mock_promotions: Promotion[] = [
  {
    id: 1,
    imgUrl: 'https://user-images.githubusercontent.com/20085849/128992411-3b983b09-b0af-408a-bf56-4bde93c4b543.gif',
    goodsId: 1,
  },
  {
    id: 2,
    imgUrl: 'https://user-images.githubusercontent.com/20085849/128992519-06368afd-3f31-459d-9050-101e730e304d.gif',
    goodsId: 2,
  },
  {
    id: 3,
    imgUrl: 'https://user-images.githubusercontent.com/20085849/128992450-eb086cff-3b2a-4d4a-8b01-e3a8a8eaa754.gif',
    goodsId: 3,
  },
];

const Main = () => (
  <>
    <PromotionCarousel promotions={mock_promotions} />
    <MainContentContainer>
      <GoodsSection sectionTitle='잘나가요' goodsList={mock_best_products} />
      <GoodsSection sectionTitle='새로 나왔어요' goodsList={mock_new_products} />
    </MainContentContainer>
  </>
);

const MainContentContainer = styled.div`
  width: 1200px;
  margin: 0 auto;
`;

export default Main;
