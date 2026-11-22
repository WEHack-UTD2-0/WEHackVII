import { z } from "zod";
import c from "config";

const defaultPrettyError = {
	errorMap: () => ({ message: "Please select a value" }),
};

const countryCodesArray = c.registration.countries.map(
	(countryObject) => countryObject.code,
);

const phoneRegex = new RegExp(/^(?:\d{3}-\d{3}-\d{4}|\d{10})$/);

export const RegistrationSettingsFormValidator = z.object({
	age: z
		.number()
		.min(18, { message: "You must be at least 18 years old to register." })
		.positive({ message: "Value must be positive" })
		.int({ message: "Value must be an integer" })
		.or(z.string())
		.pipe(
			z.coerce
				.number()
				.min(18, {
					message: "You must be at least 18 years old to register.",
				})
				.positive({ message: "Value must be positive" })
				.int({ message: "Value must be an integer" }),
		),
	gender: z.union([
		z.literal("MALE", defaultPrettyError),
		z.literal("FEMALE", defaultPrettyError),
		z.literal("NON-BINARY", defaultPrettyError),
		z.literal("OTHER", defaultPrettyError),
		z.literal("PREFERNOTSAY", defaultPrettyError),
	]),
	race: z.union([
		z.literal("American Indian or Alaska Native", defaultPrettyError),
		z.literal("Asian", defaultPrettyError),
		z.literal("Black or African American", defaultPrettyError),
		z.literal("Hispanic or Latino", defaultPrettyError),
		z.literal("Middle Eastern or North African", defaultPrettyError),
		z.literal("Native Hawaiian or Other Pacific Islander", defaultPrettyError),
		z.literal("White", defaultPrettyError),
		z.literal("Two or More Races", defaultPrettyError),
		z.literal("Other", defaultPrettyError),
		z.literal("Prefer Not to Answer", defaultPrettyError),
	]),
	ethnicity: z.union([
		z.literal("Hispanic or Latino", defaultPrettyError),
		z.literal("Not Hispanic or Latino", defaultPrettyError),
	]),
	phoneNumber: z
		.string()
		.min(10)
		.max(30, {
			message: "Phone number must be less than 15 characters",
		})
		.regex(phoneRegex, "Invalid Number"),
	countryOfResidence: z.string().length(2),
	isEmailable: z.boolean(),
	university: z.string().min(1).max(200),
	major: z.string().min(1).max(200),
	// schoolID: z
	// 	.string()
	// 	.length(c.localUniversityShortIDMaxLength, {
	// 		message: `${c.localUniversitySchoolIDName} must be than ${c.localUniversityShortIDMaxLength} characters.`,
	// 	})
	// 	.or(z.literal("NOT_LOCAL_SCHOOL")),
	levelOfStudy: z.union([
		z.literal("Freshman", defaultPrettyError),
		z.literal("Sophomore", defaultPrettyError),
		z.literal("Junior", defaultPrettyError),
		z.literal("Senior", defaultPrettyError),
		z.literal("Master's", defaultPrettyError),
		z.literal("PhD", defaultPrettyError),
		z.literal("High School - 18 years old", defaultPrettyError),
		z.literal("Recent Grad", defaultPrettyError),
		z.literal("Other", defaultPrettyError),
	]),
	hackathonsAttended: z
		.number()
		.min(0, { message: "Value must be positive or zero" })
		.int({ message: "Value must be an integer" })
		.or(z.string())
		.pipe(
			z.coerce
				.number()
				.min(0, { message: "Value must be positive or zero" })
				.int({ message: "Value must be an integer" }),
		),
	softwareBuildingExperience: z.union([
		z.literal("Beginner", defaultPrettyError),
		z.literal("Intermediate", defaultPrettyError),
		z.literal("Advanced", defaultPrettyError),
		z.literal("Expert", defaultPrettyError),
	]),
	heardAboutEvent: z
		.union([
			z.literal("Instagram"),
			z.literal("Class Presentation"),
			z.literal("Twitter"),
			z.literal("Event Site"),
			z.literal("Friend"),
			z.literal("LinkedIn"),
			z.literal("Other"),
		])
		.optional(),
	shirtSize: z.union([
		z.literal("S", defaultPrettyError),
		z.literal("M", defaultPrettyError),
		z.literal("L", defaultPrettyError),
		z.literal("XL", defaultPrettyError),
		z.literal("2XL", defaultPrettyError),
		z.literal("3XL", defaultPrettyError),
	]),
	dietaryRestrictions: z.array(z.string()),
	accommodationNote: z.string().optional(),
	github: z
		.string()
		.max(50, { message: "Username must be less than 50 characters" })
		.optional(),
	linkedin: z
		.string()
		.max(50, { message: "Username must be less than 50 characters" })
		.optional(),
	personalWebsite: z
		.string()
		.max(100, { message: "URL must be less than 100 characters" })
		.optional(),
	questionOne: z
		.string()
		.min(1, { message: "Required" })
		.max(500, { message: "Response must be less than 500 characters." }),
	questionTwo: z
		.string()
		.min(1, { message: "Required" })
		.max(500, { message: "Response must be less than 500 characters." }),
	questionThree: z
		.string()
		.min(1, { message: "Required" })
		.max(500, { message: "Response must be less than 500 characters." }),
	resumeFile: z.any().refine(
		(file) => {
			console.log("zod:", file);
			return file !== null && file !== undefined;
		},
		{
			message: "Please upload a PDF of your resume before submitting.",
		},
	),
});