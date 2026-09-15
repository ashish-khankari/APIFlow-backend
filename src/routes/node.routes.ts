import { Router } from "express";
import { createNodeController, getNodeFlowController } from "../controllers/node.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const route = Router();

route.post('/node', authenticateToken, createNodeController);
route.get('/node/:flowId', authenticateToken, getNodeFlowController);

export default route;