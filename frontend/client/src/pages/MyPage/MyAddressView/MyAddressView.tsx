import { AddressAPI } from '@src/apis/addressAPI';
import PrimaryButton from '@src/components/PrimaryButton/PrimaryButton';
import AddressCard from '@src/components/AddressCard/AddressCard';
import Topic from '@src/components/Topic/Topic';
import { AddressInfo } from '@src/types/Address';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AddressCreateModal from '@src/components/AddressModals/AddressCreateModal/AddressCreateModal';
import AddressManageModal from '@src/components/AddressModals/AddressManageModal/AddressManageModal';
import { usePushToast } from '@src/lib/ToastProvider/ToastProvider';

const MyAddressView = () => {
  const [addresses, setAddresses] = useState<AddressInfo[]>([]);
  const [isOpenManageModal, setIsOpenManageModal] = useState(false);
  const pushToast = usePushToast();

  const toggleManageModal = () => {
    setIsOpenManageModal(!isOpenManageModal);
    fetchAddresses();
  };

  async function fetchAddresses() {
    try {
      const { result } = await AddressAPI.getAddresses();
      setAddresses(result);
    } catch (err) {
      console.error(err);
      pushToast({ text: '사용자 주소를 불러오는데 실패했습니다. 서버오류' });
    }
  }

  useEffect(() => {
    fetchAddresses();
  }, []);

  const defaultAddress = addresses.find((address) => address.isDefault);
  const optionalAddress = addresses.filter((address) => !address.isDefault);

  return (
    <AddressInfoList>
      <Topic>배송지 정보</Topic>

      <AddressControlButtonContainer>
        <PrimaryButton onClick={toggleManageModal}>배송지 수정하기</PrimaryButton>
      </AddressControlButtonContainer>

      {isOpenManageModal && <AddressManageModal onClose={toggleManageModal} />}

      <AddressInfoListItem isPrimary>
        {defaultAddress ? <AddressCard address={defaultAddress} /> : '기본 주소가 없습니다.'}
      </AddressInfoListItem>
    </AddressInfoList>
  );
};

const AddressInfoList = styled.ul`
  display: flex;
  flex-direction: column;
  animation: fadeInEffect 0.5s 0s;
  @keyframes fadeInEffect {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const AddressControlButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

interface AddressInfoListItem {
  theme: {
    darkPrimary: string;
  };
  isPrimary?: boolean;
}

const AddressInfoListItem = styled.li<AddressInfoListItem>`
  display: flex;
  margin-top: 1rem;
`;

export default MyAddressView;
