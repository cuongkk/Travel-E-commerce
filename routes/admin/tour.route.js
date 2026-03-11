const router = require("express").Router();

const tourController = require("../../controllers/admin/tour.controller.js");

const cloudinaryHelper = require("../../helpers/cloudinary.helper.js");
const tourValidate = require("../../validates/admin/tour.validate.js");

const multer = require("multer");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", tourController.list);

router.get("/create", tourController.create);

router.post("/create", upload.single("avatar"), tourValidate.createPost, tourController.createPost);

router.get("/edit/:id", tourController.edit);

router.patch("/edit/:id", upload.single("avatar"), tourValidate.createPost, tourController.editPatch);

router.patch("/delete/:id", tourController.deletePatch);

router.patch("/undo/:id", tourController.undoPatch);

router.delete("/destroy/:id", tourController.destroyDel);

router.get("/trash", tourController.trash);

router.patch("/change-multi", tourValidate.changeMultiPatch, tourController.changeMultiPatch);
module.exports = router;
