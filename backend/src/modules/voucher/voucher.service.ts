import { Request } from "express";
import Voucher from "./voucher.model";
import { HttpError } from "../../middlewares/error.middleware";

export const list = async (_req: Request) => {
  const voucherList = await Voucher.find({ deleted: false }).sort({ createdAt: -1 });
  return { voucherList };
};

export const createPost = async (req: Request) => {
  const { code, name, discountType, discountValue, minOrderValue, maxUsage, expiresAt } = req.body;

  if (!code || !name || !discountType || discountValue === undefined || !expiresAt) {
    throw new HttpError(400, "Thiếu thông tin bắt buộc!");
  }

  const existing = await Voucher.findOne({ code: code.toUpperCase() });
  if (existing) {
    throw new HttpError(400, "Mã giảm giá đã tồn tại!");
  }

  const record = new Voucher({
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

export const editPatch = async (req: Request) => {
  const { id } = req.params;
  const { name, discountType, discountValue, minOrderValue, maxUsage, expiresAt, status } = req.body;

  const record = await Voucher.findOne({ _id: id, deleted: false });
  if (!record) {
    throw new HttpError(404, "Mã giảm giá không tồn tại!");
  }

  const updates: any = {};
  if (name) updates.name = name;
  if (discountType) updates.discountType = discountType;
  if (discountValue !== undefined) updates.discountValue = Number(discountValue);
  if (minOrderValue !== undefined) updates.minOrderValue = Number(minOrderValue);
  if (maxUsage !== undefined) updates.maxUsage = maxUsage === "" ? null : Number(maxUsage);
  if (expiresAt) updates.expiresAt = new Date(expiresAt);
  if (status) updates.status = status;

  await Voucher.updateOne({ _id: id }, { $set: updates });

  return { message: "Cập nhật mã giảm giá thành công" };
};

export const deleteItem = async (req: Request) => {
  const { id } = req.params;

  const deletedItem = await Voucher.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() }, { new: true });
  if (!deletedItem) {
    throw new HttpError(404, "Mã giảm giá không tồn tại!");
  }

  return { message: "Đã đưa vào thùng rác", voucher: deletedItem };
};

export const getTrash = async (_req: Request) => {
  const trashedList = await Voucher.find({ deleted: true }).sort({ deletedAt: -1 });
  return { trashedList };
};

export const restoreItem = async (req: Request) => {
  const { id } = req.params;
  const restoredItem = await Voucher.findByIdAndUpdate(id, { deleted: false, deletedAt: null }, { new: true });
  if (!restoredItem) {
    throw new HttpError(404, "Mã giảm giá không tồn tại trong thùng rác!");
  }
  return { message: "Khôi phục thành công", voucher: restoredItem };
};

export const hardDeleteItem = async (req: Request) => {
  const { id } = req.params;
  const deletedItem = await Voucher.findByIdAndDelete(id);
  if (!deletedItem) {
    throw new HttpError(404, "Mã giảm giá không tồn tại!");
  }
  return { message: "Đã xóa vĩnh viễn", voucher: deletedItem };
};

// --- CLIENT LOGIC ---

export const applyVoucher = async (req: Request) => {
  const { code, cartTotal } = req.body as { code: string; cartTotal: number };

  if (!code) throw new HttpError(400, "Vui lòng nhập mã giảm giá");
  const total = Number(cartTotal) || 0;

  const voucher = await Voucher.findOne({ code: code.toUpperCase(), deleted: false, status: "active" });

  if (!voucher) throw new HttpError(404, "Mã giảm giá không hợp lệ hoặc đã bị khóa");

  if (voucher.expiresAt < new Date()) {
    throw new HttpError(400, "Mã giảm giá đã hết hạn");
  }

  if (voucher.maxUsage != null && (voucher.usedCount ?? 0) >= voucher.maxUsage) {
    throw new HttpError(400, "Mã giảm giá đã hết lượt sử dụng");
  }

  if (voucher.minOrderValue !== undefined && voucher.minOrderValue > 0 && total < voucher.minOrderValue) {
    throw new HttpError(400, `Đơn hàng tối thiểu phải từ ${voucher.minOrderValue.toLocaleString("vi-VN")}đ`);
  }

  let discountAmount = 0;
  if (voucher.discountType === "percent") {
    discountAmount = (total * voucher.discountValue) / 100;
  } else {
    discountAmount = voucher.discountValue;
  }

  if (discountAmount > total) discountAmount = total;

  return {
    message: "Áp mã thành công",
    discount: discountAmount,
    voucherCode: voucher.code
  };
};
