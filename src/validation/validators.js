import * as yup from "yup";

export const EMPLOYMENT_TYPES = [
  "Full-Time",
  "Part-Time",
  "Freelance",
  "Temporary",
  "Internship",
];

export const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Junior",
  "Mid-Level",
  "Senior",
  "Team Lead",
  "Management",
];

export function extractDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function createRequiredTrimmedTextSchema({
  label,
  min = 2,
  max = 256,
  requiredMessage,
  minMessage,
  maxMessage,
}) {
  let schema = yup.string().trim();

  if (typeof min === "number") {
    schema = schema.min(
      min,
      minMessage || `${label} must be at least ${min} characters`,
    );
  }

  if (typeof max === "number") {
    schema = schema.max(
      max,
      maxMessage || `${label} must be at most ${max} characters`,
    );
  }

  return schema.required(requiredMessage || `${label} is required`);
}

export function createOptionalTrimmedTextSchema({ max, maxMessage } = {}) {
  let schema = yup.string().trim();

  if (typeof max === "number") {
    schema = schema.max(max, maxMessage || `Must be at most ${max} characters`);
  }

  return schema;
}

export function createIsraeliPhoneSchema() {
  return yup
    .string()
    .required("Phone number is required")
    .test(
      "israeli-phone",
      "Phone must be Israeli format with 9-11 digits",
      (value) => {
        const digits = extractDigits(value);
        if (digits.length < 9 || digits.length > 11) {
          return false;
        }

        return digits.startsWith("0") || digits.startsWith("972");
      },
    );
}

export function createEmailSchema(invalidMessage = "Enter a valid email") {
  return yup.string().email(invalidMessage).required("Email is required");
}

export function createOptionalUrlSchema(message) {
  return yup
    .string()
    .trim()
    .test("optional-url", message, (value) => {
      if (!value) {
        return true;
      }

      return yup.string().url().isValidSync(value);
    });
}

export function createImageAltSchema(requiredMessage) {
  return yup
    .string()
    .trim()
    .when("imageUrl", {
      is: (imageUrl) => Boolean(String(imageUrl || "").trim()),
      then: (schema) => schema.required(requiredMessage),
      otherwise: (schema) => schema,
    });
}

export function createHouseNumberSchema() {
  return yup
    .string()
    .required("House number is required")
    .matches(/^\d+$/, "House number must contain numbers only");
}

export function createPostalCodeSchema() {
  return yup
    .string()
    .trim()
    .test(
      "postal-code-number",
      "Postal code must contain numbers only",
      (value) => !value || /^\d+$/.test(value),
    );
}

export function createPasswordSchema() {
  return yup
    .string()
    .required("Password is required")
    .min(7, "Password must be at least 7 characters")
    .matches(/[A-Z]/, "Password must include at least one uppercase letter")
    .matches(/[a-z]/, "Password must include at least one lowercase letter")
    .test(
      "min-4-digits",
      "Password must include at least four digits",
      (value) => extractDigits(value).length >= 4,
    )
    .matches(/[-*&^%$#@!]/, "Password must include one special character");
}
