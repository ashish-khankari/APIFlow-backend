import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { responseStatus } from "../utils/status";
import { executeFlowService } from "../services/executeFlow.service";

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