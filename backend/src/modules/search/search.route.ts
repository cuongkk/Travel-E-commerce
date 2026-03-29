import { Router } from "express";
import { SearchController } from "./controller";

const searchRouter = Router();

searchRouter.get("/", SearchController.list);

export default searchRouter;
