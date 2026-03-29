import type { Request, Response } from "express";
import { searchToursForView } from "./service";
import { parseSearchListQuery } from "./validate";

export const SearchController = {
  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const query = parseSearchListQuery(req.query);
      const tourList = await searchToursForView(query);
      res.json({
        code: "success",
        message: "Lấy danh sách tour tìm kiếm thành công!",
        tours: tourList,
      });
    } catch (error) {
      res.json({
        code: "error",
        message: "Lấy danh sách tour tìm kiếm thất bại!",
      });
    }
  },
};
