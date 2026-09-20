import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { NodeFlowInterface } from "./node.controller";
import { responseStatus } from "../../utils/status";
import { createNodeApiService, deleteNodeApiService, getAllNodeApiService, getNodeApiService } from "../../services/nodes/nodeApi.services";

export const createNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data: NodeFlowInterface = req.body;
        if (!data.flow_id || !data.node_title) {
            return responseStatus(res, 404, "Invalid data");
        }
        data.user_id = req.user?.id as number;
        const createdNode = await createNodeApiService(data);
        return responseStatus(res, 200, "Node created successfully", createdNode);
    } catch (error) {
        next(error);
    }
}

export const getAllNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.user?.id);
        const flowId = Number(req.params?.flowId);
        const node = await getAllNodeApiService(id, flowId);
        return responseStatus(res, 200, "Node fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const getNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params?.id);
        const flowId = Number(req.params?.flowId);
        const node = await getNodeApiService(id, flowId);
        return responseStatus(res, 200, "Node fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const deleteNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params?.id);
        const flowId = Number(req.params?.flowId);
        const node = await deleteNodeApiService(id, flowId);
        return responseStatus(res, 200, "Node deleted successfully", node);
    } catch (error) {
        next(error);
    }
}
