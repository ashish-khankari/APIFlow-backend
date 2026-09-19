import { Request, Response, NextFunction } from "express"
import { AuthRequest } from "../middleware/auth.middleware"
import { responseStatus } from "../utils/status";
import { createNodeService, createNodeSliceService, deleteNodeByIdService, deleteNodeFlowService, getAllNodeFlowService, getAllNodeSliceService, getNodeFlowService, getNodeService } from "../services/nodes/node.services";

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

export interface NodeIdsInterface {
    id?: number,
    flowId?: number,
    userId?: number,
}

export const createNodeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const getAllNodeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.user?.id);
        const flowId = Number(req.params?.flowId);
        const node = await getAllNodeSliceService(id, flowId);
        return responseStatus(res, 200, "Node fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const getNodeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ids: NodeIdsInterface = {
            id: Number(req.params?.id),
            flowId: Number(req.params?.flowId),
            userId: Number(req.user?.id),
        }
        const node = await getNodeService(ids);
        return responseStatus(res, 200, "Node fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const deleteNodeByIdController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params?.id);
        const flowId = Number(req.params?.flowId);
        const node_order = Number(req.params?.node_order);
        const node = await deleteNodeByIdService(id, flowId, node_order);
        return responseStatus(res, 200, "Node deleted successfully", node);
    } catch (error) {
        next(error);
    }
}

export const createNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const getAllNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.user?.id);
        const flowId = Number(req.params?.flowId);
        const node = await getAllNodeFlowService(id, flowId);
        return responseStatus(res, 200, "Node fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const getNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params?.id);
        const flowId = Number(req.params?.flowId);
        const node = await getNodeFlowService(id, flowId);
        return responseStatus(res, 200, "Node fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const deleteNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params?.id);
        const flowId = Number(req.params?.flowId);
        const node = await deleteNodeFlowService(id, flowId);
        return responseStatus(res, 200, "Node deleted successfully", node);
    } catch (error) {
        next(error);
    }
}
