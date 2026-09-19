import { Request, Response, NextFunction } from "express"
import { AuthRequest } from "../middleware/auth.middleware"
import { responseStatus } from "../utils/status";
import { createNodeService, createNodeSliceService, deleteNodeFlowService, getAllNodeFlowService, getAllNodeSliceService, getNodeFlowService } from "../services/nodes/node.services";

type nodeMethods =
    "GET" |
    "POST" |
    "PUT" |
    "DELETE" |
    "PATCH"


export interface NodeFlowInterface {
    id: number,
    node_title: string,
    node_description: string,
    node_method: nodeMethods,
    node_base_url: string,
    node_end_point: string,
    node_token: string,
    headers: Record<string, unknown>,
    request_body: Record<string, unknown>,
    flow_id: number,
    user_id: number,
}

export interface CreateNodeSlicesInterface {
    id: number,
    node_title: string,
    node_description: string,
    flow_id: number,
    user_id: number,
    node_order: number,
}

export const createNodeSlicesController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data: CreateNodeSlicesInterface = req.body;
        if (!data.flow_id || !data.node_title) {
            return responseStatus(res, 404, "Invalid data");
        }
        data.user_id = req.user?.id as number;
        const createdNode = await createNodeSliceService(data);
        return responseStatus(res, 200, "Node created successfully", createdNode);
    } catch (error) {
        next(error);
    }
}

export const getAllNodeSliceController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.user?.id);
        const flowId = Number(req.params?.flowId);
        const node = await getAllNodeSliceService(id, flowId);
        return responseStatus(res, 200, "Node fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const createNodeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data: NodeFlowInterface = req.body;
        if (!data.flow_id || !data.node_title) {
            return responseStatus(res, 404, "Invalid data");
        }
        data.user_id = req.user?.id as number;
        const createdNode = await createNodeService(data);
        return responseStatus(res, 200, "Node created successfully", createdNode);
    } catch (error) {
        next(error);
    }
}

export const getAllNodeFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.user?.id);
        const flowId = Number(req.params?.flowId);
        const node = await getAllNodeFlowService(id, flowId);
        return responseStatus(res, 200, "Node fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const getNodeFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params?.id);
        const flowId = Number(req.params?.flowId);
        const node = await getNodeFlowService(id, flowId);
        return responseStatus(res, 200, "Node fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const deleteNodeFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params?.id);
        const flowId = Number(req.params?.flowId);
        const node = await deleteNodeFlowService(id, flowId);
        return responseStatus(res, 200, "Node deleted successfully", node);
    } catch (error) {
        next(error);
    }
}
