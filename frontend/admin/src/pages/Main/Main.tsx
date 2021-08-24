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
  background-color: #eee;
`;

const LeftContainer = styled('div')`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 60%;
  height: 100%;
  justify-content: space-around;
  row-gap: 2rem;
`;

const LeftTopContainer = styled('div')`
  display: flex;
  width: 100%;
  height: calc(50% - 1rem);
  column-gap: 2rem;
`;

const LeftBottomContainer = styled('div')`
  display: flex;
  width: 100%;
  height: calc(50% - 1rem);
  column-gap: 2rem;
`;

const RightContainer = styled('div')`
  width: 40%;
  height: 100%;
  padding-left: 2rem;
`;

export default Main;
