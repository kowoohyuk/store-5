import GoodsButtons from './GoodsButtons/GoodsButtons';
import GoodsAmount from './GoodsAmount/GoodsAmount';
import { DetailGoods } from '@src/types/Goods';
import React, { useState, useCallback, useEffect } from 'react';
// import { deleteWish, postWish } from '@src/apis/wishAPI';
import { getGoodsStockCount } from '@src/apis/goodsAPI';

interface Props {
  goods: DetailGoods;
}

const GoodsInteractive: React.FC<Props> = ({
  goods: { id, title, price, deliveryFee = 0, discountRate = 0, isWish = false },
}) => {
  const [isWished, setIsWished] = useState(isWish);
  const [isOver, setIsOver] = useState(false);
  const [amount, setAmount] = useState(0);

  const handleToWish = useCallback(async () => {
    //   const result = await (isWished ? deleteWish(id) : postWish(id));
    //   if (result) setIsWished(!isWished);
  }, [isWished]);
  const handleAddToCart = useCallback(() => {
    /*
    const result = createCart({
      goodsId,
      amount
    });
    if(result?.id) {
      // 성공 안내
    } else {
      // 실패 안내
    }
    */
  }, [amount]);

  const handleChangeAmount = (amount: number) => {
    setAmount(amount);
  };

  const fetchCheckStock = async (goodsId: number) => {
    try {
      const data = await getGoodsStockCount(goodsId);
      const stock = data.result;
      if (stock < amount) {
        setAmount(stock);
        setIsOver(true);
      } else {
        setIsOver(false);
      }
    } catch (e) {
      // TODO: 구매 불가능한 상태에 대한 처리 필요.
      setIsOver(false);
    }
  };

  useEffect(() => {
    if (!isOver) fetchCheckStock(id);
  }, [amount]);

  return (
    <div>
      <GoodsAmount
        title={title}
        price={price}
        amount={amount}
        deliveryFee={deliveryFee}
        discountRate={discountRate}
        isOver={isOver}
        onChangeAmount={handleChangeAmount}
      />
      <GoodsButtons
        goodsId={id}
        amount={amount}
        isWish={isWished}
        fetchCheckStock={fetchCheckStock}
        onToggleWish={handleToWish}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default GoodsInteractive;
