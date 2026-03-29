import type { Request, Response } from "express";
import * as categoryService from "./category.service";

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await categoryService.list(req);
    res.json({ code: "success", message: "Lấy danh sách danh mục thành công!", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy danh sách danh mục thất bại!" });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await categoryService.create(req);
    res.json({ code: "success", message: "Lấy dữ liệu tạo danh mục thành công!", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy dữ liệu tạo danh mục thất bại!" });
  }
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await categoryService.createPost(req);
    res.json(result);
  } catch (error) {
    res.json({
      result: "error",
      message: "Đã có lỗi xảy ra!",
    });
  }
};

export const edit = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await categoryService.edit(req);
    if ((data as any).code === "error") {
      res.json(data);
      return;
    }
    res.json({ code: "success", message: "Lấy dữ liệu chỉnh sửa danh mục thành công!", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy dữ liệu chỉnh sửa danh mục thất bại!" });
  }
};

export const editPatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await categoryService.editPatch(req);
    res.json(result);
  } catch (error) {
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra!",
    });
  }
};

export const deletePatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await categoryService.deletePatch(req);
    res.json(result);
  } catch (error) {
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra!",
    });
  }
};
