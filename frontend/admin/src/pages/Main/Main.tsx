import React from 'react';
import { styled } from '@src/lib/CustomStyledComponent';
import TopSellingGoodsList from '@src/pages/Main/TopSellingGoodsList/TopSellingGoodsList';
import CategoryPieChart from '@src/pages/Main/CategoryPieChart/CategoryPieChart';
import LiveOrderList from '@src/pages/Main/LiveOrderList/LiveOrderList';
import TopSellingCategoryList from '@src/pages/Main/TopSellingCategoryList/TopSellingCategoryList';
import CategoryBarChart from '@src/pages/Main/CategoryBarChart/CategoryBarChart';

const Main = () => {
  return (
    <MainContainer>
      <LeftContainer>
        <LeftTopContainer>
          <CategoryPieChart />
          <TopSellingGoodsList />
        </LeftTopContainer>
        <LeftBottomContainer>
          <CategoryBarChart />
          <TopSellingCategoryList />
        </LeftBottomContainer>
      </LeftContainer>
      <RightContainer>
        <LiveOrderList />
      </RightContainer>
    </MainContainer>
  );
};

const MainContainer = styled('div')`
  position: relative;
  display: flex;
  width: 100%;
  min-width: 1280px;
  padding: 32px;
`;

const LeftContainer = styled('div')`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 60%;
  height: 50%;
  row-gap: 1rem;
`;

const LeftTopContainer = styled('div')`
  display: flex;
  width: 100%;
  height: 100%;
  column-gap: 1rem;
`;

const LeftBottomContainer = styled('div')`
  display: flex;
  width: 100%;
  height: 50%;
`;

const RightContainer = styled('div')`
  width: 40%;
  height: 100%;
  column-gap: 1rem;
`;

export default Main;
