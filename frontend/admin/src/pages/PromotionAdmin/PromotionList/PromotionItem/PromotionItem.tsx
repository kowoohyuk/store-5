import { styled } from '@src/lib/CustomStyledComponent';
import ConfirmModal from '@src/portal/ConfirmModal/ConfirmModal';
import { theme } from '@src/theme/theme';
import { Promotion } from '@src/types/Promotion';
import { FaTimes } from 'react-icons/fa';
import React, { useCallback, useState } from 'react';
import PromotionAPI from '@src/apis/promotionAPI';

const PROMOTION_DELETE_MESSAGE = '해당 프로모션을 삭제하시겠습니까?';

interface Props {
  promotion: Promotion;
  onDeletePromotion: (promotionId: number) => Promise<void>;
}

const PromotionItem: React.FC<Props> = ({ promotion, onDeletePromotion }) => {
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  const handleOpenDeleteModal = useCallback(() => {
    setOpenDeleteModal(true);
  }, [setOpenDeleteModal]);

  const handleCloseDeleteModal = useCallback(() => {
    setOpenDeleteModal(false);
  }, [setOpenDeleteModal]);

  const handleDeletePromotion = useCallback(async () => {
    try {
      onDeletePromotion(promotion.id);
      handleCloseDeleteModal();
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <PromotionContainer>
      <PromotionImage src={promotion.imgUrl} />
      <PromotionDeleteButton onClick={handleOpenDeleteModal} bgcolor={theme.greenColor}>
        <FaTimes />
      </PromotionDeleteButton>
      {openDeleteModal && (
        <ConfirmModal
          title={PROMOTION_DELETE_MESSAGE}
          onConfirm={handleDeletePromotion}
          onClose={handleCloseDeleteModal}
        />
      )}
    </PromotionContainer>
  );
};

const PromotionContainer = styled('div')`
  position: relative;
  width: 50%;
  height: 300px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const PromotionImage = styled('img')`
  width: 100%;
  height: 300px;
  border-radius: 10px;
`;

const PromotionDeleteButton = styled('button')<{ bgcolor: string }>`
  position: absolute;
  display: flex;
  align-items: center;
  top: 10px;
  right: 10px;
  font-size: 1.5em;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  background-color: ${(props) => props.bgcolor};
  color: white;
  border: none;
  cursor: pointer;
`;

export default PromotionItem;
