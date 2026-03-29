import type { Request } from "express";

export const list = async (req: Request): Promise<{ pageTitle: string }> => {
  // Giữ API đơn giản, nếu cần sau này có thể trả thêm dữ liệu
  return {
    pageTitle: "Quản lý người dùng",
  };
};
