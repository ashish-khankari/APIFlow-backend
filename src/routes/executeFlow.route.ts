import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { executeFlowController, getExecutionHistoryController, getExecutionRunDetailController } from "../controllers/executeFlow.controller";

const route = Router();

route.get('/execute/run/:runId', authenticateToken, getExecutionRunDetailController);
route.get('/execute/:flowId', authenticateToken, executeFlowController);
route.get('/execute/:flowId/history', authenticateToken, getExecutionHistoryController);

export default route;