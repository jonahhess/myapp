import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "../../validation/schemas";

function extractDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function normalizeOptionKey(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function toSelectOptionValue(rawValue, options) {
  if (rawValue === null || rawValue === undefined) {
    return "";
  }

  const candidate =
    typeof rawValue === "object"
      ? rawValue.value || rawValue.label || ""
      : String(rawValue);
  const candidateKey = normalizeOptionKey(candidate);

  const exactMatch = options.find(
    (option) => normalizeOptionKey(option) === candidateKey,
  );

  return exactMatch || "";
}

export function toJobFormValues(initialValues = {}) {
  const rawJobType =
    initialValues.jobType ||
    initialValues.job_type ||
    initialValues.employmentType ||
    initialValues.employment_type ||
    initialValues.type ||
    "";
  const rawExperienceLevel =
    initialValues.experienceLevel ||
    initialValues.experience_level ||
    initialValues.experience ||
    initialValues.level ||
    initialValues.seniority ||
    "";

  return {
    title: initialValues.title || "",
    company: initialValues.company || "",
    description: initialValues.description || "",
    category: initialValues.category || "",
    jobType: toSelectOptionValue(rawJobType, EMPLOYMENT_TYPES),
    experienceLevel: toSelectOptionValue(rawExperienceLevel, EXPERIENCE_LEVELS),
    location: initialValues.location || "",
    salaryMin:
      initialValues.salaryMin === null || initialValues.salaryMin === undefined
        ? ""
        : String(initialValues.salaryMin),
    salaryMax:
      initialValues.salaryMax === null || initialValues.salaryMax === undefined
        ? ""
        : String(initialValues.salaryMax),
    phone:
      initialValues.phone ||
      initialValues.phoneNumber ||
      initialValues.phone_number ||
      initialValues.contactPhone ||
      initialValues.contact_phone ||
      "",
    email: initialValues.email || initialValues.contactEmail || "",
    applyLink: initialValues.applyLink || "",
    imageUrl: initialValues.imageUrl || "",
    imageAlt: initialValues.imageAlt || "",
  };
}

export function toJobApiPayload(values, initialValues = {}) {
  const payload = {
    title: values.title.trim(),
    company: values.company.trim(),
    description: values.description.trim(),
    category: values.category.trim(),
    jobType: values.jobType,
    experienceLevel: values.experienceLevel,
    location: values.location.trim(),
    salary: {
      min: Number(values.salaryMin),
      max: Number(values.salaryMax),
    },
    phone: extractDigits(values.phone),
    email: values.email.trim(),
    applyLink: values.applyLink.trim(),
    image: {
      url: values.imageUrl.trim(),
      alt: values.imageAlt.trim(),
    },
  };

  if (initialValues?.jobNumber) {
    payload.jobNumber = initialValues.jobNumber;
  }

  return payload;
}
