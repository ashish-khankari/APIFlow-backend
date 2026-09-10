import { Router } from "express";
import { getFlowController } from "../controllers/flow.controller";

const route = Router();

route.get('/flow', getFlowController)

export default route;
