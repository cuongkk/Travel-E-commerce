import { Router } from "express";
import * as journalController from "./journal.controller";
import { validate } from "../../middlewares/validate.middleware";
import { objectIdParamSchema } from "../../validates/common.validation";

const router = Router();

router.get("/list", journalController.list);
router.post("/create", journalController.createPost);
router.get("/edit/:id", validate({ params: objectIdParamSchema }), journalController.edit);
router.patch("/edit/:id", validate({ params: objectIdParamSchema }), journalController.editPatch);
router.delete("/delete/:id", validate({ params: objectIdParamSchema }), journalController.deleteItem);

router.get("/trash", journalController.getTrash);
router.patch("/restore/:id", validate({ params: objectIdParamSchema }), journalController.restoreItem);
router.delete("/hard-delete/:id", validate({ params: objectIdParamSchema }), journalController.hardDeleteItem);

export default router;
