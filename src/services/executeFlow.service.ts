import { executeFlow } from "../repository/execteFlow.repository";

export const executeFlowService = async (flowId: number, userId: number) => {
    return await executeFlow(flowId, userId);
}