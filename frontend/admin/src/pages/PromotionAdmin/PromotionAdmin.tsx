import PromotionAPI from '@src/apis/promotionAPI';
import { styled } from '@src/lib/CustomStyledComponent';
import PromotionList from '@src/pages/PromotionAdmin/PromotionList/PromotionList';
import PromotionViewChart from '@src/pages/PromotionAdmin/PromotionViewChart/PromotionViewChart';
import PromotionUploadModal from '@src/portal/PromotionUploadModal/PromotionUploadModal';
import { theme } from '@src/theme/theme';
import { Promotion } from '@src/types/Promotion';
import React, { useCallback, useEffect, useState } from 'react';

const PromotionAdmin = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [openPromotionModal, setOpenPromotionModal] = useState<boolean>(false);

  const fetchingPromotions = useCallback(async () => {
    try {
      const { result } = await PromotionAPI.getPromotions();
      setPromotions(result);
    } catch (err) {
      console.error(err);
    }
  }, [setPromotions]);

  const onOpenModal = useCallback(() => {
    setOpenPromotionModal(true);
  }, [setOpenPromotionModal]);

  const handleCloseModal = useCallback(() => {
    setOpenPromotionModal(false);
  }, [setOpenPromotionModal]);

  const handleDeletePromotion = useCallback(async (promotionId: number) => {
    await PromotionAPI.deletePromotion(promotionId);
    setPromotions((prev) => prev.filter((promotion) => promotionId !== promotion.id));
  }, []);

  useEffect(() => {
    fetchingPromotions();
  }, []);
  return (
    <PromotionAdminContainer>
      <PromotionChartAndButtonContainer>
        <PromotionViewChart />
        <PromotionAddButton onClick={onOpenModal}>+</PromotionAddButton>
      </PromotionChartAndButtonContainer>
      <PromotionList promotions={promotions} onDeletePromotion={handleDeletePromotion} />
      {openPromotionModal && <PromotionUploadModal updatePromotions={fetchingPromotions} onClose={handleCloseModal} />}
    </PromotionAdminContainer>
  );
};

const PromotionAdminContainer = styled('div')`
  position: relative;
  width: 100%;
  min-width: 1080px;
`;

const PromotionChartAndButtonContainer = styled('div')`
  position: relative;
  padding: 16px;
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
`;
const PromotionAddButton = styled('button')`
  position: relative;
  font-size: 2em;
  width: 50%;
  height: 250px;
  border-radius: 20px;
  cursor: pointer;
  border: none;
  color: gray;
`;

export default PromotionAdmin;
