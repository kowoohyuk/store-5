import React, { useCallback, useEffect, useState } from 'react';
import { GetGoodsByOptionProps } from '@src/types/Goods';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import styled from 'styled-components';
import { theme } from '@src/theme/theme';

interface Props {
  text: string;
  flag?: string;
  handleOrderAndSortGoods: (flag: string, sort: Sort) => void;
  searchQuery?: GetGoodsByOptionProps;
}

type Sort = 'ASC' | 'DESC';

const ASC = 'ASC';
const DESC = 'DESC';

const reverseSort = (sort: Sort) => (sort === ASC ? DESC : ASC);

const initialState = (): { active: boolean; sort: Sort } => ({ active: false, sort: ASC });

const GoodsTableHeadData: React.FC<Props> = ({ text, flag, handleOrderAndSortGoods, searchQuery }) => {
  const [sortState, setSortState] = useState(initialState());
  const handleClick = useCallback(() => {
    setSortState({ active: true, sort: reverseSort(sortState.sort) });
  }, [sortState]);

  useEffect(() => {
    if (flag && sortState.active) {
      handleOrderAndSortGoods(flag, sortState.sort);
    }
  }, [sortState]);

  useEffect(() => {
    searchQuery?.flag !== flag && setSortState(initialState());
  }, [searchQuery]);

  return (
    <GoodsTableHeadDataContainer active={sortState.active}>
      {flag ? (
        <SortButton onClick={handleClick}>
          <ButtonText>{text}</ButtonText>
          {sortState.sort === ASC ? <FaAngleDown /> : <FaAngleUp />}
        </SortButton>
      ) : (
        text
      )}
    </GoodsTableHeadDataContainer>
  );
};

const GoodsTableHeadDataContainer = styled.th<{ active: boolean }>`
  padding: 4px;
  vertical-align: middle;
  ${(props) => props.active && `color : ${theme.primary}`}
`;

const SortButton = styled.button`
  border: 0;
  font-size: 14px;
  font-weight: 600;
  padding: 0.25rem;
  background-color: transparent;
  cursor: pointer;
`;

const ButtonText = styled.span`
  display: inline-block;
  margin-right: 0.25rem;
`;

export default GoodsTableHeadData;
