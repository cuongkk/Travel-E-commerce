import { Router } from "express";
import * as reviewController from "./review.controller";
import { verifyToken } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/create", verifyToken, reviewController.createReview);
router.get("/list", reviewController.getReviewsByItem); // Public list

export default router;
