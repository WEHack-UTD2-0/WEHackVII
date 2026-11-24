"use client";
import { useForm } from "react-hook-form";
import {
	Form,
	FormItem,
	FormControl,
	FormDescription,
	FormMessage,
	FormLabel,
	FormField,
} from "@/components/shadcn/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
} from "@/components/shadcn/ui/select";
import { Input } from "@/components/shadcn/ui/input";
import { Button } from "@/components/shadcn/ui/button";
import { z } from "zod";
import { RegisterFormValidator } from "@/validators/shared/RegisterForm";
import { zodResolver } from "@hookform/resolvers/zod";
import FormGroupWrapper from "./FormGroupWrapper";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import Link from "next/link";
import c from "config";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/shadcn/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/client/cn";
import { useEffect, useCallback, useState } from "react";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { zpostSafe } from "@/lib/utils/client/zfetch";
import { useAuth } from "@clerk/nextjs";
import { BasicServerValidator } from "@/validators/shared/basic";
import { useRouter } from "next/navigation";
import { FileRejection, useDropzone } from "react-dropzone";
import { Tag, TagInput } from "@/components/shadcn/ui/tag/tag-input";
import CreatingRegistration from "./CreatingRegistration";

import "@uploadthing/react/styles.css";
import { useUploadThing } from "@/utils/uploadthing";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { generatePermittedFileTypes } from "uploadthing/client";

interface RegisterFormProps {
	defaultEmail: string;
}

const inputClasses =
	"border-[#538FDD] bg-[#00072D] font-ibm-plex-mono text-[#EDD0E0] placeholder:text-[#C5D9EB]/45 focus-visible:border-[#EFB5D5] focus-visible:ring-[#EFB5D5]";

const selectTriggerClasses =
	"w-full border-[#538FDD] bg-[#00072D] font-ibm-plex-mono text-[#EDD0E0] placeholder:text-[#C5D9EB]/45 focus:border-[#EFB5D5] focus:ring-[#EFB5D5]";

const selectContentClasses =
	"border-[#538FDD] bg-[#07113D] font-ibm-plex-mono text-[#C5D9EB]";

const selectItemClasses =
	"focus:bg-[#538FDD] focus:text-white data-[state=checked]:text-[#EFB5D5]";

const checkboxClasses =
	"mt-0.5 border-[#538FDD] data-[state=checked]:border-[#EFB5D5] data-[state=checked]:bg-[#EFB5D5] data-[state=checked]:text-[#00072D]";

const labelClasses =
	"flex flex-row gap-x-1.5 font-ibm-plex-mono text-sm font-semibold text-[#C5D9EB]";

