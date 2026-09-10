import { Request, Response } from "express";
import { responseStatus } from "../utils/status";

export const getFlowController = (req: Request, res: Response) => {
    return responseStatus(res, 200, "Flow controller is working");
}