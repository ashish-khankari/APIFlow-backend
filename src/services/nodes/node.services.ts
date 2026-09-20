import { CreateNodeSlicesInterface, NodeFlowInterface, NodeIdsInterface } from "../../controllers/nodes/node.controller"
import { createNode, deleteNodeFlow, getAllNodeFlow, getNodeFlow } from "../../repository/nodes/nodeApi.repository";
import { createNodesSlice, getAllNodeSlice, getNode, deleteNodeById, updateNodeById } from "../../repository/nodes/node.repository";

export const createNodeSliceService = async (data: CreateNodeSlicesInterface) => {
    return await createNodesSlice(data);
}

export const getAllNodeSliceService = async (id: number, flowId: number) => {
    return await getAllNodeSlice(id, flowId);
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
    data: Partial<CreateNodeSlicesInterface>
) => {
    return await updateNodeById(id, flowId, userId, data);
}
