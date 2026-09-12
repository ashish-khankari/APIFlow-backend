import { Router } from "express";
import { createFlowController, deleteFlowController, fetchSingleFlowController, getAllFlowController } from "../controllers/flow.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const route = Router();

route.post('/flow', authenticateToken, createFlowController)
route.get('/flow', authenticateToken, getAllFlowController)
route.delete('/flow/:id', authenticateToken, deleteFlowController)
route.get('/flow/:id', authenticateToken, fetchSingleFlowController)

export default route;
