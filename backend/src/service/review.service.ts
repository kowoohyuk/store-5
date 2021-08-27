import { Review } from './../entity/Review';
import { getConnection, getRepository } from 'typeorm';
import { GoodsRepository } from './../repository/goods.repository';
import { BadRequestError, ForbiddenError } from './../errors/client.error';
import { CreateReviewBody, UpdateReviewBody } from '../types/request/review.request';
import { isNumber, isString } from '../utils/check.primitive.type';
import { FORBIDDEN, INVALID_ACCESS, INVALID_DATA } from '../constants/client.error.name';
import { ReviewImg } from '../entity/ReviewImg';
import { ReviewRepository } from '../repository/review.repository';
import { getReviewsOption, getReviewsResult } from '../types/Review';

const MAX_RATE = 5;
const MIN_RATE = 1;

const ALREADY_REVIEW_CREATED = '이미 리뷰를 등록하셨습니다.';

async function getReviews(option: getReviewsOption): Promise<getReviewsResult> {
  const totalCount = await ReviewRepository.getReviewsCount(option);
  const reviews = await ReviewRepository.getReviews(option);

  return {
    meta: { totalCount },
    reviews: reviews.map((review) => ({ ...review, isMine: option.requestUserId === review.user.id })),
  };
}

async function createReview(userId: number, body: CreateReviewBody, uploadFileUrls: string[]): Promise<Review> {
  await checkValidateCreateReview(body);
  const { goodsId, contents, rate } = body;
  const review = await ReviewRepository.getReviewByIds(userId, goodsId);
  if (review) throw new BadRequestError(ALREADY_REVIEW_CREATED);
  return await getConnection().transaction(async (transactionalEntityManager) => {
    const review = await transactionalEntityManager.save(Review, {
      rate,
      contents,
      goods: {
        id: goodsId,
      },
      user: {
        id: userId,
      },
    });
    await Promise.all(
      uploadFileUrls.map(
        async (url) => await transactionalEntityManager.save(ReviewImg, { review: { id: review.id }, url })
      )
    );
    return review;
  });
}

async function updateReview(userId: number, body: UpdateReviewBody, reviewId: number, uploadFileUrls: string[]) {
  await Promise.all([checkValidateCreateReview(body), checkIsMineReview(userId, reviewId)]);
  const { contents, rate, deletedImages } = body;
  return await getConnection().transaction(async (transactionalEntityManager) => {
    const updatedReview = await transactionalEntityManager.update(
      Review,
      {
        id: reviewId,
        user: {
          id: userId,
        },
      },
      {
        rate,
        contents,
      }
    );
    if (deletedImages) {
      Array.isArray(deletedImages)
        ? await Promise.all(deletedImages.map((url) => transactionalEntityManager.delete(ReviewImg, { url })))
        : transactionalEntityManager.delete(ReviewImg, { url: deletedImages });
    }
    await Promise.all(
      uploadFileUrls.map((url) => transactionalEntityManager.save(ReviewImg, { review: { id: reviewId }, url }))
    );
    return updatedReview;
  });
}

async function deleteReview(userId: number, reviewId: number) {
  await checkIsMineReview(userId, reviewId);
  await ReviewRepository.deleteReview(reviewId);
}

async function checkValidateCreateReview(body: CreateReviewBody): Promise<void> {
  const { goodsId, contents, rate } = body;
  if (!isNumber(goodsId) || !isString(contents) || !isNumber(rate)) throw new BadRequestError(INVALID_DATA);
  if (rate < MIN_RATE || rate > MAX_RATE || contents.length < 1) throw new BadRequestError(INVALID_DATA);
  const goods = await GoodsRepository.getGoodsById(goodsId);
  if (!goods) throw new BadRequestError(INVALID_DATA);
}

async function checkIsMineReview(userId: number, reviewId: number) {
  const review = await ReviewRepository.getReviewById(reviewId);
  if (!review) throw new BadRequestError(INVALID_ACCESS);
  if (userId !== review.user.id) throw new ForbiddenError(FORBIDDEN);
}

export const ReviewService = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
};
