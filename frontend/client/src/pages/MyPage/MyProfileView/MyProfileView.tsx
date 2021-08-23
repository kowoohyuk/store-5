import React, { useEffect, useState } from 'react';
import Topic from '@src/components/Topic/Topic';
import styled from 'styled-components';
import useUserState from '@src/hooks/useUserState';
import { getCarts } from '@src/apis/cartAPI';
import { usePushToast } from '@src/lib/ToastProvider/ToastProvider';
import { getMyWishGoods } from '@src/apis/goodsAPI';
import { getOrders } from '@src/apis/orderAPI';
import HighlightedText from '@src/components/HighlightedText/HighlightedText';
import { usePushHistory } from '@src/lib/CustomRouter';

const MyProfileView = () => {
  const [userState] = useUserState();
  const [countOfCart, setCountOfCart] = useState<number>(0);
  const [countOfWish, setCountOfWish] = useState<number>(0);
  const [countOfOrder, setCountOfOrder] = useState<number>(0);
  const pushToast = usePushToast();
  const pushLocation = usePushHistory();

  const fetchWishData = async () => {
    try {
      const {
        result: { meta },
      } = await getMyWishGoods({ page: 0 }); // 여기서 Page 값은 의미없음.
      setCountOfWish(meta.totalCount);
    } catch (err) {
      pushToast({
        text: '찜 데이터 수를 가져오는데 실패했습니다.',
      });
    }
  };
  const fetchCartData = async () => {
    try {
      const { result } = await getCarts();
      setCountOfCart(result.length);
    } catch (err) {
      pushToast({
        text: '장바구니 데이터 수를 가져오는데 실패했습니다.',
      });
    }
  };
  const fetchOrderData = async () => {
    try {
      // TODO:(jiho) Goods 페이지네이션이랑 API 함수 인터페이스 형식 통일시켜야합니다.
      const {
        result: { meta },
      } = await getOrders(0, 1); // 여기서 Page 값은 의미없음.
      setCountOfOrder(meta.totalCount);
    } catch (err) {
      pushToast({
        text: '주문 데이터 수를 가져오는데 실패했습니다.',
      });
    }
  };

  useEffect(() => {
    fetchCartData();
    fetchWishData();
    fetchOrderData();
  }, []);

  return (
    <MyProfileViewContainer>
      <Topic>{userState.name}님의 정보</Topic>
      <div>
        <p>여기에 사용자 정보를 나타낼 수 있으면 좋을 듯합니다. 현재 데이터가 없어서 보여 줄게 없습니다.</p>
      </div>
      <Topic>상품관련 활동</Topic>
      <SummarySection>
        <SummaryCard onClick={() => pushLocation('/cart')}>
          <p>장바구니</p>
          <p>{countOfCart}</p>
        </SummaryCard>
        <SummaryCard onClick={() => pushLocation('/mypage/wish')}>
          <p>찜 리스트</p>
          <p>{countOfWish}</p>
        </SummaryCard>
        <SummaryCard onClick={() => pushLocation('/mypage/order')}>
          <p>주문 리스트</p>
          <p>{countOfOrder}</p>
        </SummaryCard>
      </SummarySection>
    </MyProfileViewContainer>
  );
};

const MyProfileViewContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SummarySection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const SummaryCard = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
  width: 150px;
  height: 150px;
  margin-left: 1rem;
  font-size: 1.5rem;
`;

export default MyProfileView;
