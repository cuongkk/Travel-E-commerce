import { Router } from "express";
import { CartController } from "./cart.controller";

const cartRouter = Router();

cartRouter.get("/", CartController.cart);
cartRouter.post("/render", CartController.render);

export default cartRouter;
