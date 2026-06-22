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

    try {
        const envPrefix = process.env.HK_ENV || "production"; // Fallback prefix if unset
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