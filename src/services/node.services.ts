import { NodeFlowInterface } from "../controllers/node.controller"
import { createNode, getNodeFlow } from "../repository/node.repository";

export const createNodeService = async (data: NodeFlowInterface) => {
    return await createNode(data);
}

export const getNodeFlowService = async (id: number, flowId: number) => {
    return await getNodeFlow(id, flowId);
}