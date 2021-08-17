import React from 'react';
import styled from 'styled-components';
import { useParams } from '@src/lib/CustomRouter';
import CategoryGoodsList from '@src/pages/CategoryGoods/CategoryGoodsList/CategoryGoodsList';

const appendQuotationMarks = (text: string) => `"${text}"`;

const CategoryGoods = () => {
  const { category } = useParams();
  const decodeCategoryName = decodeURI(category);
  return (
    <CategoryGoodsContainer>
      <CategoryClassificationLabel>{`상위카테고리 > ${decodeCategoryName}`}</CategoryClassificationLabel>
      <CategoryTitle>{appendQuotationMarks(decodeCategoryName)}</CategoryTitle>
      <CategoryContentContainer>
        <CategoryContentMain>
          <CategoryGoodsList category={decodeCategoryName} />
        </CategoryContentMain>
      </CategoryContentContainer>
    </CategoryGoodsContainer>
  );
};

const CategoryGoodsContainer = styled.div`
  width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CategoryClassificationLabel = styled.p`
  margin-top: 2rem;
  font-size: 16px;
`;

const CategoryTitle = styled.h1`
  align-self: center;
  font-size: 3rem;
  margin: 2rem 0px;
`;

const CategoryContentContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-around;
`;

const CategoryContentMain = styled.main`
  flex-grow: 1;
`;

export default CategoryGoods;
