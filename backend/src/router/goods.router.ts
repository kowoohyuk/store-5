import express from 'express';
import { MAX_UPLOAD_FILE } from '../constants/product-default-value';
import { GoodsController } from '../controller/goods.controller';
import checkNumberInParams from '../middlewares/check-number-params';
import isAuthenticate from '../middlewares/is-authenticate';
import uploadProductFiles from '../middlewares/upload-file';
import wrapAsync from '../utils/wrap-async';

const router = express.Router();

router.post(
  '/',
  // isAuthenticate,
  uploadProductFiles.array('files', MAX_UPLOAD_FILE),
  wrapAsync(GoodsController.createGoods)
);
router.get('/category', wrapAsync(GoodsController.getAllGoodsCategory));
router.get('/keyword', wrapAsync(GoodsController.getAllSaleGoodsByKeyword));
router.get('/main', wrapAsync(GoodsController.getMainGoodsListMap));
router.get('/:id/stock', checkNumberInParams, wrapAsync(GoodsController.getGoodsStockById));
router.get('/:id', checkNumberInParams, wrapAsync(GoodsController.getGoodsDetail));

// 관리자
router.get('/best/sell', wrapAsync(GoodsController.getBestByPeriod));

export default router;
