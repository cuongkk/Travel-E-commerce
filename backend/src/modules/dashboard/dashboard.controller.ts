import type { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export const dashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const overview = await dashboardService.dashboard(req);
    res.json({
      code: "success",
      message: "Lấy dữ liệu dashboard thành công!",
      overview,
    });
  } catch (error) {
    res.json({ code: "error", message: "Lấy dữ liệu dashboard thất bại!" });
  }
};

export const revenueChartPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await dashboardService.revenueChartPost(req);
    res.json({ code: "success", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy dữ liệu biểu đồ thất bại!" });
  }
};
