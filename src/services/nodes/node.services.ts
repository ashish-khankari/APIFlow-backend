import { CreateNodeSlicesInterface, NodeFlowInterface, NodeIdsInterface } from "../../controllers/node.controller"
import { createNode, deleteNodeFlow, getAllNodeFlow, getNodeFlow } from "../../repository/nodes/node.details.repository";
import { createNodesSlice, getAllNodeSlice, getNode, deleteNodeById, updateNodeById } from "../../repository/nodes/node.repository";

export const createNodeSliceService = async (data: CreateNodeSlicesInterface) => {
    return await createNodesSlice(data);
}

export const getAllNodeSliceService = async (id: number, flowId: number) => {
    return await getAllNodeSlice(id, flowId);
}

export const getNodeService = async (ids: NodeIdsInterface) => {
    return await getNode(ids);
}

export const deleteNodeByIdService = async (id: number, flowId: number, node_order: number) => {
    return await deleteNodeById(id, flowId, node_order);
}

export const updateNodeByIdService = async (id: number, flowId: number, data: CreateNodeSlicesInterface) => {
    return await updateNodeById(id, flowId, data);
}

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