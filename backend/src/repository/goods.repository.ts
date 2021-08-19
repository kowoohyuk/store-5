import { getRepository, Like, MoreThan } from 'typeorm';
import { GOODS_DB_ERROR } from '../constants/database-error-name';
import { DatabaseError } from '../errors/base.error';
import { Goods } from '../entity/Goods';
import { FindAllCategoryProps, FindAllColumnNameProps, FindAllKeywordProps, FindAllUserIdProps } from '../types/Goods';
import { BestGoodsType, TaggedGoodsType } from '../types/response/goods.response';
import { SearchedGoodsFromKeyword } from '../types/response/search.response';
import { GoodsStateMap } from '../controller/goods.controller';

async function findGoodsDetailById(goodsId: number): Promise<Goods | undefined> {
  try {
    return await getRepository(Goods).findOne({
      relations: ['category', 'deliveryInfo', 'goodsImgs'],
      where: {
        id: goodsId,
      },
    });
  } catch (error) {
    console.error(error);
    throw new DatabaseError(GOODS_DB_ERROR);
  }
}

async function findAllByCategory({
  category,
  where,
  offset,
  limit,
  order,
  sort,
}: FindAllCategoryProps): Promise<TaggedGoodsType[]> {
  try {
    const goodsRepo = getRepository(Goods);
    const data = await goodsRepo.find({
      where: {
        category,
        ...where,
      },
      skip: offset,
      take: limit,
      order: {
        [order]: sort,
      },
    });
    return data;
  } catch (err) {
    console.error(err);
    throw new DatabaseError(GOODS_DB_ERROR);
  }
}

async function findAllByKeyword({ keyword, offset, limit }: FindAllKeywordProps): Promise<TaggedGoodsType[]> {
  try {
    const goodsRepo = getRepository(Goods);
    return await goodsRepo.find({
      where: {
        state: GoodsStateMap.sale,
        stock: MoreThan(0),
        title: Like(`%${keyword}%`),
      },
      skip: offset,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  } catch (err) {
    console.error(err);
    throw new DatabaseError(GOODS_DB_ERROR);
  }
}

async function findAllByColumnName({ columnName, limit }: FindAllColumnNameProps): Promise<TaggedGoodsType[]> {
  try {
    const goodsRepo = getRepository(Goods);
    const data = await goodsRepo.find({
      take: limit,
      where: {
        state: GoodsStateMap.sale,
        stock: MoreThan(0),
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return data;
  } catch (err) {
    console.error(err);
    throw new DatabaseError(GOODS_DB_ERROR);
  }
}

async function findAllWishByUserId({ offset, limit, userId }: FindAllUserIdProps): Promise<TaggedGoodsType[]> {
  try {
    const data = await getRepository(Goods)
      .createQueryBuilder('goods')
      .leftJoinAndSelect('wish', 'w', 'w.goodsId = goods.id')
      .where(`w.userId = ${userId}`)
      .orderBy('w.createdAt', 'DESC')
      .offset(offset)
      .limit(limit)
      .getMany();

    return data;
  } catch (err) {
    console.error(err);
    throw new DatabaseError(GOODS_DB_ERROR);
  }

  return [];
}

async function findTotalCountByCategory(category: number): Promise<number> {
  try {
    const goodsRepo = getRepository(Goods);
    const count = await goodsRepo.count({
      where: {
        // TODO: 어드민 연동시 모든 state와 모든 stock에 해당하는 상품을 가져와야 함
        category,
        state: GoodsStateMap.sale,
        stock: MoreThan(0),
      },
    });
    return count;
  } catch (err) {
    console.error(err);
    throw new DatabaseError(GOODS_DB_ERROR);
  }
}

async function findTotalCountByKeyword(keyword: string): Promise<number> {
  try {
    const goodsRepo = getRepository(Goods);
    const count = await goodsRepo.count({
      where: {
        // TODO: 어드민 연동시 모든 state와 모든 stock에 해당하는 상품을 가져와야 함
        title: Like(`%${keyword}%`),
        state: GoodsStateMap.sale,
        stock: MoreThan(0),
      },
    });
    return count;
  } catch (err) {
    console.error(err);
    throw new DatabaseError(GOODS_DB_ERROR);
  }
}

async function findSellCountAverage(): Promise<number> {
  try {
    const result = await getRepository(Goods)
      .createQueryBuilder('goods')
      .select('TRUNCATE(AVG(goods.countOfSell), 1)', 'avg')
      .getRawOne();

    return result.avg;
  } catch (err) {
    console.error(err);
    throw new DatabaseError(GOODS_DB_ERROR);
  }
}

async function searchGoodsFromKeyword(keyword: string): Promise<SearchedGoodsFromKeyword[]> {
  const goodsRepo = getRepository(Goods);
  return await goodsRepo.find({
    select: ['id', 'thumbnailUrl', 'title'],
    where: { title: Like(`%${keyword}%`) },
    take: 5,
  });
}

async function findStockById(goodsId: number): Promise<number> {
  const goodsRepo = getRepository(Goods);
  const goods = await goodsRepo.findOne({
    select: ['stock'],
    where: { id: goodsId },
  });
  return goods?.stock ?? 0;
}

async function findBestByPeriod(startDate: Date, endDate: Date): Promise<BestGoodsType[]> {
  const goods = await getRepository(Goods)
    .createQueryBuilder('goods')
    .leftJoin('orderItem', 'o')
    .addSelect('COUNT(o.*) AS count')
    .where(`o.createdAt >= '${startDate}' AND o.createdAt <= '${endDate}'`)
    .andWhere('goods.id = o.goodsId')
    .groupBy('goods.id')
    .orderBy('count', 'DESC')
    .limit(5)
    .getMany();
  console.log('카운트으');
  console.log(goods);
  return [];
}

export const GoodsRepository = {
  findGoodsDetailById,
  findAllByCategory,
  findAllByColumnName,
  findAllByKeyword,
  findAllWishByUserId,
  findTotalCountByCategory,
  findTotalCountByKeyword,
  findSellCountAverage,
  searchGoodsFromKeyword,
  findStockById,
  // 관리자
  findBestByPeriod,
};
