import { Redis } from "@upstash/redis";
import type { NavItemToggleType } from "@/validators/shared/navitemtoggle";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "https://localhost:8079";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "mock-token";

const redis = new Redis({
    url: redisUrl,
    token: redisToken,
});

export async function getAllNavItems() {
    if (redisUrl === "https://localhost:8079") {
        return { keys: [], items: [] };
    }

    const keys = await redis.smembers<string[]>(`${process.env.HK_ENV}_config:navitemslist`);
    if (!keys || keys.length < 1) {
        return {
            keys: [],
            items: [],
        };
    }
    const pipe = redis.pipeline();
    for (const key of keys) {
        pipe.hgetall(`${process.env.HK_ENV}_config:navitems:${key}`);
    }
    const items = await pipe.exec<NavItemToggleType[]>();
    return {
        keys,
        items,
    };
}

export function parseRedisBoolean(
    value: string | boolean | undefined | null,
    defaultValue?: boolean,
) {
    if (typeof value === "string") {
        if (value === "true") return true;
        if (value === "false") return false;
    }
    if (typeof value === "boolean") return value;
    return defaultValue !== undefined ? defaultValue : false;
}

export function parseRedisNumber(value: string | null, defaultValue: number) {
    if (value && !isNaN(parseInt(value))) {
        return parseInt(value);
    } else {
        return defaultValue;
    }
}