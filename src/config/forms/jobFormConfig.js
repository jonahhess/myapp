import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "../../validation/schemas";

export const ROLE_TEXT_FIELDS = [
  { id: "job-title", name: "title", label: "Job title" },
  { id: "job-company", name: "company", label: "Company name" },
  { id: "job-category", name: "category", label: "Category" },
  { id: "job-location", name: "location", label: "Location" },
];

export const ROLE_SELECT_FIELDS = [
  {
    id: "job-type",
    name: "jobType",
    label: "Employment type",
    placeholder: "Select type",
    options: EMPLOYMENT_TYPES,
  },
  {
    id: "job-experience-level",
    name: "experienceLevel",
    label: "Experience level",
    placeholder: "Select level",
    options: EXPERIENCE_LEVELS,
  },
];

export const COMPENSATION_FIELDS = [
  {
    id: "job-salary-min",
    name: "salaryMin",
    label: "Minimum salary",
    type: "number",
    inputProps: { min: "0" },
  },
  {
    id: "job-salary-max",
    name: "salaryMax",
    label: "Maximum salary",
    type: "number",
    inputProps: { min: "0" },
  },
  { id: "job-phone", name: "phone", label: "Phone number" },
  {
    id: "job-email",
    name: "email",
    label: "Contact email",
    type: "email",
  },
  {
    id: "job-apply-link",
    name: "applyLink",
    label: "Application link (optional)",
    wrapperClassName: "job-form__full-width",
  },
];

export const IMAGE_FIELDS = [
  { id: "job-image-url", name: "imageUrl", label: "Image URL (optional)" },
  { id: "job-image-alt", name: "imageAlt", label: "Image alt text" },
];
