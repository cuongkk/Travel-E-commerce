import type { Request, Response } from "express";
import * as reviewService from "./review.service";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";

export const createReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await reviewService.createReview(req);
  sendSuccess(res, data.message, data.review, 201);
});

export const getReviewsByItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await reviewService.getReviewsByItem(req);
  sendSuccess(res, "Lấy danh sách đánh giá thành công", data);
});

export const listAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await reviewService.listAdmin(req);
  sendSuccess(res, "Lấy danh sách đánh giá thành công", data);
});

export const deleteAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await reviewService.deleteAdmin(req);
  sendSuccess(res, data.message);
});
