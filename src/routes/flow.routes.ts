import { Router } from "express";
import { createFlowController, getFlowController } from "../controllers/flow.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const route = Router();

route.post('/flow', authenticateToken, createFlowController)
route.get('/flow/:id', authenticateToken, getFlowController)
// route.get('/flows', authenticateToken, getFlowsController)

export default route;
