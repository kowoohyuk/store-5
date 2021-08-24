import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import GoodsSection from '@src/components/GoodsSection/GoodsSection';
import CategoryFlag from '@src/pages/CategoryGoods/CategoryGoodsList/CategoryFlag';
import Paginator from '@src/components/Paginator/Paginator';
import { GoodsPaginationResult } from '@src/types/Goods';
import { getGoodsByCategory, GetGoodsByCategoryProps } from '@src/apis/goodsAPI';
import useScrollToTop from '@src/hooks/useScrollToTop';

interface Props {
  category: string;
}

const GoodsFlag = {
  best: 'sell',
  latest: 'create',
  low: 'low_price',
  high: 'high_price',
};

const flags = [
  { label: GoodsFlag.best, text: '인기순' },
  { label: GoodsFlag.latest, text: '신규순' },
  { label: GoodsFlag.low, text: '낮은 가격순' },
  { label: GoodsFlag.high, text: '높은 가격순' },
];

const LIMIT_COUNT_ITEMS_IN_PAGE = 8;
const DEFAULT_START_PAGE = 1;

const getOrderByOption = (flag: string) => (flag === 'low_price' ? 'ASC' : 'DESC');

const convertAPIFlag = (flag: string) => (flag === 'low_price' || flag === 'high_price' ? 'price' : flag);

const CategoryGoodsList: React.FC<Props> = ({ category }) => {
  const [goodsListMap, setGoodsListMap] = useState<GoodsPaginationResult | null>(null);
  const [searchQuery, setSearchQuery] = useScrollToTop<GetGoodsByCategoryProps>({
    categoryName: category,
    page: DEFAULT_START_PAGE,
    flag: GoodsFlag.latest,
  });

  const fetchGoodsList = async () => {
    try {
      const data = await getGoodsByCategory({
        ...searchQuery,
        limit: LIMIT_COUNT_ITEMS_IN_PAGE,
        sort: getOrderByOption(searchQuery.flag),
        flag: convertAPIFlag(searchQuery.flag),
      });
      setGoodsListMap(data.result);
    } catch (e) {
      setGoodsListMap(null);
    }
  };

  const setSearchFlag = (flag: string) => {
    setSearchQuery({
      ...searchQuery,
      page: DEFAULT_START_PAGE,
      flag,
    });
  };

  const setCategory = (category: string) => {
    setSearchQuery({
      ...searchQuery,
      page: DEFAULT_START_PAGE,
      categoryName: category,
    });
  };

  const setPage = (page: number) => {
    setSearchQuery({
      ...searchQuery,
      page,
    });
  };

  useEffect(() => {
    fetchGoodsList();
  }, [searchQuery]);

  useEffect(() => {
    setCategory(category);
  }, [category]);

  return (
    // TODO: Empty UI 필요
    goodsListMap && (
      <CategoryGoodsListContainer>
        <CategoryGoodsListHeader>
          <CategoryGoodsListCount>총 {goodsListMap.meta.totalCount}개</CategoryGoodsListCount>
          <CategoryFlagContainer>
            {flags.map((flag) => (
              <CategoryFlag
                key={flag.label}
                flagLabel={flag.label}
                flagText={flag.text}
                active={flag.label === searchQuery.flag}
                setSearchFlag={setSearchFlag}
              />
            ))}
          </CategoryFlagContainer>
        </CategoryGoodsListHeader>
        <GoodsSection goodsList={goodsListMap.goodsList} itemBoxSize='big' />
        <Paginator totalPage={goodsListMap.meta.totalPage} currentPage={goodsListMap.meta.page} setPage={setPage} />
      </CategoryGoodsListContainer>
    )
  );
};

const CategoryGoodsListContainer = styled.div`
  width: 100%;
`;

const CategoryGoodsListHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-size: 16px;
`;

const CategoryGoodsListCount = styled.div`
  width: 20%;
`;

const CategoryFlagContainer = styled.div`
  display: flex;
  width: 80%;
  justify-content: flex-end;
  column-gap: 1.25rem;
`;

export default CategoryGoodsList;
