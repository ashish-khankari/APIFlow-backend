import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./config/database";
import "./workers/flow.worker";

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
  });
};

startServer();
