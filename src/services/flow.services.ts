import { flowInterface } from "../controllers/flow.controller"
import { createFlow, getAllFlow } from "../repository/flow.repository";

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