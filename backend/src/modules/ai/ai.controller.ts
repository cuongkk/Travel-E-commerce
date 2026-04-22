import type { Request, Response } from "express";
import { HttpError } from "../../middlewares/error.middleware";
import { generateTourSchedule, generateJournalContent } from "./ai.service";

export const generateContent = async (req: Request, res: Response) => {
  const { type, name, time, title, category } = req.body;

  try {
    if (type === "tour-schedule") {
      if (!name || !time) {
        throw new HttpError(400, "Vui lòng cung cấp tên tour (name) và thời gian (time).");
      }
      const schedule = await generateTourSchedule(name, time);
      res.status(200).json({ code: "success", data: schedule, message: "Sinh lịch trình bằng AI thành công!" });
    } else if (type === "journal-content") {
      if (!title || !category) {
        throw new HttpError(400, "Vui lòng cung cấp tiêu đề (title) và chuyên mục (category).");
      }
      const htmlContent = await generateJournalContent(title, category);
      res.status(200).json({ code: "success", data: htmlContent, message: "Sinh bài viết SEO bằng AI thành công!" });
    } else {
      throw new HttpError(400, "Loại nội dung (type) không hợp lệ.");
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ code: "error", message: error.message || "Lỗi khi gọi AI API" });
  }
};
