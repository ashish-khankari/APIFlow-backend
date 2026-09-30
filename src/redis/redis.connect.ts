import { Redis, RedisOptions } from "ioredis";

export const redisConnectionOptions: RedisOptions = {
    username: "apiflow",
    password: "Ashish@123",
    port: 6379,
    host: 'localhost',
    db: 0,
    maxRetriesPerRequest: null, // Required by BullMQ
};

export const redis = new Redis(redisConnectionOptions);

redis.on("connect", () => {
    console.log("Redis is connected ⚡⚡⚡");
});

redis.on("error", () => {
    console.log("Redis connection failed ❌❌❌");
});