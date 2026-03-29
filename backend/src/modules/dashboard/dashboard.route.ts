import { Router } from "express";
import * as dashboardController from "./dashboard.controller";

const router = Router();

router.get("/", dashboardController.dashboard);

router.post("/revenue-chart", dashboardController.revenueChartPost);

export default router;
