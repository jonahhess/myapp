import * as yup from "yup";
import {
  createEmailSchema,
  createHouseNumberSchema,
  createImageAltSchema,
  createIsraeliPhoneSchema,
  createOptionalTrimmedTextSchema,
  createOptionalUrlSchema,
  createPasswordSchema,
  createZipSchema,
  createRequiredTrimmedTextSchema,
} from "./validators";

function createCommonUserDetailsValidationShape() {
  return {
    firstName: createRequiredTrimmedTextSchema({
      label: "First name",
    }),
    middleName: createOptionalTrimmedTextSchema({
      max: 256,
      maxMessage: "Middle name is too long",
    }),
    lastName: createRequiredTrimmedTextSchema({
      label: "Last name",
    }),
    phone: createIsraeliPhoneSchema(),
    imageUrl: createOptionalUrlSchema("Image URL must be valid").nullable(),
    imageAlt: createImageAltSchema(
      "Image alt text is required when URL is provided",
    ),
    state: createRequiredTrimmedTextSchema({ label: "State" }),
    country: createRequiredTrimmedTextSchema({ label: "Country" }),
    city: createRequiredTrimmedTextSchema({ label: "City" }),
    street: createRequiredTrimmedTextSchema({ label: "Street" }),
    houseNumber: createHouseNumberSchema(),
    zip: createZipSchema(),
  };
}

export function createRegisterValidationSchema() {
  return yup.object({
    ...createCommonUserDetailsValidationShape(),
    email: createEmailSchema("Enter a valid email"),
    password: createPasswordSchema(),
    isRecruiter: yup.boolean().required(),
  });
}

export function createProfileValidationSchema() {
  return yup.object(createCommonUserDetailsValidationShape());
}

export function createLoginValidationSchema() {
  return yup.object({
    email: createEmailSchema("Invalid email"),
    password: yup.string().required("Password is required"),
  });
}
