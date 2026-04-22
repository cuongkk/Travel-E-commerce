"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyVoucher = exports.hardDeleteItem = exports.restoreItem = exports.getTrash = exports.deleteItem = exports.editPatch = exports.createPost = exports.list = void 0;
const voucher_model_1 = __importDefault(require("./voucher.model"));
const error_middleware_1 = require("../../middlewares/error.middleware");
const list = async (_req) => {
    const voucherList = await voucher_model_1.default.find({ deleted: false }).sort({ createdAt: -1 });
    return { voucherList };
};
exports.list = list;
const createPost = async (req) => {
    const { code, name, discountType, discountValue, minOrderValue, maxUsage, expiresAt } = req.body;
    if (!code || !name || !discountType || discountValue === undefined || !expiresAt) {
        throw new error_middleware_1.HttpError(400, "Thiếu thông tin bắt buộc!");
    }
    const existing = await voucher_model_1.default.findOne({ code: code.toUpperCase() });
    if (existing) {
        throw new error_middleware_1.HttpError(400, "Mã giảm giá đã tồn tại!");
    }
    const record = new voucher_model_1.default({
        code: code.toUpperCase(),
        name,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        maxUsage: maxUsage ? Number(maxUsage) : null,
        expiresAt: new Date(expiresAt),
    });
    await record.save();
    return { message: "Tạo mã giảm giá thành công", voucher: record };
};
exports.createPost = createPost;
const editPatch = async (req) => {
    const { id } = req.params;
    const { name, discountType, discountValue, minOrderValue, maxUsage, expiresAt, status } = req.body;
    const record = await voucher_model_1.default.findOne({ _id: id, deleted: false });
    if (!record) {
        throw new error_middleware_1.HttpError(404, "Mã giảm giá không tồn tại!");
    }
    const updates = {};
    if (name)
        updates.name = name;
    if (discountType)
        updates.discountType = discountType;
    if (discountValue !== undefined)
        updates.discountValue = Number(discountValue);
    if (minOrderValue !== undefined)
        updates.minOrderValue = Number(minOrderValue);
    if (maxUsage !== undefined)
        updates.maxUsage = maxUsage === "" ? null : Number(maxUsage);
    if (expiresAt)
        updates.expiresAt = new Date(expiresAt);
    if (status)
        updates.status = status;
    await voucher_model_1.default.updateOne({ _id: id }, { $set: updates });
    return { message: "Cập nhật mã giảm giá thành công" };
};
exports.editPatch = editPatch;
const deleteItem = async (req) => {
    const { id } = req.params;
    const deletedItem = await voucher_model_1.default.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() }, { new: true });
    if (!deletedItem) {
        throw new error_middleware_1.HttpError(404, "Mã giảm giá không tồn tại!");
    }
    return { message: "Đã đưa vào thùng rác", voucher: deletedItem };
};
exports.deleteItem = deleteItem;
const getTrash = async (_req) => {
    const trashedList = await voucher_model_1.default.find({ deleted: true }).sort({ deletedAt: -1 });
    return { trashedList };
};
exports.getTrash = getTrash;
const restoreItem = async (req) => {
    const { id } = req.params;
    const restoredItem = await voucher_model_1.default.findByIdAndUpdate(id, { deleted: false, deletedAt: null }, { new: true });
    if (!restoredItem) {
        throw new error_middleware_1.HttpError(404, "Mã giảm giá không tồn tại trong thùng rác!");
    }
    return { message: "Khôi phục thành công", voucher: restoredItem };
};
exports.restoreItem = restoreItem;
const hardDeleteItem = async (req) => {
    const { id } = req.params;
    const deletedItem = await voucher_model_1.default.findByIdAndDelete(id);
    if (!deletedItem) {
        throw new error_middleware_1.HttpError(404, "Mã giảm giá không tồn tại!");
    }
    return { message: "Đã xóa vĩnh viễn", voucher: deletedItem };
};
exports.hardDeleteItem = hardDeleteItem;
// --- CLIENT LOGIC ---
const applyVoucher = async (req) => {
    var _a;
    const { code, cartTotal } = req.body;
    if (!code)
        throw new error_middleware_1.HttpError(400, "Vui lòng nhập mã giảm giá");
    const total = Number(cartTotal) || 0;
    const voucher = await voucher_model_1.default.findOne({ code: code.toUpperCase(), deleted: false, status: "active" });
    if (!voucher)
        throw new error_middleware_1.HttpError(404, "Mã giảm giá không hợp lệ hoặc đã bị khóa");
    if (voucher.expiresAt < new Date()) {
        throw new error_middleware_1.HttpError(400, "Mã giảm giá đã hết hạn");
    }
    if (voucher.maxUsage != null && ((_a = voucher.usedCount) !== null && _a !== void 0 ? _a : 0) >= voucher.maxUsage) {
        throw new error_middleware_1.HttpError(400, "Mã giảm giá đã hết lượt sử dụng");
    }
    if (voucher.minOrderValue !== undefined && voucher.minOrderValue > 0 && total < voucher.minOrderValue) {
        throw new error_middleware_1.HttpError(400, `Đơn hàng tối thiểu phải từ ${voucher.minOrderValue.toLocaleString("vi-VN")}đ`);
    }
    let discountAmount = 0;
    if (voucher.discountType === "percent") {
        discountAmount = (total * voucher.discountValue) / 100;
    }
    else {
        discountAmount = voucher.discountValue;
    }
    if (discountAmount > total)
        discountAmount = total;
    return {
        message: "Áp mã thành công",
        discount: discountAmount,
        voucherCode: voucher.code
    };
};
exports.applyVoucher = applyVoucher;
