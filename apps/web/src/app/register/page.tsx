import c from "config";
import RegisterForm from "@/components/registration/RegisterForm";
import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Redis } from "@upstash/redis";
import { parseRedisBoolean } from "@/lib/utils/server/redis";
import { Button } from "@/components/shadcn/ui/button";
import { getUser } from "db/functions";
import Image from "next/image";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function Page() {
	const { userId } = auth();
	if (!userId) return redirect("/sign-up");

	const user = await currentUser();
	if (!user) return redirect("/sign-up");

	const registration = await getUser(userId);
	if (registration) return redirect("/dash");

	const [defaultRegistrationEnabled, defaultSecretRegistrationEnabled]: (
		| string
		| null
	)[] = await redis.mget(
		`${process.env.HK_ENV}_config:registration:registrationEnabled`,
		`${process.env.HK_ENV}_config:registration:secretRegistrationEnabled`,
	);

	if (parseRedisBoolean(defaultRegistrationEnabled, true) === true) {
		return (
			<div className="min-h-screen w-full bg-[#00072D] font-ibm-plex-mono text-[#C5D9EB] selection:bg-[#EFB5D5] selection:text-[#00072D]">
				<div className="z-50 w-full pt-6">
					<div className="relative top-0 z-50 h-16 w-full">
						<div className="mx-auto grid h-full w-full max-w-7xl grid-flow-col grid-cols-2 px-2 sm:px-6 lg:max-w-full lg:px-8">
							<div className="col-span-3 flex items-center justify-start gap-x-5 pl-4 md:pl-0">
								<Link
									href={"/"}
									className="mr-5 flex items-center gap-x-2"
								>
									<Image
										src={"/img/static/images/white wehack logo.png"}
										alt={c.hackathonName + " Logo"}
										width={60}
										height={60}
										className="drop-shadow-[0_0_10px_rgba(197,217,235,0.65)]"
									/>
								</Link>
							</div>
						</div>
					</div>
				</div>
				<main className="bg-[#00072D]">
					<div className="mx-auto min-h-screen max-w-5xl px-5 pb-16 pt-[10vh]">
						<h1
							className="font-dela-gothic text-5xl tracking-wide text-[#C5D9EB] sm:text-7xl md:text-8xl"
							style={{
								fontFamily: "var(--font-dela-gothic), 'Dela Gothic One', sans-serif",
								textShadow: "4px 4px 0px #538FDD",
							}}
						>
							Register
						</h1>

						<p
							className="mt-6 font-zen-maru text-xl font-bold text-[#EDD0E0] md:text-2xl"
							style={{
								fontFamily: "var(--font-zen-maru), 'Zen Maru Gothic', sans-serif",
							}}
						>
							<span className="text-[#E4DFAA]">
								Welcome Hacker!
							</span>{" "}
							Please fill out the form below to complete your
							registration for {c.hackathonName}.
						</p>

						<div className="mt-6 rounded-xl border-2 border-[#538FDD] bg-[#060F38] p-5 shadow-[4px_4px_0px_#538FDD]">
							<p
								className="font-ibm-plex-mono text-base font-semibold text-[#C5D9EB] md:text-lg"
								style={{
									fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
								}}
							>
								Please complete your registration form in one
								sitting to not lose your progress! You must
								click{" "}
								<span className="text-[#EFB5D5]">"Submit"</span>{" "}
								at the end for your registration to be
								officially submitted.
							</p>
							<h3
								className="mt-3 font-zen-maru text-base font-bold tracking-wide text-[#E4DFAA]"
								style={{
									fontFamily: "var(--font-zen-maru), 'Zen Maru Gothic', sans-serif",
								}}
							>
								Once your form is submitted, you will{" "}
								<span className="underline decoration-[#EFB5D5] decoration-2">
									NOT
								</span>{" "}
								be able to change your responses, so please
								answer wisely.
							</h3>
							<p
								className="mt-3 font-ibm-plex-mono text-sm text-[#EDD0E0] md:text-base"
								style={{
									fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
								}}
							>
								Psttt... Running into an issue? Please let us
								know by emailing{" "}
								<b className="text-[#E4DFAA]">
									wehackutd@gmail.com
								</b>
							</p>
						</div>

						<div className="mt-12">
							<RegisterForm
								defaultEmail={
									user.emailAddresses[0]?.emailAddress || ""
								}
							/>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-[#00072D] px-2 font-ibm-plex-mono text-[#C5D9EB]">
			<h2
				className="font-zen-maru text-4xl font-extrabold text-[#EFB5D5]"
				style={{
					fontFamily: "var(--font-zen-maru), 'Zen Maru Gothic', sans-serif",
				}}
			>
				{c.hackathonName}
			</h2>
			<h1
				className="mb-10 pb-5 font-dela-gothic text-5xl tracking-wide text-[#C5D9EB] md:text-7xl"
				style={{
					fontFamily: "var(--font-dela-gothic), 'Dela Gothic One', sans-serif",
					textShadow: "4px 4px 0px #538FDD",
				}}
			>
				Registration
			</h1>
			<div className="relative z-10 flex w-full max-w-[500px] flex-col items-center justify-center gap-y-4 rounded-xl border-2 border-[#538FDD] bg-[#060F38] px-6 py-6 shadow-[4px_4px_0px_#538FDD]">
				<h2 className="text-center font-zen-maru text-2xl font-black text-[#E4DFAA]">
					Registration Is Currently Closed
				</h2>
				<p className="text-center text-sm font-medium text-[#EDD0E0]">
					If you believe this is a mistake or have any questions, feel
					free to reach out to us at {c.issueEmail}!
				</p>
				<Link href={"/"}>
					<Button className="border-2 border-[#C5D9EB] bg-[#538FDD] font-dela-gothic text-white shadow-[3px_3px_0px_#EFB5D5] hover:bg-[#EFB5D5] hover:text-[#00072D]">
						Return Home
					</Button>
				</Link>
				<p className="text-center text-sm text-[#C5D9EB]">
					Already registered?
					<Link
						className="pl-1 text-[#EFB5D5] underline hover:text-[#E4DFAA]"
						href={"/sign-in"}
					>
						Sign-in.
					</Link>
				</p>
			</div>
		</main>
	);
}

export const runtime = "edge";