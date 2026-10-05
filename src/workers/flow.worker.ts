import { Worker, Job } from "bullmq";
import { redisConnectionOptions } from "../redis/redis.connect";
import { FlowJobData } from "../queue/flow.queue";
import { runFlowWorkerService } from "../services/executeFlow.service";

export const flowWorker = new Worker<FlowJobData>(
    "flow-execution",
    async (job: Job<FlowJobData>) => {
        const { flowId, userId, runId } = job.data;
        // console.log(`[Worker] Starting job ${job.id} for Flow ID: ${flowId}, Run ID: ${runId}`);

        // Worker delegates execution logic to the service layer
        await runFlowWorkerService(flowId, userId, runId);

        // console.log(`[Worker] Finished job ${job.id} for Run ID: ${runId}`);
    },
    {
        connection: redisConnectionOptions as any,
        concurrency: 5, // Process up to 5 flows concurrently
    }
);

flowWorker.on("completed", (job) => {
    // console.log(`[Worker] Job ${job?.id} completed successfully`);
});

flowWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
});
