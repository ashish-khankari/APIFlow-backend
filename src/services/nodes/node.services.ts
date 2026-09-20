import { CreateNodeInterface, NodeIdsInterface } from "../../controllers/nodes/node.controller"
import { createNode, getAllNodes, getNode, deleteNodeById, updateNodeById } from "../../repository/nodes/node.repository";

export const createNodeService = async (data: CreateNodeInterface) => {
    return await createNode(data);
}

export const getAllNodeService = async (id: number, flowId: number) => {
    return await getAllNodes(id, flowId);
}

export const getNodeService = async (ids: NodeIdsInterface) => {
    const node = await getNode(ids);
    if (!node) {
        const error: any = new Error("Node not found or access denied");
        error.statusCode = 404;
        throw error;
    }
    return node;
}

export const deleteNodeByIdService = async (id: number, flowId: number, userId: number) => {
    return await deleteNodeById(id, flowId, userId);
}

export const updateNodeByIdService = async (
    id: number,
    flowId: number,
    userId: number,
    data: Partial<CreateNodeInterface>
) => {
    return await updateNodeById(id, flowId, userId, data);
}
