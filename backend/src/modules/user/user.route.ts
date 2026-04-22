import { Router } from "express";
import * as userController from "./user.controller";
import { validate } from "../../middlewares/validate.middleware";
import { objectIdParamSchema } from "../../validates/common.validation";

const router = Router();

router.get("/list", userController.list);

router.patch("/status/:id", validate({ params: objectIdParamSchema }), userController.patchStatus);

export default router;
