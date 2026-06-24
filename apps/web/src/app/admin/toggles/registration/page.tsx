import { RegistrationToggles } from "@/components/admin/toggles/RegistrationSettings";
import { Redis } from "@upstash/redis";
import { parseRedisBoolean, parseRedisNumber } from "@/lib/utils/server/redis";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
import c from "config";

export default async function Page() {
	const pipe = redis.pipeline();
	pipe.get(`${process.env.HK_ENV}_config:registration:registrationEnabled`);
	pipe.get(`${process.env.HK_ENV}_config:registration:secretRegistrationEnabled`);
	// const result = await pipe.exec();

	const [
		defaultRegistrationEnabled,
		defaultSecretRegistrationEnabled,
		defaultRSVPsEnabled,
		defaultRSVPLimit,
	]: (string | null)[] = await redis.mget(
		`${process.env.HK_ENV}_config:registration:registrationEnabled`,
		`${process.env.HK_ENV}_config:registration:secretRegistrationEnabled`,
		`${process.env.HK_ENV}_config:registration:allowRSVPs`,
		`${process.env.HK_ENV}_config:registration:maxRSVPs`,
	);

	return (
		<div>
			<div className="flex items-center justify-start pb-10">
				<h2 className="text-3xl font-bold tracking-wide">
					Registration & Sign-in
				</h2>
			</div>
			<RegistrationToggles
				defaultRegistrationEnabled={parseRedisBoolean(
					defaultRegistrationEnabled,
					true,
				)}
				defaultSecretRegistrationEnabled={parseRedisBoolean(
					defaultSecretRegistrationEnabled,
					false,
				)}
				defaultRSVPsEnabled={parseRedisBoolean(
					defaultRSVPsEnabled,
					true,
				)}
				defaultRSVPLimit={parseRedisNumber(
					defaultRSVPLimit,
					c.rsvpDefaultLimit,
				)}
			/>
		</div>
	);
}

export const runtime = "edge";
