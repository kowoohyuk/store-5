import { Goods } from './../entity/Goods';
import { getRepository } from 'typeorm';
import { OrderItem } from '../entity/OrderItem';
import { CreateOrderItem } from '../types/Order';

async function createOrderItem(
  goodsId: number,
  orderListId: number,
  orderItemBody: CreateOrderItem
): Promise<OrderItem> {
  return await getRepository(OrderItem).save({ ...orderItemBody, goods: goodsId, orderList: orderListId });
}

async function getAllOrderItemByListId(orderListId: number): Promise<OrderItem[]> {
  return await getRepository(OrderItem).find({ where: { orderList: orderListId } });
}

async function findOrderGoodsInfoById(orderItemId: number): Promise<OrderItem | undefined> {
  return await getRepository(OrderItem).findOne({
    relations: ['goods'],
    where: {
      id: orderItemId,
    },
  });
}

async function findCountByPeriod(startDate: Date, endDate: Date, limit: number): Promise<any[]> {
  return await getRepository(OrderItem).createQueryBuilder('o').limit(limit).getMany();

  /*
  return await getRepository(OrderItem)
    .createQueryBuilder('o')
    .select('o.goodsId')
    .addSelect('COUNT(*) AS count')
    .where('o.createdAt >= :startDate', { startDate: getDateString(startDate) })
    .andWhere('o.createdAt <= :endDate', { endDate: getDateString(endDate) })
    .orderBy('count', 'DESC')
    .groupBy('o.goodsId')
    .limit(limit)
    .getMany();
    */
}

function getDateString(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export const OrderItemRepository = {
  createOrderItem,
  getAllOrderItemByListId,
  findOrderGoodsInfoById,
  // 관리자
  findCountByPeriod,
};
