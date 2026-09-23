import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import { createNodeApiController, deleteNodeApiController, getAllNodeApiController, getNodeApiController, updateNodeApiController } from "../../controllers/nodes/nodeApi.controller";

const route = Router();

route.post('/node-api', authenticateToken, createNodeApiController);
route.get('/node-api/:flowId', authenticateToken, getAllNodeApiController);
route.get('/node-api/:flowId/:id', authenticateToken, getNodeApiController);
route.patch('/node-api/:flowId/:id', authenticateToken, updateNodeApiController);
route.delete('/node-api/:flowId/:id', authenticateToken, deleteNodeApiController);

export default route;
