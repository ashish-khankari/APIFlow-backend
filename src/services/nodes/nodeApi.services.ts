import { NodeFlowInterface } from "../../controllers/nodes/node.controller";
import { createNodeApi, deleteNodeApi, getAllNodeApi, getNodeApi } from "../../repository/nodes/nodeApi.repository";

export const createNodeApiService = async (data: NodeFlowInterface) => {
    return await createNodeApi(data);
}

export const getAllNodeApiService = async (id: number, flowId: number) => {
    return await getAllNodeApi(id, flowId);
}

export const getNodeApiService = async (id: number, flowId: number) => {
    return await getNodeApi(id, flowId);
}

export const deleteNodeApiService = async (id: number, flowId: number) => {
    return await deleteNodeApi(id, flowId);
}