import { Router } from "express";
import multer from "multer";
import * as authController from "./auth.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { storage } from "../../utils/cloudinary.helper";
import {
  changePasswordBodySchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  otpBodySchema,
  refreshBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
  updateProfileBodySchema,
  walletPayBodySchema,
} from "./auth.validation";

const router = Router();
const upload = multer({ storage });

router.get("/login", authController.login);
router.post("/login", validate({ body: loginBodySchema }), authController.loginPost);

router.get("/register", authController.register);
router.post("/register", validate({ body: registerBodySchema }), authController.registerPost);

router.get("/forgot-password", authController.forgotPassword);
router.post("/forgot-password", validate({ body: forgotPasswordBodySchema }), authController.forgotPasswordPost);

router.get("/otp-password", authController.otpPassword);
router.post("/otp-password", validate({ body: otpBodySchema }), authController.otpPasswordPost);

router.get("/reset-password", authController.resetPassword);
router.post("/reset-password", verifyToken, validate({ body: resetPasswordBodySchema }), authController.resetPasswordPost);

router.get("/me", verifyToken, authController.getMe);
router.patch("/me", verifyToken, validate({ body: updateProfileBodySchema }), authController.updateMePatch);
router.post("/avatar/upload", verifyToken, upload.single("avatar"), authController.uploadAvatarPost);
router.patch("/change-password", verifyToken, validate({ body: changePasswordBodySchema }), authController.changePasswordPatch);
router.get("/wallet/balance", verifyToken, authController.walletBalance);
router.post("/wallet/pay", verifyToken, validate({ body: walletPayBodySchema }), authController.walletPayPost);

router.get("/wishlist", verifyToken, authController.getWishlist);
router.post("/wishlist/toggle", verifyToken, authController.toggleWishlist);

router.get("/logout", authController.logout);

router.post("/refresh", validate({ body: refreshBodySchema }), authController.refreshPost);

export default router;
