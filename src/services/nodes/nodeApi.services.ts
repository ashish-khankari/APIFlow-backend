import { NodeFlowInterface } from "../../controllers/nodes/nodeApi.controller";
import { createNodeApi, deleteNodeApi, getAllNodeApi, getNodeApi } from "../../repository/nodes/nodeApi.repository";

export const createNodeApiService = async (data: NodeFlowInterface) => {
    return await createNodeApi(data);
}

export const getAllNodeApiService = async (user_id: number, flowId: number) => {
    return await getAllNodeApi(user_id, flowId);
}

export const getNodeApiService = async (id: number, user_id: number, flowId: number) => {
    return await getNodeApi(id, user_id, flowId);
}

export const deleteNodeApiService = async (id: number, flowId: number) => {
    return await deleteNodeApi(id, flowId);
}