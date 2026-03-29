import type { Request, Response } from "express";
import * as tourService from "./tour.service";

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await tourService.list(req);
    res.json({ code: "success", message: "Lấy danh sách tour thành công!", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy danh sách tour thất bại!" });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await tourService.create(req);
    res.json({ code: "success", message: "Lấy dữ liệu tạo tour thành công!", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy dữ liệu tạo tour thất bại!" });
  }
};

export const createPost = (req: Request, res: Response): Promise<void> => {
  return tourService
    .createPost(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Tạo tour thất bại!" });
    });
};

export const trash = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await tourService.trash(req);
    res.json({ code: "success", message: "Lấy danh sách tour trong thùng rác thành công!", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy danh sách tour trong thùng rác thất bại!" });
  }
};

export const edit = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await tourService.edit(req);
    if ((data as any).code === "error") {
      res.json(data);
      return;
    }
    res.json({ code: "success", message: "Lấy dữ liệu chỉnh sửa tour thành công!", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy dữ liệu chỉnh sửa tour thất bại!" });
  }
};

export const editPatch = (req: Request, res: Response): Promise<void> => {
  return tourService
    .editPatch(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Cập nhật tour thất bại!" });
    });
};

export const deletePatch = (req: Request, res: Response): Promise<void> => {
  return tourService
    .deletePatch(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Xóa tour thất bại!" });
    });
};

export const undoPatch = (req: Request, res: Response): Promise<void> => {
  return tourService
    .undoPatch(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Khôi phục tour thất bại!" });
    });
};

export const destroyDel = (req: Request, res: Response): Promise<void> => {
  return tourService
    .destroyDel(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Xóa vĩnh viễn tour thất bại!" });
    });
};

export const changeMultiPatch = (req: Request, res: Response): Promise<void> => {
  return tourService
    .changeMultiPatch(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Thao tác hàng loạt tour thất bại!" });
    });
};
