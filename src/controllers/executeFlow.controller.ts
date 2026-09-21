import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { responseStatus } from "../utils/status";
import { executeFlowService, getExecutionHistoryService, getExecutionRunDetailService } from "../services/executeFlow.service";

export const executeFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const flowId = Number(req.params?.flowId);
        const userId = Number(req.user?.id);

        if (!flowId) {
            return responseStatus(res, 400, 'Flow Id is required');
        }

        const result = await executeFlowService(flowId, userId)
        return responseStatus(res, 200, 'Success', result);
    } catch (error) {
        next(error);
    }
}

export const getExecutionHistoryController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const flowId = Number(req.params?.flowId);
        const userId = Number(req.user?.id);
        const history = await getExecutionHistoryService(flowId, userId);
        return responseStatus(res, 200, 'Execution history fetched', history);
    } catch (error) { next(error); }
}

export const getExecutionRunDetailController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const runId = req.params?.runId as string;
        const userId = Number(req.user?.id);
        const detail = await getExecutionRunDetailService(runId, userId);
        return responseStatus(res, 200, 'Run detail fetched', detail);
    } catch (error) { next(error); }
}
