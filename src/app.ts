import express, { NextFunction, Request, Response } from "express";
import userRoutes from "./routes/user.routes";
import flowRoutes from './routes/flow.routes';
import nodeRoute from './routes/nodes/node.routes';
import nodeApiRoute from './routes/nodes/nodeApi.routes';
import executeFlow from './routes/executeFlow.route';

import cors from "cors";

import dotenv from "dotenv";
import { responseStatus } from "./utils/status";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development or adjust as needed
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "API Flow Backend is running 🚀" });
});

app.use("/", userRoutes);
app.use("/", flowRoutes);
app.use("/", nodeRoute);
app.use("/", nodeApiRoute);
app.use("/", executeFlow);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  return responseStatus(res, status, err.message || "Internal server error");
});

export default app;
