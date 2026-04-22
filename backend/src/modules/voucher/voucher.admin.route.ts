import { Router } from "express";
import * as voucherController from "./voucher.controller";

const router = Router();

router.get("/list", voucherController.list);
router.post("/create", voucherController.createPost);
router.patch("/edit/:id", voucherController.editPatch);
router.delete("/delete/:id", voucherController.deleteItem);

router.get("/trash", voucherController.getTrash);
router.patch("/restore/:id", voucherController.restoreItem);
router.delete("/delete-hard/:id", voucherController.hardDeleteItem);

export default router;
