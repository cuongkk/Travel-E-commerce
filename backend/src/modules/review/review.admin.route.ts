import { Router } from "express";
import * as reviewController from "./review.controller";

const router = Router();

router.get("/list", reviewController.listAdmin);
router.delete("/delete/:id", reviewController.deleteAdmin);

export default router;
