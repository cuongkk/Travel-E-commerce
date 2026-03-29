import { Router } from "express";
import multer from "multer";
import { storage } from "../../utils/cloudinary.helper";
import * as settingController from "./setting.controller";

const router = Router();

const upload = multer({ storage: storage });

router.get("/list", settingController.list);

router.get("/info-web", settingController.websiteInfo);

router.patch(
  "/website-info",
  upload.fields([
    {
      name: "logo",
      maxCount: 1,
    },
    {
      name: "favicon",
      maxCount: 1,
    },
  ]),
  settingController.websiteInfoPatch,
);

router.get("/account-admin/list", settingController.accountAdminList);

router.get("/account-admin/create", settingController.accountAdminCreate);

router.post("/account-admin/create", upload.single("avatar"), settingController.accountAdminCreatePost);

router.get("/account-admin/edit/:id", settingController.accountAdminEdit);

router.patch("/account-admin/edit/:id", upload.single("avatar"), settingController.accountAdminEditPatch);

router.get("/role/list", settingController.roleList);

router.get("/role/create", settingController.roleCreate);

router.post("/role/create", settingController.roleCreatePost);

router.get("/role/edit/:id", settingController.roleEdit);

router.patch("/role/edit/:id", settingController.roleEditPatch);

export default router;