export default function RegisterForm({ defaultEmail }: RegisterFormProps) {
	const [resumeFile, setResumeFile] = useState<File | null>(null);

	const { startUpload, routeConfig } = useUploadThing("pdfUploaderPrivate");

	const { isLoaded, userId } = useAuth();
	const router = useRouter();

	const form = useForm<z.infer<typeof RegisterFormValidator>>({
		resolver: zodResolver(RegisterFormValidator),
		defaultValues: {
			email: defaultEmail,
			hackathonsAttended: 0,
			dietaryRestrictions: [],
			hasAcceptedDietaryDisclaimer: false,
			profileIsSearchable: true,
			bio: "",
			isEmailable: false,
			hasAcceptedMLHCoC: false,
			hasSharedDataWithMLH: false,
			accommodationNote: "",
			firstName: "",
			lastName: "",
			age: 0,
			ethnicity: "" as any,
			gender: "" as any,
			major: "",
			github: "",
			hackerTag: "",
			heardAboutEvent: "" as any,
			levelOfStudy: "" as any,
			linkedin: "",
			personalWebsite: "",
			profileDiscordName: "",
			pronouns: "",
			race: "" as any,
			shirtSize: "" as any,
			university: "",
			phoneNumber: "",
			countryOfResidence: "",
			questionOne: "",
			questionTwo: "",
			questionThree: "",
			uploadedFile: undefined,
			optOutResumeSharing: false,
		},
	});

	const { isSubmitSuccessful, isSubmitted } = form.formState;
	const hasErrors = !isSubmitSuccessful && isSubmitted;

	const [skills, setSkills] = useState<Tag[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const universityValue = form.watch("university");
	const bioValue = form.watch("bio");
	const question1 = form.watch("questionOne");
	const question2 = form.watch("questionTwo");
	const question3 = form.watch("questionThree");

	async function onSubmit(data: z.infer<typeof RegisterFormValidator>) {
		setIsLoading(true);
		if (!userId || !isLoaded) {
			setIsLoading(false);
			return alert(
				`Auth has not loaded yet. Please try again! If this is a repeating issue, please contact us at ${c.issueEmail}.`,
			);
		}

		if (
			data.hasAcceptedMLHCoC !== true ||
			data.hasSharedDataWithMLH !== true
		) {
			setIsLoading(false);
			return alert(
				"You must accept the MLH Code of Conduct and Privacy Policy to continue.",
			);
		}

		if (data.hasAcceptedDietaryDisclaimer !== true) {
			setIsLoading(false);
			return alert(
				"You must acknowledge the dietary restrictions disclaimer to continue.",
			);
		}

		let resume: string = c.noResumeProvidedURL;

		if (resumeFile) {
			const uploadResult = await startUpload([resumeFile]);

			if (uploadResult) {
				const {
					serverData: { fileUrl },
				} = uploadResult[0];

				resume = fileUrl;

				const res = await zpostSafe({
					url: "/api/registration/create",
					body: { ...data, resume },
					vRes: BasicServerValidator,
				});

				if (res.success) {
					if (res.data.success) {
						alert(
							"Registration successfully created! Redirecting to the dashboard.",
						);
						router.push("/dash");
					} else {
						if (res.data.message == "hackertag_not_unique") {
							setIsLoading(false);
							return alert(
								"The HackerTag you chose has already been taken. Please change it and then resubmit the form.",
							);
						}
						setIsLoading(false);
						return alert(
							`Registration not created. Error message: \n\n ${res.data.message} \n\n Please try again. If this is a continuing issue, please reach out to us at ${c.issueEmail}.`,
						);
					}
				} else {
					setIsLoading(false);
					alert(
						`Something went wrong while attempting to register. Please try again. If this is a continuing issue, please reach out to us at ${c.issueEmail}.`,
					);
					return console.log(
						`Received an unexpected response from the server. Please try again. If this is a continuing issue, please reach out to us at ${c.issueEmail}.`,
					);
				}
			}
		} else {
			setIsLoading(false);
			alert(`Please upload a resume`);
			return console.log(`User has not uploaded a resume`);
		}
	}

	const onDrop = useCallback(
		(acceptedFiles: File[], fileRejections: FileRejection[]) => {
			if (fileRejections.length > 0) {
				alert(
					`The file you uploaded was rejected with the reason "${fileRejections[0].errors[0].message}". Please try again.`,
				);
			}
			if (acceptedFiles.length > 0) {
				setResumeFile(acceptedFiles[0]);
				form.setValue("uploadedFile", acceptedFiles[0]);
			}
		},
		[form],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: generateClientDropzoneAccept(
			generatePermittedFileTypes(routeConfig).fileTypes,
		),
	});

	if (isLoading) {
		return <CreatingRegistration />;
	}

	return (
		<div className="font-ibm-plex-mono text-[#C5D9EB]">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-12"
				>
					<FormGroupWrapper title="General">
						<div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											First Name{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="John"
												className={inputClasses}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Last Name{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Doe"
												className={inputClasses}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Email{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												readOnly={
													defaultEmail.length > 0
												}
												className={cn(
													inputClasses,
													defaultEmail.length > 0 &&
														"opacity-75",
												)}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phoneNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Phone Number{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="555-555-5555"
												className={inputClasses}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
						</div>
						<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="age"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Age{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												className={inputClasses}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="gender"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Gender{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger
													className={
														selectTriggerClasses
													}
												>
													<SelectValue placeholder="Select a Gender" />
												</SelectTrigger>
											</FormControl>
											<SelectContent
												className={selectContentClasses}
											>
												<SelectGroup>
													<SelectItem
														value="MALE"
														className={
															selectItemClasses
														}
													>
														Male
													</SelectItem>
													<SelectItem
														value="FEMALE"
														className={
															selectItemClasses
														}
													>
														Female
													</SelectItem>
													<SelectItem
														value="NON-BINARY"
														className={
															selectItemClasses
														}
													>
														Non-binary
													</SelectItem>
													<SelectItem
														value="OTHER"
														className={
															selectItemClasses
														}
													>
														Other
													</SelectItem>
													<SelectItem
														value="PREFERNOTSAY"
														className={
															selectItemClasses
														}
													>
														Prefer not to say
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="race"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Race{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger
													className={
														selectTriggerClasses
													}
												>
													<SelectValue placeholder="Select a Race" />
												</SelectTrigger>
											</FormControl>
											<SelectContent
												className={cn(
													selectContentClasses,
													"max-h-72 overflow-y-scroll",
												)}
											>
												<SelectGroup>
													{c.registration.raceOptions.map(
														(option) => (
															<SelectItem
																value={option}
																key={option}
																className={
																	selectItemClasses
																}
															>
																{option}
															</SelectItem>
														),
													)}
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="ethnicity"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Ethnicity{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger
													className={
														selectTriggerClasses
													}
												>
													<SelectValue placeholder="Select an Ethnicity" />
												</SelectTrigger>
											</FormControl>
											<SelectContent
												className={selectContentClasses}
											>
												<SelectGroup>
													<SelectItem
														value="Hispanic or Latino"
														className={
															selectItemClasses
														}
													>
														Hispanic or Latino
													</SelectItem>
													<SelectItem
														value="Not Hispanic or Latino"
														className={
															selectItemClasses
														}
													>
														Not Hispanic or Latino
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="countryOfResidence"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel className={labelClasses}>
											Country of Residence{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<div className="flex w-full items-center justify-center">
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															role="combobox"
															className={cn(
																"w-full justify-between border-[#538FDD] bg-[#00072D] font-ibm-plex-mono text-[#EDD0E0] hover:border-[#EFB5D5] hover:bg-[#07113D] hover:text-[#EDD0E0]",
																!field.value &&
																	"text-[#C5D9EB]/45",
															)}
														>
															{field.value
																? c.registration.countries.find(
																		(
																			selectedCountry,
																		) =>
																			selectedCountry.code ===
																			field.value,
																	)?.name
																: "Select a Country"}
															<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-[#538FDD]" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="no-scrollbar max-h-[400px] w-[280px] overflow-y-auto border-[#538FDD] bg-[#07113D] p-0 text-[#C5D9EB]">
													<Command className="bg-[#07113D] text-[#C5D9EB]">
														<CommandInput
															placeholder="Search countries..."
															className="font-ibm-plex-mono text-[#EDD0E0] placeholder:text-[#C5D9EB]/45"
														/>
														<CommandList>
															<CommandEmpty>
																No country
																found.
															</CommandEmpty>
															<CommandGroup>
																{c.registration.countries.map(
																	(
																		country,
																	) => (
																		<CommandItem
																			value={
																				country.name
																			}
																			key={
																				country.name
																			}
																			onSelect={() => {
																				const countryResult =
																					c.registration.countries.find(
																						(
																							countryObject,
																						) =>
																							countryObject.name ===
																							country.name,
																					);
																				form.setValue(
																					"countryOfResidence",
																					countryResult?.code ??
																						"00",
																				);
																			}}
																			className="cursor-pointer font-ibm-plex-mono text-[#C5D9EB] aria-selected:bg-[#538FDD] aria-selected:text-white"
																		>
																			<Check
																				className={`mr-2 h-4 w-4 text-[#EFB5D5] ${
																					country.code ===
																					field.value
																						? "block"
																						: "hidden"
																				}`}
																			/>
																			{
																				country.name
																			}
																		</CommandItem>
																	),
																)}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										</div>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>

					<FormGroupWrapper title="MLH">
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="hasAcceptedMLHCoC"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-[#538FDD]/70 bg-[#00072D]/70 p-4">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className={checkboxClasses}
											/>
										</FormControl>
										<div className="space-y-1.5 leading-none">
											<FormLabel className="font-ibm-plex-mono text-sm font-normal leading-relaxed text-[#C5D9EB]">
												I have read and agree to the{" "}
												<Link
													target="_blank"
													className="text-[#EFB5D5] underline hover:text-[#E4DFAA]"
													href={
														"https://mlh.io/code-of-conduct"
													}
												>
													MLH Code of Conduct
												</Link>
												.{" "}
												<span className="text-[#EFB5D5]">
													*
												</span>
											</FormLabel>
											<FormDescription className="text-xs text-[#E4DFAA]">
												This is required of all
												attendees.
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="hasSharedDataWithMLH"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-[#538FDD]/70 bg-[#00072D]/70 p-4">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className={checkboxClasses}
											/>
										</FormControl>
										<div className="space-y-1.5 leading-none">
											<FormLabel className="font-ibm-plex-mono text-sm font-normal leading-relaxed text-[#C5D9EB]">
												I authorize you to share my
												application/registration
												information with Major League
												Hacking for event
												administration, ranking, and
												administration (including the
												creation of linked accounts on
												MLH and{" "}
												<Link
													target="_blank"
													className="text-[#EFB5D5] underline hover:text-[#E4DFAA]"
													href={"https://dev.to/"}
												>
													DEV
												</Link>
												) in line with the{" "}
												<Link
													target="_blank"
													className="text-[#EFB5D5] underline hover:text-[#E4DFAA]"
													href={
														"https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
													}
												>
													MLH Privacy Policy
												</Link>
												. I further agree to the terms
												of both the{" "}
												<Link
													target="_blank"
													className="text-[#EFB5D5] underline hover:text-[#E4DFAA]"
													href={
														"https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
													}
												>
													MLH Contest Terms and
													Conditions
												</Link>{" "}
												and the{" "}
												<Link
													target="_blank"
													className="text-[#EFB5D5] underline hover:text-[#E4DFAA]"
													href={
														"https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
													}
												>
													MLH Privacy Policy
												</Link>
												.{" "}
												<span className="text-[#EFB5D5]">
													*
												</span>
											</FormLabel>
											<FormDescription className="text-xs text-[#E4DFAA]">
												This is required of all
												attendees.
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="isEmailable"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-[#538FDD]/70 bg-[#00072D]/70 p-4">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className={checkboxClasses}
											/>
										</FormControl>
										<div className="space-y-1.5 leading-none">
											<FormLabel className="font-ibm-plex-mono text-sm font-normal leading-relaxed text-[#C5D9EB]">
												I authorize MLH + DEV to send me
												occasional emails about relevant
												events, career opportunities,
												and community announcements.
											</FormLabel>
											<FormDescription className="text-xs text-[#E4DFAA]">
												This is optional.
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>

					<FormGroupWrapper title="University Info">
						<div
							className={`grid ${
								universityValue ===
								c.localUniversityName.toLowerCase()
									? "grid-cols-1 md:grid-cols-6"
									: "grid-cols-1 md:grid-cols-5"
							} gap-x-4 gap-y-4`}
						>
							<FormField
								control={form.control}
								name="university"
								render={({ field }) => (
									<FormItem className="col-span-2 flex flex-col">
										<FormLabel className={labelClasses}>
											University{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														className={cn(
															"w-full justify-between border-[#538FDD] bg-[#00072D] font-ibm-plex-mono text-[#EDD0E0] hover:border-[#EFB5D5] hover:bg-[#07113D] hover:text-[#EDD0E0]",
															!field.value &&
																"text-[#C5D9EB]/45",
														)}
													>
														{field.value
															? c.registration.schools.find(
																	(school) =>
																		school ===
																		field.value,
																)
															: "Select a University"}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-[#538FDD]" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="no-scrollbar max-h-[400px] w-[280px] overflow-y-auto border-[#538FDD] bg-[#07113D] p-0 text-[#C5D9EB]">
												<Command className="bg-[#07113D] text-[#C5D9EB]">
													<CommandInput
														placeholder="Search university..."
														className="font-ibm-plex-mono text-[#EDD0E0] placeholder:text-[#C5D9EB]/45"
													/>
													<CommandList>
														<CommandEmpty>
															No university found.
														</CommandEmpty>
														<CommandGroup>
															{c.registration.schools.map(
																(school) => (
																	<CommandItem
																		value={
																			school
																		}
																		key={
																			school
																		}
																		onSelect={(
																			value,
																		) => {
																			form.setValue(
																				"university",
																				value,
																			);
																		}}
																		className="cursor-pointer font-ibm-plex-mono text-[#C5D9EB] aria-selected:bg-[#538FDD] aria-selected:text-white"
																	>
																		<Check
																			className={`mr-2 h-4 w-4 text-[#EFB5D5] ${
																				school ===
																				field.value
																					? "block"
																					: "hidden"
																			}`}
																		/>
																		{school}
																	</CommandItem>
																),
															)}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="major"
								render={({ field }) => (
									<FormItem className="col-span-2 flex flex-col">
										<FormLabel className={labelClasses}>
											Major{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														className={cn(
															"w-full justify-between border-[#538FDD] bg-[#00072D] font-ibm-plex-mono text-[#EDD0E0] hover:border-[#EFB5D5] hover:bg-[#07113D] hover:text-[#EDD0E0]",
															!field.value &&
																"text-[#C5D9EB]/45",
														)}
													>
														{field.value
															? c.registration.majors.find(
																	(major) =>
																		major ===
																		field.value,
																)
															: "Select a Major"}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-[#538FDD]" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="no-scrollbar max-h-[400px] w-[280px] overflow-y-auto border-[#538FDD] bg-[#07113D] p-0 text-[#C5D9EB]">
												<Command className="bg-[#07113D] text-[#C5D9EB]">
													<CommandInput
														placeholder="Search major..."
														className="font-ibm-plex-mono text-[#EDD0E0] placeholder:text-[#C5D9EB]/45"
													/>
													<CommandList>
														<CommandEmpty>
															No major found.
														</CommandEmpty>
														<CommandGroup>
															{c.registration.majors.map(
																(major) => (
																	<CommandItem
																		value={
																			major
																		}
																		key={
																			major
																		}
																		onSelect={(
																			value,
																		) => {
																			form.setValue(
																				"major",
																				value,
																			);
																		}}
																		className="cursor-pointer font-ibm-plex-mono text-[#C5D9EB] aria-selected:bg-[#538FDD] aria-selected:text-white"
																	>
																		<Check
																			className={`mr-2 h-4 w-4 overflow-hidden text-[#EFB5D5] ${
																				major ===
																				field.value
																					? "block"
																					: "hidden"
																			}`}
																		/>
																		{major}
																	</CommandItem>
																),
															)}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="levelOfStudy"
								render={({ field }) => (
									<FormItem className="col-span-2 flex flex-col md:col-span-1">
										<FormLabel className={labelClasses}>
											Level of Study{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger
													className={
														selectTriggerClasses
													}
												>
													<SelectValue placeholder="Level of Study" />
												</SelectTrigger>
											</FormControl>
											<SelectContent
												className={selectContentClasses}
											>
												<SelectGroup>
													<SelectItem
														value="Freshman"
														className={
															selectItemClasses
														}
													>
														Freshman
													</SelectItem>
													<SelectItem
														value="Sophomore"
														className={
															selectItemClasses
														}
													>
														Sophomore
													</SelectItem>
													<SelectItem
														value="Junior"
														className={
															selectItemClasses
														}
													>
														Junior
													</SelectItem>
													<SelectItem
														value="Senior"
														className={
															selectItemClasses
														}
													>
														Senior
													</SelectItem>
													<SelectItem
														value="Master's"
														className={
															selectItemClasses
														}
													>
														Master's
													</SelectItem>
													<SelectItem
														value="PhD"
														className={
															selectItemClasses
														}
													>
														PhD
													</SelectItem>
													<SelectItem
														value="High School - 18 years old"
														className={
															selectItemClasses
														}
													>
														High School - 18 years
														old
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>

					<FormGroupWrapper title="Hackathon Experience">
						<div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3 md:gap-y-0">
							<FormField
								control={form.control}
								name="hackathonsAttended"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											# of Hackathons Attended{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												className={inputClasses}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="softwareBuildingExperience"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Software Building Experience{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger
													className={
														selectTriggerClasses
													}
												>
													<SelectValue placeholder="Experience Level" />
												</SelectTrigger>
											</FormControl>
											<SelectContent
												className={selectContentClasses}
											>
												<SelectGroup>
													<SelectItem
														value="Beginner"
														className={
															selectItemClasses
														}
													>
														Beginner
													</SelectItem>
													<SelectItem
														value="Intermediate"
														className={
															selectItemClasses
														}
													>
														Intermediate
													</SelectItem>
													<SelectItem
														value="Advanced"
														className={
															selectItemClasses
														}
													>
														Advanced
													</SelectItem>
													<SelectItem
														value="Expert"
														className={
															selectItemClasses
														}
													>
														Expert
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="heardAboutEvent"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Where did you hear about{" "}
											{c.hackathonName}?{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger
													className={
														selectTriggerClasses
													}
												>
													<SelectValue placeholder="Heard From..." />
												</SelectTrigger>
											</FormControl>
											<SelectContent
												className={selectContentClasses}
											>
												<SelectGroup>
													<SelectItem
														value="Instagram"
														className={
															selectItemClasses
														}
													>
														Instagram
													</SelectItem>
													<SelectItem
														value="Class Presentation"
														className={
															selectItemClasses
														}
													>
														Class Presentation
													</SelectItem>
													<SelectItem
														value="Twitter"
														className={
															selectItemClasses
														}
													>
														Twitter
													</SelectItem>
													<SelectItem
														value="Event Site"
														className={
															selectItemClasses
														}
													>
														Event Site
													</SelectItem>
													<SelectItem
														value="Friend"
														className={
															selectItemClasses
														}
													>
														Friend
													</SelectItem>
													<SelectItem
														value="LinkedIn"
														className={
															selectItemClasses
														}
													>
														LinkedIn
													</SelectItem>
													<SelectItem
														value="Other"
														className={
															selectItemClasses
														}
													>
														Other
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>

					<FormGroupWrapper title="Short Answer Questions">
						<div className="grid grid-cols-1 gap-x-4 gap-y-12 pb-6">
							<FormField
								control={form.control}
								name="questionOne"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											What does WEHack mean to you?{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter answer here"
												className={cn(
													inputClasses,
													"min-h-[120px]",
												)}
												{...field}
											/>
										</FormControl>
										<FormDescription className="text-xs text-[#E4DFAA]">
											<span
												className={
													question1.length > 500
														? "font-bold text-[#EFB5D5]"
														: ""
												}
											>
												{question1.length} / 500
												Characters
											</span>
										</FormDescription>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="questionTwo"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											What steps do you take to encourage
											or support inclusive environments
											for underrepresented groups?{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter answer here"
												className={cn(
													inputClasses,
													"min-h-[120px]",
												)}
												{...field}
											/>
										</FormControl>
										<FormDescription className="text-xs text-[#E4DFAA]">
											<span
												className={
													question2.length > 500
														? "font-bold text-[#EFB5D5]"
														: ""
												}
											>
												{question2.length} / 500
												Characters
											</span>
										</FormDescription>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="questionThree"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											In what ways do you hope to make a
											positive impact through your project
											at WEHack 2027?{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter answer here"
												className={cn(
													inputClasses,
													"min-h-[120px]",
												)}
												{...field}
											/>
										</FormControl>
										<FormDescription className="text-xs text-[#E4DFAA]">
											<span
												className={
													question3.length > 500
														? "font-bold text-[#EFB5D5]"
														: ""
												}
											>
												{question3.length} / 500
												Characters
											</span>
										</FormDescription>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>

					<FormGroupWrapper title="Day of Event">
						<div className="grid grid-cols-1 gap-x-6 gap-y-4 pb-5 md:grid-cols-2">
							<div className="space-y-4">
								<FormField
									control={form.control}
									name="shirtSize"
									render={({ field }) => (
										<FormItem>
											<FormLabel className={labelClasses}>
												Shirt Size{" "}
												<span className="text-[#EFB5D5]">
													*
												</span>
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger
														className={
															selectTriggerClasses
														}
													>
														<SelectValue placeholder="Shirt Size" />
													</SelectTrigger>
												</FormControl>
												<SelectContent
													className={
														selectContentClasses
													}
												>
													<SelectGroup>
														<SelectItem
															value="S"
															className={
																selectItemClasses
															}
														>
															S
														</SelectItem>
														<SelectItem
															value="M"
															className={
																selectItemClasses
															}
														>
															M
														</SelectItem>
														<SelectItem
															value="L"
															className={
																selectItemClasses
															}
														>
															L
														</SelectItem>
														<SelectItem
															value="XL"
															className={
																selectItemClasses
															}
														>
															XL
														</SelectItem>
														<SelectItem
															value="2XL"
															className={
																selectItemClasses
															}
														>
															2XL
														</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
											<FormMessage className="text-[#EFB5D5]" />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="accommodationNote"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="font-ibm-plex-mono text-sm font-semibold text-[#C5D9EB]">
												Anything else we can do to
												better accommodate you at our
												hackathon?
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="List any accessibility concerns here..."
													className={cn(
														inputClasses,
														"min-h-[160px] resize-none",
													)}
													{...field}
												/>
											</FormControl>
											<FormMessage className="text-[#EFB5D5]" />
										</FormItem>
									)}
								/>
							</div>

							<div className="space-y-4">
								<FormField
									control={form.control}
									name="dietaryRestrictions"
									render={() => (
										<FormItem>
											<div className="mb-3">
												<FormLabel className="flex flex-row gap-x-1.5 font-ibm-plex-mono text-base font-semibold text-[#C5D9EB]">
													Dietary Restrictions{" "}
													<span className="text-[#EFB5D5]">
														*
													</span>
												</FormLabel>
												<FormDescription className="text-xs text-[#E4DFAA]">
													Please select which dietary
													restrictions you have so we
													can best accommodate you at
													the event!
												</FormDescription>
											</div>
											<div className="space-y-2">
												{c.registration.dietaryRestrictionOptions.map(
													(item) => (
														<FormField
															key={item}
															control={
																form.control
															}
															name="dietaryRestrictions"
															render={({
																field,
															}) => {
																return (
																	<FormItem
																		key={
																			item
																		}
																		className="flex flex-row items-start space-x-3 space-y-0"
																	>
																		<FormControl>
																			<Checkbox
																				checked={field.value?.includes(
																					item,
																				)}
																				onCheckedChange={(
																					checked,
																				) => {
																					return checked
																						? field.onChange(
																								[
																									...field.value,
																									item,
																								],
																							)
																						: field.onChange(
																								field.value?.filter(
																									(
																										value,
																									) =>
																										value !==
																										item,
																								),
																							);
																				}}
																				className={
																					checkboxClasses
																				}
																			/>
																		</FormControl>
																		<FormLabel className="font-ibm-plex-mono text-sm font-normal text-[#EDD0E0]">
																			{
																				item
																			}
																		</FormLabel>
																	</FormItem>
																);
															}}
														/>
													),
												)}
											</div>
											<FormMessage className="text-[#EFB5D5]" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="hasAcceptedDietaryDisclaimer"
									render={({ field }) => (
										<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-[#538FDD]/70 bg-[#00072D]/70 p-3.5">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={
														field.onChange
													}
													className={checkboxClasses}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel className="font-ibm-plex-mono text-xs font-normal leading-relaxed text-[#E4DFAA]">
													{
														c.registration
															.dietaryDisclaimer
													}{" "}
													<span className="text-[#EFB5D5]">
														*
													</span>
												</FormLabel>
												<FormMessage className="text-[#EFB5D5]" />
											</div>
										</FormItem>
									)}
								/>
							</div>
						</div>
					</FormGroupWrapper>

					<FormGroupWrapper title="Career Info">
						<div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3">
							<FormField
								control={form.control}
								name="github"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-ibm-plex-mono text-sm font-semibold text-[#C5D9EB]">
											GitHub Username
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Username"
												className={inputClasses}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="linkedin"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-ibm-plex-mono text-sm font-semibold text-[#C5D9EB]">
											LinkedIn Username
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Username"
												className={inputClasses}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="personalWebsite"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-ibm-plex-mono text-sm font-semibold text-[#C5D9EB]">
											Personal Website
										</FormLabel>
										<FormControl>
											<Input
												placeholder="https://example.com/"
												className={inputClasses}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
						</div>
						<div className="mt-4 space-y-4">
							<FormField
								control={form.control}
								name="uploadedFile"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Resume{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<div
												{...getRootProps()}
												className={cn(
													"flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#538FDD] bg-[#00072D]/80 p-4 transition-colors hover:border-[#EFB5D5]",
													!resumeFile &&
														"cursor-pointer",
												)}
											>
												<input
													{...getInputProps()}
													onChange={(e) => {
														field.onChange(
															e.target.files?.[0],
														);
														setResumeFile(
															e.target
																.files?.[0] ||
																null,
														);
													}}
												/>
												<p className="p-2 text-center font-ibm-plex-mono text-base text-[#EDD0E0] md:text-lg">
													{resumeFile
														? `${resumeFile.name} (${Math.round(resumeFile.size / 1024)}kb)`
														: isDragActive
															? "Drop your resume here..."
															: "Drag 'n' drop your resume here, or click to select a file"}
												</p>
												{resumeFile ? (
													<Button
														type="button"
														className="mt-3 border border-[#EFB5D5] bg-[#EFB5D5] font-ibm-plex-mono text-[#00072D] hover:bg-[#EDD0E0]"
														onClick={(e) => {
															e.stopPropagation();
															field.onChange(
																null,
															);
															setResumeFile(null);
														}}
													>
														Remove
													</Button>
												) : null}
											</div>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="optOutResumeSharing"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-[#538FDD]/70 bg-[#00072D]/70 p-4">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className={checkboxClasses}
											/>
										</FormControl>
										<div className="space-y-1.5 leading-none">
											<FormLabel className="cursor-pointer font-ibm-plex-mono text-sm font-normal leading-relaxed text-[#C5D9EB]">
												Opt out of sharing my resume
												with sponsors
											</FormLabel>
										</div>
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>

					<FormGroupWrapper title="Hacker Profile">
						<div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3">
							<FormField
								control={form.control}
								name="hackerTag"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											HackerTag{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<div className="flex">
												<div className="flex h-10 w-10 items-center justify-center rounded-l border border-r-0 border-[#538FDD] bg-[#07113D] font-ibm-plex-mono text-lg font-semibold text-[#EFB5D5]">
													@
												</div>
												<Input
													className={cn(
														inputClasses,
														"rounded-l-none",
													)}
													placeholder={`${c.hackathonName.toLowerCase()}`}
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="profileDiscordName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-ibm-plex-mono text-sm font-semibold text-[#C5D9EB]">
											Discord Username
										</FormLabel>
										<FormControl>
											<Input
												placeholder={`${c.hackathonName.toLowerCase()} or ${c.hackathonName.toLowerCase()}#1234`}
												className={inputClasses}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="pronouns"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Pronouns{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="she/her, he/him, they/them..."
												className={inputClasses}
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
						</div>
						<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={labelClasses}>
											Bio{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Hello! I'm..."
												className={cn(
													inputClasses,
													"min-h-[110px] resize-none",
												)}
												{...field}
											/>
										</FormControl>
										<FormDescription className="text-xs text-[#E4DFAA]">
											<span
												className={
													bioValue.length > 500
														? "font-bold text-[#EFB5D5]"
														: ""
												}
											>
												{bioValue.length} / 500
												Characters
											</span>
										</FormDescription>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="skills"
								render={({ field }) => (
									<FormItem className="flex flex-col items-start">
										<FormLabel className={labelClasses}>
											Skills{" "}
											<span className="text-[#EFB5D5]">
												*
											</span>
										</FormLabel>
										<FormControl className="min-h-[80px]">
											<TagInput
												inputFieldPostion="top"
												{...field}
												placeholder="Type and then press enter to add a skill..."
												tags={skills}
												className="border-[#538FDD] bg-[#00072D] font-ibm-plex-mono text-[#EDD0E0] placeholder:text-[#C5D9EB]/45 sm:min-w-[450px]"
												maxLength={50}
												setTags={(newTags) => {
													setSkills(newTags);
													form.setValue(
														"skills",
														newTags as [
															Tag,
															...Tag[],
														],
													);
												}}
											/>
										</FormControl>
										<FormDescription className="mt-1.5 text-xs leading-relaxed tracking-wide text-[#E4DFAA]">
											<b>
												Tags can only be less than 50
												characters! You can have a max
												of 10 tags.
											</b>
											<br />
											These skills can be listed on your
											profile and help with the team
											finding process! Enter anything you
											think is relevant, including
											non-technical skills!
										</FormDescription>
										<FormMessage className="text-[#EFB5D5]" />
									</FormItem>
								)}
							/>
						</div>
						<div className="mt-4">
							<FormField
								control={form.control}
								name="profileIsSearchable"
								render={({ field }) => (
									<FormItem className="mx-auto flex max-w-[650px] flex-row items-start space-x-3 space-y-0 rounded-lg border border-[#538FDD]/70 bg-[#00072D]/70 p-4">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className={checkboxClasses}
											/>
										</FormControl>
										<div className="space-y-1.5 leading-none">
											<FormLabel className="font-ibm-plex-mono text-sm font-semibold text-[#C5D9EB]">
												Make my profile searchable by
												other Hackers
											</FormLabel>
											<FormDescription className="text-xs leading-relaxed text-[#E4DFAA]">
												This will allow other Hackers to
												look you up by your name or
												HackerTag. Other Hackers will
												still be able to view your
												profile and invite you to teams
												if they have your link.
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>

					<div className="pt-2">
						<Button
							type="submit"
							className="w-full rounded-lg border-2 border-[#C5D9EB] bg-[#538FDD] py-6 font-dela-gothic text-lg tracking-wider text-white shadow-[4px_4px_0px_#EFB5D5] transition-all hover:bg-[#EFB5D5] hover:text-[#00072D] hover:shadow-[4px_4px_0px_#C5D9EB]"
						>
							Submit
						</Button>
						{hasErrors && (
							<p className="mt-3 font-ibm-plex-mono text-sm font-semibold text-[#EFB5D5]">
								Something doesn't look right. Please check your
								inputs above.
							</p>
						)}
					</div>
				</form>
			</Form>
		</div>
	);
}