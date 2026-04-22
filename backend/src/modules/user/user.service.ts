import type { Request } from "express";
import AccountAdmin from "../auth/account.model";
import { HttpError } from "../../middlewares/error.middleware";

export const list = async (req: Request): Promise<{ userList: any[] }> => {
  const users = await AccountAdmin.find({ deleted: false })
    .select("-password -refreshTokenHash -refreshTokenJti")
    .sort({ createdAt: "desc" });

  return { userList: users };
};

export const patchStatus = async (req: Request): Promise<any> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    throw new HttpError(400, "Trạng thái không hợp lệ!");
  }

  const user = await AccountAdmin.findOneAndUpdate(
    { _id: id, deleted: false },
    { $set: { status } },
    { new: true }
  ).select("-password -refreshTokenHash -refreshTokenJti");

  if (!user) {
    throw new HttpError(404, "Người dùng không tồn tại!");
  }

  return user;
};
