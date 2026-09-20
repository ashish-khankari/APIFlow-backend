import { Response, NextFunction } from "express"
import { AuthRequest } from "../../middleware/auth.middleware"
import { responseStatus } from "../../utils/status";
import { createNodeSliceService, deleteNodeByIdService, getAllNodeSliceService, getNodeService, updateNodeByIdService } from "../../services/nodes/node.services";

export interface CreateNodeSlicesInterface {
    id?: number,
    node_title: string,
    node_description?: string,
    flow_id: number,
    user_id: number,
    node_order?: number,
}

export interface NodeIdsInterface {
    id?: number,
    flowId?: number,
    userId?: number,
}

export const createNodeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { flow_id, node_title, node_description } = req.body;
        const parsedFlowId = Number(flow_id);

        if (!flow_id || isNaN(parsedFlowId) || parsedFlowId <= 0) {
            return responseStatus(res, 400, "A valid positive flow_id is required");
        }

        if (!node_title || typeof node_title !== "string" || !node_title.trim()) {
            return responseStatus(res, 400, "node_title is required and cannot be empty");
        }

        const data: CreateNodeSlicesInterface = {
            flow_id: parsedFlowId,
            node_title: node_title.trim(),
            node_description: typeof node_description === "string" ? node_description.trim() : undefined,
            user_id: Number(req.user?.id),
        };

        const createdNode = await createNodeSliceService(data);
        return responseStatus(res, 201, "Node created successfully", createdNode);
    } catch (error) {
        next(error);
    }
}

export const getAllNodeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.user?.id);
        const flowId = Number(req.params?.flowId);

        if (isNaN(flowId) || flowId <= 0) {
            return responseStatus(res, 400, "A valid flowId parameter is required");
        }

        const node = await getAllNodeSliceService(id, flowId);
        return responseStatus(res, 200, "Node fetched successfully", node);
    } catch (error) {
        next(error);
    }
}

export const getNodeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params?.id);
        const flowId = Number(req.params?.flowId);

        if (isNaN(id) || id <= 0 || isNaN(flowId) || flowId <= 0) {
            return responseStatus(res, 400, "Valid flowId and node id parameters are required");
        }

        const ids: NodeIdsInterface = {
            id,
            flowId,
            userId: Number(req.user?.id),
        };
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

        if (isNaN(id) || id <= 0 || isNaN(flowId) || flowId <= 0) {
            return responseStatus(res, 400, "Valid flowId and node id parameters are required");
        }

        const userId = Number(req.user?.id);
        const node = await deleteNodeByIdService(id, flowId, userId);
        return responseStatus(res, 200, "Node deleted successfully", node);
    } catch (error) {
        next(error);
    }
}

export const updateNodeByIdController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params?.id);
        const flowId = Number(req.params?.flowId);

        if (isNaN(id) || id <= 0 || isNaN(flowId) || flowId <= 0) {
            return responseStatus(res, 400, "Valid flowId and node id parameters are required");
        }

        const { node_title, node_description } = req.body;

        if (node_title === undefined && node_description === undefined) {
            return responseStatus(res, 400, "Please provide at least one field (node_title or node_description) to update");
        }

        if (node_title !== undefined && (typeof node_title !== "string" || !node_title.trim())) {
            return responseStatus(res, 400, "node_title cannot be empty");
        }

        const data: Partial<CreateNodeSlicesInterface> = {};
        if (node_title !== undefined) {
            data.node_title = node_title.trim();
        }
        if (node_description !== undefined) {
            data.node_description = typeof node_description === "string" ? node_description.trim() : node_description;
        }

        const userId = Number(req.user?.id);
        const updatedNode = await updateNodeByIdService(id, flowId, userId, data);
        return responseStatus(res, 200, "Node updated successfully", updatedNode);
    } catch (error) {
        next(error);
    }
}
