import bcyrpt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => {
  return await bcyrpt.hash(password, SALT_ROUNDS);
};
