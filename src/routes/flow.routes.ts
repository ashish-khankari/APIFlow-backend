import { Router } from "express";
import { createFlowController, getAllFlowController } from "../controllers/flow.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const route = Router();

route.post('/flow', authenticateToken, createFlowController)
route.get('/flow', authenticateToken, getAllFlowController)
// route.get('/flows', authenticateToken, getFlow)

export default route;
