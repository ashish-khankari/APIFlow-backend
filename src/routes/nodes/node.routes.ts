import { Router } from "express";
import {
    createNodeController,
    deleteNodeByIdController,
    getAllNodeController,
    getNodeController,
    updateNodeByIdController
} from "../../controllers/nodes/node.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const route = Router();

route.post('/node', authenticateToken, createNodeController);
route.get('/node/:flowId', authenticateToken, getAllNodeController);
route.get('/node/:flowId/:id', authenticateToken, getNodeController);
route.delete('/node/:flowId/:id', authenticateToken, deleteNodeByIdController);
route.patch('/node/:flowId/:id', authenticateToken, updateNodeByIdController);

export default route;