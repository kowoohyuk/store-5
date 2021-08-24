import { styled } from '@src/lib/CustomStyledComponent';
import PromotionItem from '@src/pages/PromotionAdmin/PromotionList/PromotionItem/PromotionItem';
import { theme } from '@src/theme/theme';
import { Promotion } from '@src/types/Promotion';
import React from 'react';

interface Props {
  promotions: Promotion[];
  onDeletePromotion: (promotionId: number) => Promise<void>;
}

const PromotionList: React.FC<Props> = ({ promotions, onDeletePromotion }) => {
  return (
    <>
      {/* <PromotionSpan color={theme.greenColor}>{`등록된 프로모션 ${promotions.length}건`}</PromotionSpan> */}
      <PromotionListContainer>
        {promotions.map((promotion) => (
          <PromotionItem key={promotion.id} onDeletePromotion={onDeletePromotion} promotion={promotion} />
        ))}
      </PromotionListContainer>
    </>
  );
};

const PromotionCounterContainer = styled('div')`
  margin-left: 5%;
  margin-top: 3%;
  margin-bottom: 2%;
`;

const PromotionSpan = styled('span')<{ color: string }>`
  color: ${(props) => props.color};
  font-weight: 700;
  font-size: 1.2em;
  margin-right: 12px;
`;

const PromotionListContainer = styled('ul')`
  position: relative;
  display: flex;
  width: 100%;
  margin: auto;
  flex-wrap: wrap;
  overflow: auto;
  padding: 16px;
`;

export default PromotionList;
