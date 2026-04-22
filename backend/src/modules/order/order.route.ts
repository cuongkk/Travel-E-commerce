import { Router } from "express";
import * as orderController from "./order.controller";
import { validate } from "../../middlewares/validate.middleware";
import { objectIdParamSchema } from "../../validates/common.validation";

const router = Router();

router.get("/list", orderController.list);

router.get("/edit/:id", validate({ params: objectIdParamSchema }), orderController.edit);

router.patch("/edit/:id", validate({ params: objectIdParamSchema }), orderController.editPatch);

router.post("/", orderController.create);

export default router;
