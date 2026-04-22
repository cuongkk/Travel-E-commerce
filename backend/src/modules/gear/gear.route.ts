import { Router } from "express";
import * as gearController from "./gear.controller";
import { validate } from "../../middlewares/validate.middleware";
import { objectIdParamSchema } from "../../validates/common.validation";

const router = Router();

router.get("/list", gearController.list);
router.post("/create", gearController.createPost);
router.get("/edit/:id", validate({ params: objectIdParamSchema }), gearController.edit);
router.patch("/edit/:id", validate({ params: objectIdParamSchema }), gearController.editPatch);
router.delete("/delete/:id", validate({ params: objectIdParamSchema }), gearController.deleteItem);

router.get("/trash", gearController.getTrash);
router.patch("/restore/:id", validate({ params: objectIdParamSchema }), gearController.restoreItem);
router.delete("/hard-delete/:id", validate({ params: objectIdParamSchema }), gearController.hardDeleteItem);

export default router;
