import { Router } from "express";
import * as voucherController from "./voucher.controller";

const router = Router();

router.post("/apply", voucherController.applyVoucher);

export default router;
