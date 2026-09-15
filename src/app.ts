import express, { NextFunction, Request, Response } from "express";
import userRoutes from "./routes/user.routes";
import flowRoutes from './routes/flow.routes';
import nodeRoute from './routes/node.routes'
import cors from "cors";

import dotenv from "dotenv";
import { responseStatus } from "./utils/status";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use("/", userRoutes);
app.use("/", flowRoutes);
app.use("/", nodeRoute)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  return responseStatus(res, status, err.message || "Internal server error");
});

export default app;
