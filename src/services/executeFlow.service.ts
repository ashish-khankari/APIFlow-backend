import crypto from "crypto";
import { flowQueue } from "../queue/flow.queue";
import { executeFlow, getExecutionHistory, getExecutionRunDetail } from "../repository/execteFlow.repository";

export const executeFlowService = async (flowId: number, userId: number) => {
    const runId = crypto.randomUUID();

    // Push execution job to Redis queue backed by BullMQ
    await flowQueue.add("run-flow", { flowId, userId, runId });

    return { runId };
};

export const runFlowWorkerService = async (flowId: number, userId: number, runId: string) => {
    return await executeFlow(flowId, userId, runId);
};

export const getExecutionHistoryService = async (flowId: number, userId: number) => {
    return await getExecutionHistory(flowId, userId);
}
export const getExecutionRunDetailService = async (runId: string, userId: number) => {
    return await getExecutionRunDetail(runId, userId);
}
