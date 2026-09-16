import { Router } from "express";
import { createNodeController, deleteNodeFlowController, getAllNodeFlowController, getNodeFlowController } from "../controllers/node.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const route = Router();

route.post('/node', authenticateToken, createNodeController);
route.get('/node/:flowId', authenticateToken, getAllNodeFlowController);
route.get('/node/:flowId/:id', authenticateToken, getNodeFlowController);
route.delete('/node/:flowId/:id', authenticateToken, deleteNodeFlowController);

export default route;