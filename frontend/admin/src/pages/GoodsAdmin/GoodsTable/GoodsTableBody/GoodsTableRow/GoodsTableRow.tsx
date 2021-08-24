import React from 'react';
import { styled } from '@src/lib/CustomStyledComponent';
import originStyled from 'styled-components';
import { GoodsItem } from '@src/types/Goods';
import { getDiscountedPrice, getPriceText } from '@src/utils/price';
import { convertYYYYMMDD } from '@src/utils/dateHelper';
import { theme } from '@src/theme/theme';

interface Props {
  goods: GoodsItem;
  handleUpdateGoods: (goods: GoodsItem) => void;
}

interface StateMap {
  [keyword: string]: string;
}

const STATE_MAP: StateMap = {
  S: '판매중',
  T: '임시저장',
  D: '삭제',
};

const GoodsTableRow: React.FC<Props> = ({ goods, handleUpdateGoods }) => {
  const { thumbnailUrl, title, price, discountRate, stock, countOfSell, createdAt, updatedAt, state, category } = goods;
  return (
    <GoodsTableRowContainer onClick={() => handleUpdateGoods(goods)}>
      <TableData>
        <ThumbnailImg src={thumbnailUrl} />
      </TableData>
      <TableData>{title}</TableData>
      <TableData>{getPriceText(price)}원</TableData>
      <TableData>{discountRate}%</TableData>
      <TableData>{stock}</TableData>
      <TableData>{countOfSell}</TableData>
      <TableData>{convertYYYYMMDD(new Date(createdAt))}</TableData>
      <TableData>{convertYYYYMMDD(new Date(updatedAt))}</TableData>
      <TableData>{STATE_MAP[state]}</TableData>
      <TableData>{category.name}</TableData>
    </GoodsTableRowContainer>
  );
};

const GoodsTableRowContainer = originStyled.tr`
  margin-bottom: 0.5rem;
  height: 55px;
  cursor: pointer;
  transition: background-color 0.15s linear;
  :hover {
    background-color: rgba(0, 0, 0, 0.15);
  }
`;
const TableData = styled('td')`
  vertical-align: middle;
`;
const ThumbnailImg = styled('img')`
  width: 40px;
  height: 40px;
`;

export default GoodsTableRow;
