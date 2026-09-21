import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { executeFlowController } from "../controllers/executeFlow.controller";

const route = Router();

route.get('/execute/:flowId', authenticateToken, executeFlowController);

export default route;