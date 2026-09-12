import { NextFunction, Request, Response } from "express";
import { responseStatus } from "../utils/status";
import { createFlowService } from "../services/flow.services";
import { AuthRequest } from "../middleware/auth.middleware";

export interface flowInterface {
    flow_name: string,
    flow_description: string,
    user_id: number,
}

export const createFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const data: flowInterface = req.body;
    data.user_id = req.user?.id as number;

    try {
        await createFlowService(data);
        return responseStatus(res, 200, "Flow created successfully");
    } catch (error: any) {
        next(error);
    }
}

export const getFlowController = (req: Request, res: Response) => {
    return responseStatus(res, 200, "Flow controller is working");
}