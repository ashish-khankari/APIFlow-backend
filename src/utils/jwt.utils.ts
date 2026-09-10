import jwt, { SignOptions } from "jsonwebtoken";

interface JwtPayload {
  id: number;
  email: string;
}

const jwtSecret = process.env.JWT_SECRET || "task-management-secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";

export const generateToken = ({ id, email }: JwtPayload): string => {
  return jwt.sign(
    {
      id,
      email,
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn as SignOptions["expiresIn"],
    }
  );
};

export const getJwtSecret = () => jwtSecret;
