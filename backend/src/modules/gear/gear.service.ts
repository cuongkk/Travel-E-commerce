import type { Request } from "express";
import Gear from "./gear.model";

const normalizeStatus = (value: unknown): "active" | "inactive" => {
  return String(value || "active") === "inactive" ? "inactive" : "active";
};

const normalizePrice = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

export const list = async (_req: Request): Promise<{ gearList: any[] }> => {
  const gearList = await Gear.find({ deleted: false }).sort({ createdAt: -1 });
  return { gearList };
};

export const createPost = async (req: Request): Promise<{ code: "success" | "error"; message: string }> => {
  const anyReq = req as any;

  const payload = {
    name: String(anyReq.body?.name || "").trim(),
    category: String(anyReq.body?.category || "").trim(),
    subtitle: String(anyReq.body?.subtitle || "").trim(),
    description: String(anyReq.body?.description || "").trim(),
    price: normalizePrice(anyReq.body?.price),
    image: String(anyReq.body?.image || "").trim(),
    badge: String(anyReq.body?.badge || "").trim(),
    status: normalizeStatus(anyReq.body?.status),
  };

  if (!payload.name || !payload.category || !payload.image) {
    return {
      code: "error",
      message: "Thiếu thông tin bắt buộc của gear!",
    };
  }

  const record = new Gear(payload);
  await record.save();

  return {
    code: "success",
    message: "Tạo gear thành công!",
  };
};

export const edit = async (req: Request): Promise<{ gearDetail: any } | { code: "success" | "error"; message: string }> => {
  const { id } = req.params as { id: string };
  const gearDetail = await Gear.findOne({ _id: id, deleted: false });

  if (!gearDetail) {
    return {
      code: "error",
      message: "Gear không tồn tại!",
    };
  }

  return { gearDetail };
};

export const deleteItem = async (req: Request): Promise<any> => {
  const { id } = req.params;

  const deletedItem = await Gear.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() }, { new: true });
  if (!deletedItem) {
    throw new Error("Gear không tồn tại!");
  }

  return { deletedGear: deletedItem };
};

export const getTrash = async (_req: Request): Promise<{ gearList: any[] }> => {
  const gearList = await Gear.find({ deleted: true }).sort({ deletedAt: -1 });
  return { gearList };
};

export const restoreItem = async (req: Request): Promise<any> => {
  const { id } = req.params;

  const restoredItem = await Gear.findByIdAndUpdate(id, { deleted: false, deletedAt: null }, { new: true });
  if (!restoredItem) {
    throw new Error("Gear không tồn tại trong thùng rác!");
  }

  return { restoredGear: restoredItem };
};

export const hardDeleteItem = async (req: Request): Promise<any> => {
  const { id } = req.params;

  const deletedItem = await Gear.findByIdAndDelete(id);
  if (!deletedItem) {
    throw new Error("Gear không tồn tại!");
  }

  return { deletedGear: deletedItem };
};

export const editPatch = async (req: Request): Promise<{ code: "success" | "error"; message: string }> => {
  const { id } = req.params as { id: string };
  const anyReq = req as any;

  const gearDetail = await Gear.findOne({ _id: id, deleted: false });
  if (!gearDetail) {
    return {
      code: "error",
      message: "Gear không tồn tại!",
    };
  }

  const payload = {
    name: String(anyReq.body?.name || "").trim(),
    category: String(anyReq.body?.category || "").trim(),
    subtitle: String(anyReq.body?.subtitle || "").trim(),
    description: String(anyReq.body?.description || "").trim(),
    price: normalizePrice(anyReq.body?.price),
    image: String(anyReq.body?.image || "").trim(),
    badge: String(anyReq.body?.badge || "").trim(),
    status: normalizeStatus(anyReq.body?.status),
  };

  if (!payload.name || !payload.category || !payload.image) {
    return {
      code: "error",
      message: "Thiếu thông tin bắt buộc của gear!",
    };
  }

  await Gear.updateOne({ _id: id }, payload);

  return {
    code: "success",
    message: "Cập nhật gear thành công!",
  };
};
