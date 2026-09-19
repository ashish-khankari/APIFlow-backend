import { Router } from "express";
import {
    createNodeApiController,
    createNodeController,
    deleteNodeApiController,
    deleteNodeByIdController,
    getAllNodeApiController,
    getAllNodeController,
    getNodeApiController,
    getNodeController
} from "../../controllers/node.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const route = Router();

route.post('/node', authenticateToken, createNodeController);
route.get('/node/:flowId', authenticateToken, getAllNodeController);
route.get('/node/:flowId/:id', authenticateToken, getNodeController);
route.delete('/node/:flowId/:id', authenticateToken, deleteNodeByIdController);

route.post('/node-api', authenticateToken, createNodeApiController);
route.get('/node-api/:flowId', authenticateToken, getAllNodeApiController);
route.get('/node-api/:flowId/:id', authenticateToken, getNodeApiController);
route.delete('/node-api/:flowId/:id', authenticateToken, deleteNodeApiController);

export default route;