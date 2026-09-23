import { NodeFlowInterface } from "../../controllers/nodes/nodeApi.controller";
import { createNodeApi, deleteNodeApi, getAllNodeApi, getNodeApi, updateNodeApi } from "../../repository/nodes/nodeApi.repository";

export const createNodeApiService = async (data: NodeFlowInterface) => {
    return await createNodeApi(data);
}

export const getAllNodeApiService = async (user_id: number, flowId: number) => {
    return await getAllNodeApi(user_id, flowId);
}

export const getNodeApiService = async (id: number, user_id: number, flowId: number) => {
    return await getNodeApi(id, user_id, flowId);
}

export const updateNodeApiService = async (id: number, flowId: number, data: NodeFlowInterface) => {
    return await updateNodeApi(id, flowId, data);
}

export const deleteNodeApiService = async (id: number, flowId: number) => {
    return await deleteNodeApi(id, flowId);
}