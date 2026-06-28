/**
 * Profile Validation Schemas
 * Zod schemas for form validation
 */

import { z } from "zod";

// Contact Details Schema
export const contactDetailsSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phones: z
    .array(
      z.object({
        number: z.string().min(1, "Phone number is required"),
        type: z.enum(["mobile", "home", "work"]),
      }),
    )
    .max(2, "Maximum 2 phone numbers allowed"),
  addresses: z
    .array(
      z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().min(1, "Country is required"),
        type: z.enum(["home", "work"]),
      }),
    )
    .max(2, "Maximum 2 addresses allowed"),
  socialLinks: z.array(
    z.object({
      platform: z.enum(["linkedin", "github", "twitter", "portfolio"]),
      url: z.string().url("Please enter a valid URL"),
    }),
  ),
});

// Education Schema
export const educationSchema = z.object({
  standard: z.string().min(1, "Standard/Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  university: z.string().optional(),
  passingYear: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 10),
  grade: z.string().optional(),
  specialization: z.string().optional(),
});

// Experience Schema
export const experienceSchema = z
  .object({
    companyName: z.string().min(1, "Company name is required"),
    role: z.string().min(1, "Role is required"),
    roleDescription: z.string().optional().or(z.literal("")),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    isCurrentlyWorking: z.boolean().default(false),
    responsibilities: z.array(z.string()),
    technologiesUsed: z.array(z.string()),
    projects: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.isCurrentlyWorking && data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date should not be set if currently working",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (!data.isCurrentlyWorking && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required if not currently working",
      path: ["endDate"],
    },
  );

// Project Schema
export const projectSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    projectType: z.enum(["Personal", "Professional"]),
    company: z.string().optional().or(z.literal("")),
    technologies: z.array(z.string()),
    projectUrl: z
      .string()
      .url("Please enter a valid URL")
      .optional()
      .or(z.literal("")),
    githubRepo: z
      .string()
      .url("Please enter a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.projectType === "Professional" && !data.company) {
        return false;
      }
      return true;
    },
    {
      message: "Company is required for Professional projects",
      path: ["company"],
    },
  );

// Skill Schema
export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.string().min(1, "Category is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  yearsOfExperience: z.number().min(0).optional(),
});

// Personal Details Schema
export const personalDetailsSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  profileName: z
    .string()
    .min(1, "Profile name is required")
    .min(3, "Profile name must be at least 3 characters"),
  jobRole: z.string().min(1, "Job role is required"),
  profileDescription: z
    .string()
    .max(160, "Profile description must be at most 160 characters")
    .optional()
    .or(z.literal("")),
});
