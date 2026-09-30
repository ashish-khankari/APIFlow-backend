import { Redis, RedisOptions } from "ioredis";

export const redisConnectionOptions: RedisOptions = {
    // Auth is optional — only used when env vars are set (e.g. production)
    ...(process.env.REDIS_USERNAME && { username: process.env.REDIS_USERNAME }),
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    port: Number(process.env.REDIS_PORT) || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    db: 0,
    maxRetriesPerRequest: null, // Required by BullMQ
};

export const redis = new Redis(redisConnectionOptions);

redis.on("connect", () => {
    console.log("Redis is connected ⚡⚡⚡");
});

redis.on("error", (err) => {
    console.log("Redis connection failed ❌❌❌", err.message);
});