import React from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { styled } from '@src/lib/CustomStyledComponent';
import GoodsTableHeadData from '@src/pages/GoodsAdmin/GoodsTable/GoodsTableHead/GoodsTableHeadData/GoodsTableHeadData';
import { GetGoodsByOptionProps } from '@src/types/Goods';

interface Props {
  handleOrderAndSortGoods: (order: string, sort: 'ASC' | 'DESC') => void;
  searchQuery: GetGoodsByOptionProps;
}

const GoodsTableHead: React.FC<Props> = ({ handleOrderAndSortGoods, searchQuery }) => {
  return (
    <GoodsTableHeadContainer>
      <TableRow>
        <GoodsTableHeadData text={'썸네일'} handleOrderAndSortGoods={handleOrderAndSortGoods} />
        <GoodsTableHeadData
          text={'상품명'}
          searchQuery={searchQuery}
          handleOrderAndSortGoods={handleOrderAndSortGoods}
          order={'title'}
        />
        <GoodsTableHeadData
          text={'금액'}
          searchQuery={searchQuery}
          handleOrderAndSortGoods={handleOrderAndSortGoods}
          order={'price'}
        />
        <GoodsTableHeadData
          text={'할인율'}
          searchQuery={searchQuery}
          handleOrderAndSortGoods={handleOrderAndSortGoods}
          order={'discountRate'}
        />
        <GoodsTableHeadData
          text={'재고'}
          searchQuery={searchQuery}
          handleOrderAndSortGoods={handleOrderAndSortGoods}
          order={'stock'}
        />
        <GoodsTableHeadData
          text={'판매량'}
          searchQuery={searchQuery}
          handleOrderAndSortGoods={handleOrderAndSortGoods}
          order={'countOfSell'}
        />
        <GoodsTableHeadData
          text={'상품 등록일'}
          searchQuery={searchQuery}
          handleOrderAndSortGoods={handleOrderAndSortGoods}
          order={'createdAt'}
        />
        <GoodsTableHeadData
          text={'최종 수정일'}
          handleOrderAndSortGoods={handleOrderAndSortGoods}
          order={'updatedAt'}
        />
        <GoodsTableHeadData text={'상태'} handleOrderAndSortGoods={handleOrderAndSortGoods} />
        <GoodsTableHeadData text={'카테고리'} handleOrderAndSortGoods={handleOrderAndSortGoods} />
      </TableRow>
    </GoodsTableHeadContainer>
  );
};

const GoodsTableHeadContainer = styled('thead')`
  font-weight: 600;
  font-size: 14px;
  height: 40px;
`;

const TableRow = styled('tr')``;

export default GoodsTableHead;
