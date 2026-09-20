import { NodeFlowInterface } from "../../controllers/nodes/nodeApi.controller";
import { createNodeApi, deleteNodeApi, getNodeApi } from "../../repository/nodes/nodeApi.repository";

export const createNodeApiService = async (data: NodeFlowInterface) => {
    return await createNodeApi(data);
}

export const getNodeApiService = async (nodeId: number, userId: number) => {
    return await getNodeApi(nodeId, userId);
}

export const deleteNodeApiService = async (nodeId: number, userId: number) => {
    return await deleteNodeApi(nodeId, userId);
}