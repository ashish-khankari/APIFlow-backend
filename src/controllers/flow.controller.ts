import { NextFunction, Request, Response } from "express";
import { responseStatus } from "../utils/status";
import { createFlowService, deleteFlowService, fetchSingleFlowService, getAllFlowService, updateFlowService } from "../services/flow.services";
import { AuthRequest } from "../middleware/auth.middleware";

export interface flowInterface {
    flow_name: string,
    flow_description: string,
    user_id: number,
    token_key: string
}

export const createFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const data: flowInterface = req.body;
    data.user_id = req.user?.id as number;

    if (!data?.token_key) {
        return responseStatus(res, 404, "Token key_name is required to rotate to token accross the flow");
    }

    try {
        await createFlowService(data);
        return responseStatus(res, 200, "Flow created successfully");
    } catch (error: any) {
        next(error);
    }
}

export const getAllFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const get_user_id = req.user?.id as number;

    try {
        const flows = await getAllFlowService(get_user_id);
        return responseStatus(res, 200, "Fetched flows correctly", flows);
    } catch (error) {
        next(error);
    }
}

export const fetchSingleFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user?.id as number;
        const id = req.params?.id as string;
        const singleFlow = await fetchSingleFlowService(user_id, id);
        return responseStatus(res, 200, "Fetched flow correctly", singleFlow);
    } catch (error) {
        next(error);
    }
}

export const deleteFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user?.id as number;
        const id = req.params?.id as string;
        await deleteFlowService(user_id, id);
        return responseStatus(res, 200, "Deleted flow successfully")
    } catch (error) {
        next(error);
    }
}

export const updateFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { flow_name, flow_description } = req.body;
    if (!flow_name && !flow_description) {
        throw new Error("Please provide at least one field to update.");
    }

    if (!req.params?.id) {
        throw new Error("Please provide flow id");
    }
    try {
        const user_id = req.user?.id as number;
        const id = req.params?.id as string;
        const data: flowInterface = req.body;
        const updatedFlow = await updateFlowService(data, user_id, id);
        return responseStatus(res, 200, "Updated flow successfully", updatedFlow);
    } catch (error) {
        next(error);
    }
}