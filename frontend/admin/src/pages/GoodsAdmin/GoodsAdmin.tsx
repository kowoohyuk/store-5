import React, { useState } from 'react';
import { styled } from '@src/lib/CustomStyledComponent';
import GoodsTable from './GoodsTable/GoodsTable';
import GoodsUploadModal from '@src/portal/GoodsUploadModal/GoodsUploadModal';

const GoodsAdmin = () => {
  const [openUploadModal, setOpenUploadModal] = useState(false);
  return (
    <GoodsAdminContainer>
      <GoodsAdminHeader>
        <Title>상품 관리</Title>
        <AddButton
          onClick={() => {
            setOpenUploadModal(true);
          }}
        >
          상품 등록
        </AddButton>
      </GoodsAdminHeader>
      <GoodsTable openUploadModal={openUploadModal} />
      {openUploadModal && <GoodsUploadModal onClose={() => setOpenUploadModal(false)} />}
    </GoodsAdminContainer>
  );
};

const GoodsAdminContainer = styled('div')`
  width: 100%;
  position: relative;
  margin: 5rem;
`;

const GoodsAdminHeader = styled('div')`
  display: flex;
  column-gap: 3rem;
  margin-bottom: 20px;
`;

const Title = styled('h2')`
  font-size: 24px;
  font-weight: 600;
`;

const AddButton = styled('button')`
  cursor: pointer;
  border: 1px solid #aaa;
  border-radius: 4px;
  color: #000;
  background-color: #fff;
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 1.125rem;
  font-weight: bolder;
`;

export default GoodsAdmin;
