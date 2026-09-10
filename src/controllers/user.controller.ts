import { hashPassword } from "./../utils/user.utils";
import { NextFunction, Request, Response } from "express";
import {
  deleteUserByID,
  getAllUsersService,
  getUserByIdService,
  isUserAuthorizedToLogin,
  registerUserService,
} from "../services/user.service";
import { responseStatus } from "../utils/status";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const hashedPassword = await hashPassword(req.body.password);
    const user = await registerUserService(req.body, hashedPassword);
    return responseStatus(res, 201, "User registered successfully", user);
  } catch (error: any) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return responseStatus(res, 400, "Invalid user id");
    }

    const user = await getUserByIdService(id);
    return responseStatus(res, 200, "User Fetched Succesfully", user);
  } catch (error: any) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await getAllUsersService();
    return responseStatus(res, 200, "User Fetched Succesfully", users);
  } catch (error: any) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = Number(req.params.id);
  try {
    await deleteUserByID(id);
    return responseStatus(res, 200, "User Deleted Succesfully");
  } catch (error: any) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = req.body?.email?.trim();
  const password = req.body?.password;

  if (!email || !password) {
    return responseStatus(res, 400, "Email and password are required");
  }

  try {
    const { user, token } = await isUserAuthorizedToLogin(email, password);
    const data = { user, token };
    return responseStatus(res, 200, "User logged in successfully", data);
  } catch (error: any) {
    if (error.message === "Invalid email or password") {
      return responseStatus(res, 401, error.message);
    }
    next(error);
  }
};
