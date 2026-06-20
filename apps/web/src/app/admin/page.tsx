// Cache bust: standard runtime deployment active
import { Overview } from "@/components/admin/landing/Overview";
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardDescription,
} from "@/components/shadcn/ui/card";

import { Users, UserCheck, User2, TimerReset, MailCheck } from "lucide-react";
import type { User } from "db/types";
import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { getAllUsers, getUser } from "db/functions";

export default async function Page() {
	const { userId } = auth();
	if (!userId) return notFound();

	const adminUser = await getUser(userId);
	if (
		!adminUser ||
		(adminUser.role !== "admin" && adminUser.role !== "super_admin")
	) {
		return notFound();
	}

	const allUsers = (await getAllUsers()) ?? [];

	const { rsvpCount, checkinCount, recentSignupCount } =
		getRecentRegistrationData(allUsers);

	const { vegan, veg, halal, gf, nuts, fish, wheat, dairy, eggs, kosher, soy, none } 
	= getDietaryRestrictionBreakdown(allUsers);

	return (
		<div className="mx-auto w-full max-w-7xl px-4 pt-12">
			<div className="w-full px-2">
				<h2 className="text-xl font-bold">Welcome,</h2>
				<h1 className="text-5xl font-black text-hackathon break-words break-all">
					{adminUser.firstName}
				</h1>
			</div>
			<div className="grid gap-y-3 pt-10 md:grid-cols-4 md:gap-x-2">
				<Card className="text-[#D09C51]">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium tracking-wide">
							Registrations
						</CardTitle>
						<User2 />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{allUsers.length}
						</div>
						{/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
					</CardContent>
				</Card>
				<Card className="text-[#D09C51]">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium tracking-wide">
							Teams
						</CardTitle>
						<Users />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{0}</div>
						{/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
					</CardContent>
				</Card>
				<Card className="text-[#D09C51]">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium tracking-wide">
							RSVPs
						</CardTitle>
						<MailCheck />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{rsvpCount}</div>
						{/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
					</CardContent>
				</Card>
				<Card className="text-[#D09C51]">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium tracking-wide">
							Check-ins
						</CardTitle>
						<UserCheck />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{checkinCount}</div>
						{/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
					</CardContent>
				</Card>
			</div>
			<div className="grid gap-y-3 py-2 pb-24 md:grid-cols-3 md:gap-x-2">
				<Card className="col-span-2 text-[#D09C51]">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<div>
							<CardTitle className="text-md font-bold tracking-wide">
								Registrations
							</CardTitle>{" "}
							<CardDescription>
								{Object.values(recentSignupCount).reduce(
									(a, b) => a + b,
									0,
								)}{" "}
								new registrations have occurred in the past 7
								days.
							</CardDescription>
						</div>

						<User2 />
					</CardHeader>
					<CardContent>
						<Overview rawData={recentSignupCount} />
					</CardContent>
				</Card>
				<Card className="text-[#D09C51]">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<div>
							<CardTitle className="text-md font-bold tracking-wide">
								Dietary Restriction Breakdown
							</CardTitle>{" "}
						</div>

						{/* <TimerReset /> */}
					</CardHeader>
					<CardContent>
						{/* TODO: Make this cleaner */}
						<div className="text-md">Vegan: {vegan}</div>
						<div className="text-md">Vegetarian: {veg}</div>
						<div className="text-md">Halal: {halal}</div>
						<div className="text-md">Gluten-Free: {gf}</div>
						<div className="text-md">Nuts: {nuts}</div>
						<div className="text-md">Fish: {fish}</div>
						<div className="text-md">Wheat: {wheat}</div>
						<div className="text-md">Dairy: {dairy}</div>
						<div className="text-md">Eggs: {eggs}</div>
						<div className="text-md">Kosher: {kosher}</div>
						<div className="text-md">Soy: {soy}</div>
						<div className="text-md">None: {none}</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function getRecentRegistrationData(users: User[]) {
	type DateNumberMap = { [key: string]: number };

	let rsvpCount = 0;
	let checkinCount = 0;
	let recentSignupCount: DateNumberMap = {};

	for (let i = 0; i < 7; i++) {
		// Create a new date object for each day
		const date = new Date();
		date.setDate(date.getDate() - i);

		// Format the date as YYYY-MM-DD
		const dateString = date.toISOString().split("T")[0];

		// Assign a default value, e.g., 0
		recentSignupCount[dateString] = 0;
	}

	for (const user of users) {
		if (user.isRSVPed) rsvpCount++;
		if (user.checkinTimestamp) checkinCount++;

		const stamp = user.signupTime.toISOString().split("T")[0];

		if (recentSignupCount[stamp] != undefined) recentSignupCount[stamp]++;
	}

	return { rsvpCount, checkinCount, recentSignupCount };
}

function getDietaryRestrictionBreakdown(users: User[]) {

	let dietmap : Map<string, number> = new Map();
	dietmap.set("Vegan", 0);
	dietmap.set("Vegetarian", 0);
	dietmap.set("Halal", 0);
	dietmap.set("Gluten-Free", 0);
	dietmap.set("Nuts", 0);
	dietmap.set("Fish", 0);
	dietmap.set("Wheat", 0);
	dietmap.set("Dairy", 0);
	dietmap.set("Eggs", 0);
	dietmap.set("Kosher", 0);
	dietmap.set("Soy", 0);
	dietmap.set("None", 0);

	for (const user of users) {
		const dietaryRestrictions = Array.isArray(user.dietRestrictions) ? user.dietRestrictions : [];
		for (const restriction of dietaryRestrictions) {
			let value = dietmap.get(restriction);
			if(value !== undefined) {
				dietmap.set(restriction, value+1);
			}
		}

	}

	let vegan = dietmap.get("Vegan");
	let veg = dietmap.get("Vegetarian");
	let halal = dietmap.get("Halal");
	let gf = dietmap.get("Gluten-Free");
	let nuts = dietmap.get("Nuts");
	let fish = dietmap.get("Fish");
	let wheat = dietmap.get("Wheat");
	let dairy = dietmap.get("Dairy");
	let eggs = dietmap.get("Eggs");
	let kosher = dietmap.get("Kosher");
	let soy = dietmap.get("Soy");
	let none = dietmap.get("None");


	return { vegan, veg, halal, gf, nuts, fish, wheat, dairy, eggs, kosher, soy, none };
}
