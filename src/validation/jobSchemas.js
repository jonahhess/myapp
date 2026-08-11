import * as yup from "yup";
import {
  createEmailSchema,
  createImageAltSchema,
  createIsraeliPhoneSchema,
  createOptionalUrlSchema,
  createRequiredTrimmedTextSchema,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
} from "./validators";

export function createJobValidationSchema() {
  return yup.object({
    title: createRequiredTrimmedTextSchema({
      label: "Job title",
    }),
    company: createRequiredTrimmedTextSchema({
      label: "Company name",
    }),
    description: createRequiredTrimmedTextSchema({
      label: "Description",
      max: 1024,
    }),
    category: createRequiredTrimmedTextSchema({
      label: "Category",
    }),
    location: createRequiredTrimmedTextSchema({
      label: "Location",
    }),
    jobType: yup
      .string()
      .oneOf(EMPLOYMENT_TYPES, "Select a valid employment type")
      .required("Employment type is required"),
    experienceLevel: yup
      .string()
      .oneOf(EXPERIENCE_LEVELS, "Select a valid experience level")
      .required("Experience level is required"),
    salaryMin: yup
      .number()
      .typeError("Minimum salary must be a number")
      .min(0, "Minimum salary must be non-negative")
      .required("Minimum salary is required"),
    salaryMax: yup
      .number()
      .typeError("Maximum salary must be a number")
      .min(0, "Maximum salary must be non-negative")
      .required("Maximum salary is required")
      .test(
        "max-gte-min",
        "Maximum salary must be greater than or equal to minimum salary",
        function validateSalaryMax(value) {
          const { salaryMin } = this.parent;
          if (
            !Number.isFinite(Number(value)) ||
            !Number.isFinite(Number(salaryMin))
          ) {
            return true;
          }

          return Number(value) >= Number(salaryMin);
        },
      ),
    phone: createIsraeliPhoneSchema(),
    email: createEmailSchema("Enter a valid email"),
    applyLink: createOptionalUrlSchema("Application link must be a valid URL"),
    imageUrl: createOptionalUrlSchema("Image URL must be valid"),
    imageAlt: createImageAltSchema(
      "Image alt text is required when image URL is provided",
    ),
  });
}
