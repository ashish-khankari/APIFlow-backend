import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { responseStatus } from "../../utils/status";
import { createNodeApiService, deleteNodeApiService, getNodeApiService, updateNodeApiService } from "../../services/nodes/nodeApi.services";

type nodeMethods =
    "GET" |
    "POST" |
    "PUT" |
    "DELETE" |
    "PATCH"


export interface NodeFlowInterface {
    id: number,
    node_id: number,
    flow_id: number,
    user_id: number,
    node_api_method: nodeMethods,
    node_api_base_url: string,
    node_api_endpoint: string,
    node_api_token: string,
    node_api_headers: Record<string, unknown>,
    node_api_request_body: Record<string, unknown>,
    node_api_query: Record<string, unknown>,
    node_api_params: Record<string, unknown>
}
export const createNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data: NodeFlowInterface = req.body;
        if (!data.flow_id || !data.node_id) {
            return responseStatus(res, 404, "Invalid data");
        }
        data.user_id = req.user?.id as number;
        const createdNode = await createNodeApiService(data);
        return responseStatus(res, 200, "Node created successfully", createdNode);
    } catch (error) {
        next(error);
    }
}

export const getNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const nodeId = Number(req.params?.nodeId);
        const userId = req.user?.id as number;
        const node = await getNodeApiService(nodeId, userId);
        return responseStatus(res, 200, "Node API config fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const deleteNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const nodeId = Number(req.params?.nodeId);
        const userId = req.user?.id as number;
        const node = await deleteNodeApiService(nodeId, userId);
        return responseStatus(res, 200, "Node API config deleted successfully", node);
    } catch (error) {
        next(error);
    }
}

export const updateNodeApiController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const nodeId = Number(req.params?.nodeId);
        const userId = req.user?.id as number;
        const data = req.body;
        const updated = await updateNodeApiService(nodeId, userId, data);
        return responseStatus(res, 200, "Node API config updated successfully", updated);
    } catch (error) {
        next(error);
    }
}
