"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdmin = exports.listAdmin = exports.getReviewsByItem = exports.createReview = void 0;
const review_model_1 = __importDefault(require("./review.model"));
const order_model_1 = __importDefault(require("../order/order.model"));
const tour_model_1 = __importDefault(require("../tour/tour.model"));
const gear_model_1 = __importDefault(require("../gear/gear.model"));
const error_middleware_1 = require("../../middlewares/error.middleware");
const createReview = async (req) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId)
        throw new error_middleware_1.HttpError(401, "Vui lòng đăng nhập");
    const { itemId, itemType, rating, content } = req.body;
    if (!itemId || !itemType || !rating || !content) {
        throw new error_middleware_1.HttpError(400, "Thiếu thông tin đánh giá");
    }
    if (itemType !== "tour" && itemType !== "gear") {
        throw new error_middleware_1.HttpError(400, "Loại sản phẩm không hợp lệ");
    }
    // Check if user has a completed order for this item
    const orders = await order_model_1.default.find({ accountId: userId, status: "done" });
    let hasPurchased = false;
    let matchingOrderId = null;
    for (const order of orders) {
        const items = order.items || [];
        const found = items.find((i) => String(i._id) === itemId || String(i.id) === itemId || String(i.tourId) === itemId || String(i.gearId) === itemId);
        if (found) {
            hasPurchased = true;
            matchingOrderId = order._id;
            break;
        }
    }
    if (!hasPurchased) {
        throw new error_middleware_1.HttpError(403, "Bạn chỉ có thể đánh giá những dịch vụ hoặc sản phẩm đã hoàn thành/mua thành công.");
    }
    // Check if already reviewed for this order
    const query = { accountId: userId, itemId };
    if (matchingOrderId)
        query.orderId = matchingOrderId;
    const existingReview = await review_model_1.default.findOne(query);
    if (existingReview) {
        throw new error_middleware_1.HttpError(400, "Bạn đã đánh giá sản phẩm này cho đơn hàng tương ứng rồi.");
    }
    const review = new review_model_1.default({
        itemId,
        itemType,
        accountId: userId,
        orderId: matchingOrderId,
        rating: Number(rating),
        content,
    });
    await review.save();
    // Update item stats
    const Model = (itemType === "tour" ? tour_model_1.default : gear_model_1.default);
    const itemModel = await Model.findById(itemId);
    if (itemModel) {
        const allReviews = await review_model_1.default.find({ itemId, itemType, status: "active", deleted: false });
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;
        await Model.updateOne({ _id: itemId }, { $set: { rating: Number(avgRating), reviewCount: allReviews.length } });
    }
    return { message: "Đánh giá thành công", review };
};
exports.createReview = createReview;
const getReviewsByItem = async (req) => {
    const { itemId, itemType } = req.query;
    if (!itemId || !itemType)
        throw new error_middleware_1.HttpError(400, "Thiếu itemId hoặc itemType");
    const reviews = await review_model_1.default.find({ itemId, itemType, status: "active", deleted: false })
        .populate("accountId", "fullName avatar")
        .sort({ createdAt: -1 });
    return { reviews };
};
exports.getReviewsByItem = getReviewsByItem;
// Admin
const listAdmin = async (_req) => {
    const reviews = await review_model_1.default.find({ deleted: false })
        .populate("accountId", "fullName avatar email")
        .sort({ createdAt: -1 });
    return { reviews };
};
exports.listAdmin = listAdmin;
const deleteAdmin = async (req) => {
    const { id } = req.params;
    const deleted = await review_model_1.default.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() });
    if (!deleted)
        throw new error_middleware_1.HttpError(404, "Không tìm thấy đánh giá");
    // Update stats
    const Model = (deleted.itemType === "tour" ? tour_model_1.default : gear_model_1.default);
    const allReviews = await review_model_1.default.find({ itemId: deleted.itemId, itemType: deleted.itemType, status: "active", deleted: false });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;
    await Model.updateOne({ _id: deleted.itemId }, { $set: { rating: Number(avgRating), reviewCount: allReviews.length } });
    return { message: "Xóa đánh giá thành công" };
};
exports.deleteAdmin = deleteAdmin;
