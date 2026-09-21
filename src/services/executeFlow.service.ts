import { executeFlow, getExecutionHistory, getExecutionRunDetail } from "../repository/execteFlow.repository";

export const executeFlowService = async (flowId: number, userId: number) => {
    return await executeFlow(flowId, userId);
}

export const getExecutionHistoryService = async (flowId: number, userId: number) => {
    return await getExecutionHistory(flowId, userId);
}
export const getExecutionRunDetailService = async (runId: string, userId: number) => {
    return await getExecutionRunDetail(runId, userId);
}
