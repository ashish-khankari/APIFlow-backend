import { flowInterface } from "../controllers/flow.controller"
import { createFlow, deleteFlow, fetchSingleFlow, getAllFlow } from "../repository/flow.repository";

export const createFlowService = async (data: flowInterface) => {
    if (!data?.flow_name || !data?.flow_description) {
        const error: any = new Error("Flow name and flow description are required");
        error.statusCode = 400;
        throw error;
    };

    await createFlow(data);
}

export const getAllFlowService = async (id: number) => {
    const allFlowData = await getAllFlow(id);
    return allFlowData;
}

export const deleteFlowService = async (user_id: number, id: string) => {
    await fetchSingleFlowService(user_id, id);
    await deleteFlow(user_id, id);
}

export const fetchSingleFlowService = async (user_id: number, id: string) => {
    const singleFlowData = await fetchSingleFlow(user_id, id);
    if (!singleFlowData) {
        const error: any = new Error("Flow not found");
        error.statusCode = 404;
        throw error;
    }
    return singleFlowData;
}