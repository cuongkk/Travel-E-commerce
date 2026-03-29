import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

router.get("/list", userController.list);

export default router;
