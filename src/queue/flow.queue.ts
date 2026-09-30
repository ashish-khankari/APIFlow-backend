// src/queue/flow.queue.ts
import { Queue, QueueBaseOptions } from "bullmq";
import { redisConnectionOptions } from "../redis/redis.connect";

export interface FlowJobData {
    flowId: number;
    userId: number;
    runId: string;
}

export const flowQueue = new Queue<FlowJobData>("flow-execution", {
    connection: redisConnectionOptions as QueueBaseOptions, // connection is the props to confogure redis connection
    defaultJobOptions: {
        attempts: 2, //number of retries after job fails on promise rejection
        backoff: {
            type: "exponential", //type of backoff 
            delay: 3000, //delay between retries
        },
        removeOnComplete: 100, // Keep memory clean in Redis
        removeOnFail: 500,
    },
});
