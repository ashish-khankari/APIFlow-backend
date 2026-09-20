import { NodeFlowInterface } from "../../controllers/nodes/node.controller";
import { createNode, deleteNodeFlow, getAllNodeFlow, getNodeFlow } from "../../repository/nodes/nodeApi.repository";

export const createNodeService = async (data: NodeFlowInterface) => {
    return await createNode(data);
}

export const getAllNodeFlowService = async (id: number, flowId: number) => {
    return await getAllNodeFlow(id, flowId);
}

export const getNodeFlowService = async (id: number, flowId: number) => {
    return await getNodeFlow(id, flowId);
}

export const deleteNodeFlowService = async (id: number, flowId: number) => {
    return await deleteNodeFlow(id, flowId);
}