import React, { MouseEvent, useState } from 'react';
import { useCallback } from 'react';
import Portal from '../portal';
import ProductImageUploader from './ProductImageUploader/ProductImageUploader';
import { styled } from '@src/lib/CustomStyledComponent';
import useInput from '../../hooks/useInput';
import UploadContentLeft from '@src/portal/ProductUploadModal/UploadContentLeft/UploadContentLeft';
import UploadContentRight from '@src/portal/ProductUploadModal/UploadContentRight/UploadContentRight';

const ProductUploadModal = () => {
  const [files, setFiles] = useState<File[]>([]); // 이미지 file 저장
  const [title, handleChangeTitle] = useInput('');
  const [price, handleChangePrice] = useInput('');
  const [stock, handleChangeStock] = useInput('');
  const [discountRate, handleChangeDiscountRate] = useInput(0);
  const [checkGreen, setCheckGreen] = useState(false);
  const [category, setCategory] = useState(0);
  const [productState, setProductState] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(0);

  const handleUpdateFiles = useCallback(
    (newFiles: File[]) => {
      setFiles((prev) => {
        return [...prev, ...newFiles];
      });
    },
    [setFiles]
  );

  const handleDeleteFile = useCallback(
    (index: number) => {
      setFiles((prev) => prev.filter((f, i) => i !== index));
    },
    [setFiles]
  );
  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault();
    const formData = new FormData();
    files.forEach((file: File) => formData.append('files', file));
    formData.append('title', title);
  };

  const handleCheckGreen = useCallback(() => {
    setCheckGreen((prev) => !prev);
  }, [setCheckGreen]);

  const handleCategory = useCallback(
    (id: number) => {
      setCategory(id);
    },
    [setCategory]
  );

  const handleProductState = useCallback(
    (productState: string) => {
      setProductState(productState);
    },
    [setProductState]
  );

  const handleDeliveryInfo = useCallback(
    (id: number) => {
      setDeliveryInfo(id);
    },
    [setDeliveryInfo]
  );
  return (
    <Portal>
      <ModalContainer>
        <ProductUploadContainer>
          <ProductImageUploader onHandleUpdateFiles={handleUpdateFiles} onHandleDeleteFile={handleDeleteFile} />
          <UploadContentContainer>
            <UploadContentLeft
              title={title}
              price={price}
              stock={stock}
              discountRate={discountRate}
              onHandleTitle={handleChangeTitle}
              onHandlePrice={handleChangePrice}
              onHandleStock={handleChangeStock}
              onHandleDiscount={handleChangeDiscountRate}
            />
            <UploadContentRightContainer>
              <UploadContentRight
                checkGreen={checkGreen}
                onHandleCheckGreen={handleCheckGreen}
                onHandleDeliveryInfo={handleDeliveryInfo}
                onHandleCategory={handleCategory}
                onHandleProductState={handleProductState}
              />
              <button onClick={handleSubmit}>상품 등록</button>
            </UploadContentRightContainer>
          </UploadContentContainer>
        </ProductUploadContainer>
      </ModalContainer>
    </Portal>
  );
};

const ModalContainer = styled('div')`
  position: fixed;
  z-index: 1000;
  text-align: center;
  background-color: #00000080;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ProductUploadContainer = styled('div')`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 860px;
  height: 800px;
  margin: auto;
  background-color: white;
  border-radius: 12px;
`;

const UploadContentContainer = styled('div')`
  box-sizing: border-box;
  position: relative;
  display: flex;
  width: calc(100% - 56px);
  height: calc(812px - 35%);
  padding: 28px 0;
  margin: 0 28px 0 28px;
  border-top: 1px solid lightgray;
`;

const UploadContentRightContainer = styled('div')`
  width: 40%;
`;

export default ProductUploadModal;
