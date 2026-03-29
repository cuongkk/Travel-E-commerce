import { Router } from "express";
import multer from "multer";
import * as categoryController from "./category.controller";
import { storage } from "../../utils/cloudinary.helper";

const router = Router();

const upload = multer({ storage: storage });

router.get("/list", categoryController.list);

router.get("/create", categoryController.create);

router.post("/create", upload.single("avatar"), categoryController.createPost);

router.get("/edit/:id", categoryController.edit);

router.patch("/edit/:id", upload.single("avatar"), categoryController.editPatch);

router.patch("/delete/:id", categoryController.deletePatch);

export default router;
