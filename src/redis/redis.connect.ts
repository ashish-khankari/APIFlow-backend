import { Redis, RedisOptions } from "ioredis";

function getRedisConfig(): RedisOptions {
    if (process.env.REDIS_URL) {
        try {
            const parsed = new URL(process.env.REDIS_URL);
            const isTls = parsed.protocol === "rediss:";
            return {
                host: parsed.hostname,
                port: Number(parsed.port) || 6379,
                username: parsed.username || undefined,
                password: parsed.password || undefined,
                tls: isTls ? { rejectUnauthorized: false } : undefined,
                maxRetriesPerRequest: null,
            };
        } catch {
            // Fallback if URL parsing fails
        }
    }

    const isTls =
        process.env.REDIS_TLS === "true" ||
        process.env.REDIS_HOST?.includes("upstash.io");

    return {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        ...(process.env.REDIS_USERNAME && { username: process.env.REDIS_USERNAME }),
        ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
        tls: isTls ? { rejectUnauthorized: false } : undefined,
        db: 0,
        maxRetriesPerRequest: null, // Required by BullMQ
    };
}

export const redisConnectionOptions: RedisOptions = getRedisConfig();

export const redis = new Redis(redisConnectionOptions);

redis.on("connect", () => {
    console.log("Redis is connected ⚡⚡⚡");
});

redis.on("error", (err) => {
    console.log("Redis connection failed ❌❌❌", err.message);
});