import { Request } from "express";
import Review from "./review.model";
import Order from "../order/order.model";
import Tour from "../tour/tour.model";
import Gear from "../gear/gear.model";
import { HttpError } from "../../middlewares/error.middleware";
import type { AccountRequest } from "../../interfaces/request.interface";

export const createReview = async (req: Request) => {
  const userId = (req as AccountRequest).user?.id;
  if (!userId) throw new HttpError(401, "Vui lòng đăng nhập");

  const { itemId, itemType, rating, content } = req.body;

  if (!itemId || !itemType || !rating || !content) {
    throw new HttpError(400, "Thiếu thông tin đánh giá");
  }

  if (itemType !== "tour" && itemType !== "gear") {
    throw new HttpError(400, "Loại sản phẩm không hợp lệ");
  }

  // Check if user has a completed order for this item
  const orders = await Order.find({ accountId: userId, status: "done" });
  let hasPurchased = false;
  let matchingOrderId: any = null;

  for (const order of orders) {
    const items = order.items || [];
    const found = items.find((i: any) => String(i._id) === itemId || String(i.id) === itemId || String(i.tourId) === itemId || String(i.gearId) === itemId);
    if (found) {
      hasPurchased = true;
      matchingOrderId = order._id;
      break;
    }
  }

  if (!hasPurchased) {
    throw new HttpError(403, "Bạn chỉ có thể đánh giá những dịch vụ hoặc sản phẩm đã hoàn thành/mua thành công.");
  }

  // Check if already reviewed for this order
  const query: any = { accountId: userId, itemId };
  if (matchingOrderId) query.orderId = matchingOrderId;

  const existingReview = await Review.findOne(query);
  if (existingReview) {
    throw new HttpError(400, "Bạn đã đánh giá sản phẩm này cho đơn hàng tương ứng rồi.");
  }

  const review = new Review({
    itemId,
    itemType,
    accountId: userId,
    orderId: matchingOrderId,
    rating: Number(rating),
    content,
  });

  await review.save();

  // Update item stats
  const Model = (itemType === "tour" ? Tour : Gear) as any;
  const itemModel = await Model.findById(itemId);
  
  if (itemModel) {
    const allReviews = await Review.find({ itemId, itemType, status: "active", deleted: false });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;
    
    await Model.updateOne(
      { _id: itemId },
      { $set: { rating: Number(avgRating), reviewCount: allReviews.length } }
    );
  }

  return { message: "Đánh giá thành công", review };
};

export const getReviewsByItem = async (req: Request) => {
  const { itemId, itemType } = req.query;
  if (!itemId || !itemType) throw new HttpError(400, "Thiếu itemId hoặc itemType");

  const reviews = await Review.find({ itemId, itemType, status: "active", deleted: false })
    .populate("accountId", "fullName avatar")
    .sort({ createdAt: -1 });

  return { reviews };
};

// Admin
export const listAdmin = async (_req: Request) => {
  const reviews = await Review.find({ deleted: false })
    .populate("accountId", "fullName avatar email")
    .sort({ createdAt: -1 });

  return { reviews };
};

export const deleteAdmin = async (req: Request) => {
  const { id } = req.params;
  const deleted = await Review.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() });
  
  if (!deleted) throw new HttpError(404, "Không tìm thấy đánh giá");

  // Update stats
  const Model = (deleted.itemType === "tour" ? Tour : Gear) as any;
  const allReviews = await Review.find({ itemId: deleted.itemId, itemType: deleted.itemType, status: "active", deleted: false });
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;
  
  await Model.updateOne(
    { _id: deleted.itemId },
    { $set: { rating: Number(avgRating), reviewCount: allReviews.length } }
  );

  return { message: "Xóa đánh giá thành công" };
};
