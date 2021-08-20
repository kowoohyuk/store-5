import { styled } from '@src/lib/CustomStyledComponent';
import ConfirmModal from '@src/portal/ConfirmModal/ConfirmModal';
import { theme } from '@src/theme/theme';
import { Promotion } from '@src/types/Promotion';
import React, { useCallback, useState } from 'react';

const PROMOTION_DELETE_MESSAGE = '해당 프로모션을 삭제하시겠습니까?';

interface Props {
  promotion: Promotion;
}

const PromotionItem: React.FC<Props> = ({ promotion }) => {
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const handleOpenDeleteModal = useCallback(() => {
    setOpenDeleteModal(true);
  }, [setOpenDeleteModal]);

  const handleCloseDeleteModal = useCallback(() => {
    setOpenDeleteModal(false);
  }, [setOpenDeleteModal]);
  return (
    <PromotionContainer>
      <PromotionImage src={promotion.imgUrl} />
      <PromotionDeleteButton onClick={handleOpenDeleteModal} bgcolor={theme.greenColor}>
        X
      </PromotionDeleteButton>
      {openDeleteModal && (
        <ConfirmModal
          title={PROMOTION_DELETE_MESSAGE}
          onConfirm={() => {
            console.log('API');
          }}
          onClose={handleCloseDeleteModal}
        />
      )}
    </PromotionContainer>
  );
};

const PromotionContainer = styled('div')`
  position: relative;
  padding: 25px;
  width: 50%;
  height: 400px;
  min-width: 440px;
  min-height: 320px;
`;

const PromotionImage = styled('img')`
  width: 100%;
  height: 250px;
  border-radius: 20px;
`;

const PromotionDeleteButton = styled('button')<{ bgcolor: string }>`
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 1.8em;
  border-radius: 50%;
  background-color: ${(props) => props.bgcolor};
  color: white;
  border: none;
  cursor: pointer;
`;

export default PromotionItem;
