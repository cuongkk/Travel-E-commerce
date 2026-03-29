import { Router } from "express";
import multer from "multer";
import { storage } from "../../utils/cloudinary.helper";
import * as tourController from "./tour.controller";

const router = Router();

const upload = multer({ storage: storage });

router.get("/list", tourController.list);

router.get("/create", tourController.create);

router.post(
  "/create",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  tourController.createPost,
);

router.get("/edit/:id", tourController.edit);

router.patch(
  "/edit/:id",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  tourController.editPatch,
);

router.patch("/delete/:id", tourController.deletePatch);

router.patch("/undo/:id", tourController.undoPatch);

router.delete("/destroy/:id", tourController.destroyDel);

router.get("/trash", tourController.trash);

router.patch("/change-multi", tourController.changeMultiPatch);

export default router;
