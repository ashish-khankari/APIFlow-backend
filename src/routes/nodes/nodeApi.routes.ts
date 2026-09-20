import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import { createNodeApiController, deleteNodeApiController, getNodeApiController } from "../../controllers/nodes/nodeApi.controller";

const route = Router();

route.post('/node-api', authenticateToken, createNodeApiController);
route.get('/node-api/:nodeId', authenticateToken, getNodeApiController);
route.delete('/node-api/:nodeId', authenticateToken, deleteNodeApiController);

export default route;

