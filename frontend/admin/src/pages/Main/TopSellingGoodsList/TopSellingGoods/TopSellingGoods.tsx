import originStyled from 'styled-components';
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
  const BGCOLOR = [theme.GOLD, theme.SILVER, theme.BRONZE, 'transparent', 'transparent'];
  return (
    <TopSellingGoodsContainer>
      <TopSellingGoodsImage src={item.thumbnailUrl} />
      <TopSellingGoodsTitle>{item.title}</TopSellingGoodsTitle>
      <SellingGoodsCountContainer>
        <TopSellingGoodsCount color={theme.greenColor}> {convertCountOfSell(item.countOfSell)}</TopSellingGoodsCount>개
      </SellingGoodsCountContainer>
      <TopSellingRank bgcolor={BGCOLOR[rank - 1]}>{rank}</TopSellingRank>
    </TopSellingGoodsContainer>
  );
};

const TopSellingGoodsContainer = originStyled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  cursor:pointer;
  &:after {
    transition: transform 0.15s linear;
    position: absolute;
    content: '';
    width: 100%;
    height: 1px;
    bottom: 0;
    left: 0;
    border-bottom: 1px solid ${theme.black6};
    transform: scale(0);
  }
  &:hover:after {
    transform: scale(1);
  }
`;
const TopSellingGoodsImage = styled('img')`
  width: 40px;
  height: 40px;
  max-height: 100%;
  object-fit: cover;
  border-radius: 2px;
`;

const TopSellingGoodsTitle = styled('p')`
  width: 70%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: start;
  color: #555;
  font-weight: 600;
  font-size: 14px;
`;

const SellingGoodsCountContainer = styled('div')`
  font-size: 12px;
`;

const TopSellingGoodsCount = styled('span')<{ color: string }>`
  font-weight: 600;
  font-size: 16px;
  padding-right: 4px;
  color: ${(props) => props.color};
`;

const TopSellingRank = originStyled.div<{ bgcolor: string }>`
  position: absolute;
  top: 0px;
  left: -10px;
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
