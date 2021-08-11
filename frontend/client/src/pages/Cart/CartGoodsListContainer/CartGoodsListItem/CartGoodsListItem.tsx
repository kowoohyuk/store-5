import React from 'react';
import styled from 'styled-components';
import CheckButton from 'src/components/CheckButton/CheckButton';
import { CartGoods } from 'src/types/CartGoods';
import { BiTrash } from 'react-icons/bi';
import CartGoodsAmountInput from './CartGoodsAmountInput/CartGoodsAmountInput';

const Wrapper = styled.div`
  padding: 1rem 0rem;
  display: flex;
  gap: 0.5rem;

  border-bottom: 1px dashed #ddd;
`;
const ThumbnailImg = styled.img`
  width: 8rem;
  height: 8rem;
`;
const GoodsTitle = styled.h2`
  flex: 1;
  padding: 0;
  margin: 0;
  font-size: 1.125rem;
  font-weight: normal;
`;
const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
`;
const PriceText = styled.span`
  font-size: 1rem;
  font-weight: bolder;
`;
const DeleteButton = styled.button`
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
`;

interface Props {
  cartGoods: CartGoods;
}

const CartGoodsListItem: React.FC<Props> = ({ cartGoods }) => {
  const { id, thumbnailUrl, title, price, discountRate, amount, isSelected } = cartGoods;

  const handleChangeAmount = (amount: number) => {
    console.log(id, amount);
  };

  const handleDeleteCartGoods = () => {
    console.log(id);
  };

  const handleChangeIsSelected = () => {
    console.log(id, !isSelected);
  };

  return (
    <Wrapper>
      <CheckButton value={isSelected} onClick={handleChangeIsSelected} />
      <ThumbnailImg src={thumbnailUrl} />
      <GoodsTitle>{title}</GoodsTitle>
      <FlexColumn>
        <DeleteButton onClick={handleDeleteCartGoods}>
          <BiTrash size='1.5rem' color='#ccc' />
        </DeleteButton>
        {/* TODO: 모달 */}
        <CartGoodsAmountInput value={amount} onChangeAmount={handleChangeAmount} />
        <PriceText>{price}원</PriceText>
        {/* TODO: discountRate를 적용하기 */}
      </FlexColumn>
    </Wrapper>
  );
};

export default CartGoodsListItem;
