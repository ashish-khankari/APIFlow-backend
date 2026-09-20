import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import { createNodeApiController, deleteNodeApiController, getNodeApiController, updateNodeApiController } from "../../controllers/nodes/nodeApi.controller";

const route = Router();

route.post('/node-api', authenticateToken, createNodeApiController);
route.get('/node-api/:nodeId', authenticateToken, getNodeApiController);
route.patch('/node-api/:nodeId', authenticateToken, updateNodeApiController);
route.delete('/node-api/:nodeId', authenticateToken, deleteNodeApiController);

export default route;
