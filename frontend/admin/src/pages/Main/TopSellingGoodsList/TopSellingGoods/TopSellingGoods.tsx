import { styled } from '@src/lib/CustomStyledComponent';
import { theme } from '@src/theme/theme';
import convertCountOfSell from '@src/utils/convertCountOfSell';
import React from 'react';

interface Props {
  item: {
    thumbnailUrl: string;
    title: string;
    countOfSell: number;
  };
  rank: number;
}

const TopSellingGoods: React.FC<Props> = ({ item, rank }) => {
  return (
    <TopSellingGoodsContainer>
      <TopSellingGoodsImage src={item.thumbnailUrl} />
      <TopSellingGoodsTitle>{item.title}</TopSellingGoodsTitle>
      <SellingGoodsCountContainer bgcolor={theme.greenColor}>
        <TopSellingGoodsCount> {convertCountOfSell(item.countOfSell)}</TopSellingGoodsCount>
      </SellingGoodsCountContainer>
      <TopSellingRank bgcolor={theme.greenColor}>{rank + 1}</TopSellingRank>
    </TopSellingGoodsContainer>
  );
};

const TopSellingGoodsContainer = styled('div')`
  position: relative;
  display: flex;
  align-items: center;
  height: 15%;
  width: 100%;
  margin-bottom: 16px;
`;
const TopSellingGoodsImage = styled('img')`
  width: 64px;
  height: 64px;
  margin-right: 16px;
  object-fit: cover;
  border-radius: 2px;
`;

const TopSellingGoodsTitle = styled('p')`
  width: 60%;

  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: start;
  color: #555;
  font-weight: 600;
  font-size: 14px;
`;

const SellingGoodsCountContainer = styled('div')<{ bgcolor: string }>`
  padding: 0.5em;
  background-color: ${(props) => props.bgcolor};
  border-radius: 12px;
`;

const TopSellingGoodsCount = styled('span')`
  color: #fff;
`;

const TopSellingRank = styled('div')<{ bgcolor: string }>`
  position: absolute;
  top: -5px;
  left: -5px;
  background-color: ${(props) => props.bgcolor};
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1.6em;
  height: 1.6em;
  border-radius: 50%;
  font-size: 11px;
`;

export default TopSellingGoods;
