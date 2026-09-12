import bcrypt from "bcrypt";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserByID,
} from "../repository/user.repository";
import { User } from "../types/user.types";
import { findUser, validateUser } from "../validation/user.valiadation";
import { generateToken } from "../utils/jwt.utils";

export const registerUserService = async (data: User, password: string) => {
  const users = await findUser(data.email, data.company_name);

  const emailExists = users.find((user) => user.email === data.email);

  if (emailExists) {
    const error: any = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
  }

  return await createUser(data, password);
};

export const getUserByIdService = async (id: number) => {
  await validateUser(id);
  return await getUserByID(id);
};

export const getAllUsersService = () => {
  return getAllUsers();
};

export const deleteUserByID = async (id: number) => {
  await validateUser(id);
  return await deleteUser(id);
};

export const isUserAuthorizedToLogin = async (
  email: string,
  password: string,
) => {
  if (!email?.trim() || !password) {
    throw new Error("Email and password are required");
  }

  const user = await getUserByEmail(email.trim());

  if (!user) {
    throw new Error("Invalid email or password");
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (error) {
    throw new Error("Invalid email or password");
  }

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};
