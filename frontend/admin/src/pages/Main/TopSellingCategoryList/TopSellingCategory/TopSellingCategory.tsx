import { theme } from '@src/theme/theme';
import convertCountOfSell from '@src/utils/convertCountOfSell';
import React from 'react';
import styled from 'styled-components';

interface Props {
  category: { name: string; total: number };
  rank: number;
}

const TopSellingCategory: React.FC<Props> = ({ category, rank }) => {
  const BGCOLOR = [theme.GOLD, theme.SILVER, theme.BRONZE, 'transparent', 'transparent'];
  return (
    <TopSellingCategoryContainer>
      <TopSellingInfoContainer>
        <TopSellingRank bgcolor={BGCOLOR[rank - 1]}>{rank}</TopSellingRank>
        <TopSellingCategoryTitle>{category.name}</TopSellingCategoryTitle>
      </TopSellingInfoContainer>
      <TopSellingCategoryCountContainer>
        <TopSellingCategoryCount color={theme.greenColor}>{convertCountOfSell(category.total)}</TopSellingCategoryCount>
        개
      </TopSellingCategoryCountContainer>
    </TopSellingCategoryContainer>
  );
};

const TopSellingCategoryContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TopSellingInfoContainer = styled.div`
  display: flex;
  font-size: 14px;
  grid-gap: 1.5rem;
  align-items: center;
`;

const TopSellingRank = styled.div<{ bgcolor: string }>`
  background-color: ${(props) => props.bgcolor};
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1.6em;
  height: 1.6em;
  font-size: 11px;
  border-radius: 50%;
`;
const TopSellingCategoryTitle = styled.p`
  font-weight: 600;
  color: #555;
  font-size: 14px;
`;

const TopSellingCategoryCountContainer = styled.div`
  font-size: 12px;
`;
const TopSellingCategoryCount = styled.span<{ color: string }>`
  font-weight: 600;
  font-size: 16px;
  padding-right: 4px;
  color: ${(props) => props.color};
`;

export default TopSellingCategory;
