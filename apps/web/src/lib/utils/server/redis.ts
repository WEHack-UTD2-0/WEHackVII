import { Redis } from "@upstash/redis";
import type { NavItemToggleType } from "@/validators/shared/navitemtoggle";

const rawRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisUrl = rawRedisUrl && rawRedisUrl.startsWith("https://") 
    ? rawRedisUrl 
    : "https://localhost:8079";

const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "mock-token";

const redis = new Redis({
    url: redisUrl,
    token: redisToken,
});

export async function getAllNavItems() {
    // If running during static build evaluation without real credentials, bail early safely
    if (redisUrl === "https://localhost:8079") {
        return { keys: [], items: [] };
    }

    try {
        const envPrefix = process.env.HK_ENV || "production"; 
        const keys = await redis.smembers<string[]>(`${envPrefix}_config:navitemslist`);
        
        if (!keys || keys.length < 1) {
            return { keys: [], items: [] };
        }
        
        const pipe = redis.pipeline();
        for (const key of keys) {
            pipe.hgetall(`${envPrefix}_config:navitems:${key}`);
        }
        
        const items = await pipe.exec<NavItemToggleType[]>();
        return {
            keys,
            items: items || [],
        };
    } catch (error) {
        console.error("Runtime Redis Exception caught safely:", error);
        return {
            keys: [],
            items: [],
        };
    }
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