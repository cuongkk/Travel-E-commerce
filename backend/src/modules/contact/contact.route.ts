import { Router } from "express";
import * as contactController from "./contact.controller";

const router = Router();

router.get("/list", contactController.list);

export default router;
