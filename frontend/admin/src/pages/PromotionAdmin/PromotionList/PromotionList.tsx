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
      <PromotionListContainer>
        {promotions.map((promotion) => (
          <PromotionItem key={promotion.id} onDeletePromotion={onDeletePromotion} promotion={promotion} />
        ))}
      </PromotionListContainer>
    </>
  );
};

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
