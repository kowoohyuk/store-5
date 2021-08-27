import { GoodsRepository } from './../repository/goods.repository';
import { Category } from '../entity/Category';
import {
  CategoryCountResponse,
  CategoryResponse,
  CategorySellCountResponse,
  CategoryViewCountResponse,
} from '../types/response/category.response';
import { CategoryRepository } from '../repository/category.repository';

const BEST_LIST_LENGTH = 5;

async function createCategory(name: string, parentId?: number): Promise<Category> {
  if (parentId) {
    return await CategoryRepository.createSubCategory(name, parentId);
  } else {
    return await CategoryRepository.createCategory(name);
  }
}

async function getAllCategory(): Promise<CategoryResponse[]> {
  const categories = await CategoryRepository.getAllCategories();
  const categoryMap = new Map<number, CategoryResponse>();

  // 최상위 카테고리 데이터 생성
  categories
    .filter((category) => !category.parent)
    .forEach((parentCategory) => {
      categoryMap.set(parentCategory.id, {
        id: parentCategory.id,
        name: parentCategory.name,
        categories: [],
      });
    });

  // 서브 카테고리 데이터 생성
  categories
    .filter((category) => category.parent !== undefined)
    .forEach((category) => {
      const parentCategoryResponse = categoryMap.get(category.parent);
      if (parentCategoryResponse) {
        parentCategoryResponse.categories?.push({
          id: category.id,
          name: category.name,
        });
      }
    });

  return Array.from(categoryMap.entries()).map(([_, value]) => value);
}

async function getCategoryGoodsCount(): Promise<CategoryCountResponse> {
  const childCategories = await CategoryRepository.getChildCategories();
  return childCategories.map((category) => {
    return { name: category.name, value: category.goodsList.length };
  });
}

async function getTopSellingCategory(): Promise<CategorySellCountResponse> {
  const result = [];
  const categories: {
    [key: string]: number;
  } = {};
  const goods = await GoodsRepository.getAllWithCategory();
  goods.forEach((item) => {
    if (categories[item.category.name]) {
      categories[item.category.name] += item.countOfSell;
    } else {
      categories[item.category.name] = item.countOfSell;
    }
  });
  for (let key in categories) {
    result.push({ name: key, total: categories[key] });
  }
  result.sort((a, b) => b.total - a.total);
  const MAX_END = result.length > BEST_LIST_LENGTH ? BEST_LIST_LENGTH : result.length;
  return result.slice(0, MAX_END);
}

async function getCategoryViews(): Promise<CategoryViewCountResponse> {
  const categoriesMap = new Map<string, number>();
  const goodsList = await GoodsRepository.getAllWithCategory();

  goodsList.forEach((goods) => {
    const categoryName = goods.category.name;
    const previousValue = categoriesMap.get(categoryName);
    if (previousValue) {
      categoriesMap.set(categoryName, previousValue + goods.view);
    } else {
      categoriesMap.set(categoryName, goods.view);
    }
  });

  return Array.from(categoriesMap).map(([key, value]) => {
    return { name: key, view: value };
  });
}

export default {
  createCategory,
  getAllCategory,
  getCategoryGoodsCount,
  getTopSellingCategory,
  getCategoryViews,
};
