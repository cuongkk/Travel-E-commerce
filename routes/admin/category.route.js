const router = require("express").Router();

const categoryController = require("../../controllers/admin/category.controller.js");
const cloudinaryHelper = require("../../helpers/cloundinary.helper.js");
const categoryValidate = require("../../validates/admin/category.validate.js");
const multer = require("multer");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", categoryController.list);

router.get("/create", categoryController.create);

router.post("/create", upload.single("avatar"), categoryValidate.createPost, categoryController.createPost);

module.exports = router;
