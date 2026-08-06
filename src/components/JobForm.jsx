import { useFormik } from "formik";
import * as yup from "yup";

const EMPLOYMENT_TYPES = [
  "Full-Time",
  "Part-Time",
  "Freelance",
  "Temporary",
  "Internship",
];

const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Junior",
  "Mid-Level",
  "Senior",
  "Team Lead",
  "Management",
];

function extractDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function createValidationSchema() {
  return yup.object({
    title: yup
      .string()
      .trim()
      .min(2, "Job title must be at least 2 characters")
      .max(256, "Job title must be at most 256 characters")
      .required("Job title is required"),
    company: yup
      .string()
      .trim()
      .min(2, "Company name must be at least 2 characters")
      .max(256, "Company name must be at most 256 characters")
      .required("Company name is required"),
    description: yup
      .string()
      .trim()
      .min(2, "Description must be at least 2 characters")
      .max(1024, "Description must be at most 1024 characters")
      .required("Description is required"),
    category: yup
      .string()
      .trim()
      .max(2, "Category can be at most 2 characters")
      .required("Category is required"),
    location: yup
      .string()
      .trim()
      .max(2, "Location can be at most 2 characters")
      .required("Location is required"),
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
        "max-lte-min",
        "Maximum salary must be less than or equal to minimum salary",
        function validateSalaryMax(value) {
          const { salaryMin } = this.parent;
          if (
            !Number.isFinite(Number(value)) ||
            !Number.isFinite(Number(salaryMin))
          ) {
            return true;
          }

          return Number(value) <= Number(salaryMin);
        },
      ),
    phone: yup
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
      ),
    email: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required"),
    applyLink: yup
      .string()
      .trim()
      .test(
        "optional-url",
        "Application link must be a valid URL",
        (value) => !value || yup.string().url().isValidSync(value),
      ),
    imageUrl: yup
      .string()
      .trim()
      .test(
        "optional-image-url",
        "Image URL must be valid",
        (value) => !value || yup.string().url().isValidSync(value),
      ),
    imageAlt: yup
      .string()
      .trim()
      .when("imageUrl", {
        is: (imageUrl) => Boolean(String(imageUrl || "").trim()),
        then: (schema) =>
          schema.required(
            "Image alt text is required when image URL is provided",
          ),
        otherwise: (schema) => schema,
      }),
  });
}

function toFormValues(initialValues = {}) {
  return {
    title: initialValues.title || "",
    company: initialValues.company || "",
    description: initialValues.description || "",
    category: initialValues.category || "",
    jobType: initialValues.jobType || "",
    experienceLevel: initialValues.experienceLevel || "",
    location: initialValues.location || "",
    salaryMin:
      initialValues.salaryMin === null || initialValues.salaryMin === undefined
        ? ""
        : String(initialValues.salaryMin),
    salaryMax:
      initialValues.salaryMax === null || initialValues.salaryMax === undefined
        ? ""
        : String(initialValues.salaryMax),
    phone: initialValues.phone || "",
    email: initialValues.email || "",
    applyLink: initialValues.applyLink || "",
    imageUrl: initialValues.imageUrl || "",
    imageAlt: initialValues.imageAlt || "",
  };
}

function toApiPayload(values) {
  return {
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
}

function JobForm({
  initialValues,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting = false,
  submitError = "",
  enableReinitialize = false,
}) {
  const formik = useFormik({
    initialValues: toFormValues(initialValues),
    enableReinitialize,
    validateOnMount: true,
    validationSchema: createValidationSchema(),
    onSubmit: async (values, helpers) => {
      try {
        await onSubmit?.(toApiPayload(values), helpers);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const showFieldError = (name) =>
    Boolean(
      (formik.touched[name] || formik.submitCount > 0) && formik.errors[name],
    );
  const fieldErrorId = (name) => `job-${name}-error`;

  return (
    <form className="job-form" onSubmit={formik.handleSubmit} noValidate>
      <fieldset className="job-form__group">
        <legend>Role Details</legend>
        <div className="job-form__grid">
          <label htmlFor="job-title">
            Job title
            <input
              id="job-title"
              name="title"
              className={showFieldError("title") ? "form-input--invalid" : ""}
              aria-invalid={showFieldError("title")}
              aria-describedby={
                showFieldError("title") ? fieldErrorId("title") : undefined
              }
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("title") ? (
              <span
                id={fieldErrorId("title")}
                className="form-error"
                role="alert"
              >
                {formik.errors.title}
              </span>
            ) : null}
          </label>

          <label htmlFor="job-company">
            Company name
            <input
              id="job-company"
              name="company"
              className={showFieldError("company") ? "form-input--invalid" : ""}
              aria-invalid={showFieldError("company")}
              aria-describedby={
                showFieldError("company") ? fieldErrorId("company") : undefined
              }
              value={formik.values.company}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("company") ? (
              <span
                id={fieldErrorId("company")}
                className="form-error"
                role="alert"
              >
                {formik.errors.company}
              </span>
            ) : null}
          </label>

          <label htmlFor="job-category">
            Category
            <input
              id="job-category"
              name="category"
              className={
                showFieldError("category") ? "form-input--invalid" : ""
              }
              aria-invalid={showFieldError("category")}
              aria-describedby={
                showFieldError("category")
                  ? fieldErrorId("category")
                  : undefined
              }
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("category") ? (
              <span
                id={fieldErrorId("category")}
                className="form-error"
                role="alert"
              >
                {formik.errors.category}
              </span>
            ) : null}
          </label>

          <label htmlFor="job-location">
            Location
            <input
              id="job-location"
              name="location"
              className={
                showFieldError("location") ? "form-input--invalid" : ""
              }
              aria-invalid={showFieldError("location")}
              aria-describedby={
                showFieldError("location")
                  ? fieldErrorId("location")
                  : undefined
              }
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("location") ? (
              <span
                id={fieldErrorId("location")}
                className="form-error"
                role="alert"
              >
                {formik.errors.location}
              </span>
            ) : null}
          </label>

          <label htmlFor="job-type">
            Employment type
            <select
              id="job-type"
              name="jobType"
              className={showFieldError("jobType") ? "form-input--invalid" : ""}
              aria-invalid={showFieldError("jobType")}
              aria-describedby={
                showFieldError("jobType") ? fieldErrorId("jobType") : undefined
              }
              value={formik.values.jobType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select type</option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {showFieldError("jobType") ? (
              <span
                id={fieldErrorId("jobType")}
                className="form-error"
                role="alert"
              >
                {formik.errors.jobType}
              </span>
            ) : null}
          </label>

          <label htmlFor="job-experience-level">
            Experience level
            <select
              id="job-experience-level"
              name="experienceLevel"
              className={
                showFieldError("experienceLevel") ? "form-input--invalid" : ""
              }
              aria-invalid={showFieldError("experienceLevel")}
              aria-describedby={
                showFieldError("experienceLevel")
                  ? fieldErrorId("experienceLevel")
                  : undefined
              }
              value={formik.values.experienceLevel}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select level</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {showFieldError("experienceLevel") ? (
              <span
                id={fieldErrorId("experienceLevel")}
                className="form-error"
                role="alert"
              >
                {formik.errors.experienceLevel}
              </span>
            ) : null}
          </label>
        </div>

        <label htmlFor="job-description" className="job-form__full-width">
          Job description
          <textarea
            id="job-description"
            name="description"
            rows="6"
            className={
              showFieldError("description") ? "form-input--invalid" : ""
            }
            aria-invalid={showFieldError("description")}
            aria-describedby={
              showFieldError("description")
                ? fieldErrorId("description")
                : undefined
            }
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {showFieldError("description") ? (
            <span
              id={fieldErrorId("description")}
              className="form-error"
              role="alert"
            >
              {formik.errors.description}
            </span>
          ) : null}
        </label>
      </fieldset>

      <fieldset className="job-form__group">
        <legend>Compensation and Contact</legend>
        <div className="job-form__grid">
          <label htmlFor="job-salary-min">
            Minimum salary
            <input
              id="job-salary-min"
              name="salaryMin"
              type="number"
              min="0"
              className={
                showFieldError("salaryMin") ? "form-input--invalid" : ""
              }
              aria-invalid={showFieldError("salaryMin")}
              aria-describedby={
                showFieldError("salaryMin")
                  ? fieldErrorId("salaryMin")
                  : undefined
              }
              value={formik.values.salaryMin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("salaryMin") ? (
              <span
                id={fieldErrorId("salaryMin")}
                className="form-error"
                role="alert"
              >
                {formik.errors.salaryMin}
              </span>
            ) : null}
          </label>

          <label htmlFor="job-salary-max">
            Maximum salary
            <input
              id="job-salary-max"
              name="salaryMax"
              type="number"
              min="0"
              className={
                showFieldError("salaryMax") ? "form-input--invalid" : ""
              }
              aria-invalid={showFieldError("salaryMax")}
              aria-describedby={
                showFieldError("salaryMax")
                  ? fieldErrorId("salaryMax")
                  : undefined
              }
              value={formik.values.salaryMax}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("salaryMax") ? (
              <span
                id={fieldErrorId("salaryMax")}
                className="form-error"
                role="alert"
              >
                {formik.errors.salaryMax}
              </span>
            ) : null}
          </label>

          <label htmlFor="job-phone">
            Phone number
            <input
              id="job-phone"
              name="phone"
              className={showFieldError("phone") ? "form-input--invalid" : ""}
              aria-invalid={showFieldError("phone")}
              aria-describedby={
                showFieldError("phone") ? fieldErrorId("phone") : undefined
              }
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("phone") ? (
              <span
                id={fieldErrorId("phone")}
                className="form-error"
                role="alert"
              >
                {formik.errors.phone}
              </span>
            ) : null}
          </label>

          <label htmlFor="job-email">
            Contact email
            <input
              id="job-email"
              name="email"
              type="email"
              className={showFieldError("email") ? "form-input--invalid" : ""}
              aria-invalid={showFieldError("email")}
              aria-describedby={
                showFieldError("email") ? fieldErrorId("email") : undefined
              }
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("email") ? (
              <span
                id={fieldErrorId("email")}
                className="form-error"
                role="alert"
              >
                {formik.errors.email}
              </span>
            ) : null}
          </label>

          <label htmlFor="job-apply-link" className="job-form__full-width">
            Application link (optional)
            <input
              id="job-apply-link"
              name="applyLink"
              className={
                showFieldError("applyLink") ? "form-input--invalid" : ""
              }
              aria-invalid={showFieldError("applyLink")}
              aria-describedby={
                showFieldError("applyLink")
                  ? fieldErrorId("applyLink")
                  : undefined
              }
              value={formik.values.applyLink}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("applyLink") ? (
              <span
                id={fieldErrorId("applyLink")}
                className="form-error"
                role="alert"
              >
                {formik.errors.applyLink}
              </span>
            ) : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="job-form__group">
        <legend>Image</legend>
        <p className="job-form__hint">
          Image object is always sent. URL and alt text are optional unless URL
          is provided.
        </p>
        <div className="job-form__grid">
          <label htmlFor="job-image-url">
            Image URL (optional)
            <input
              id="job-image-url"
              name="imageUrl"
              className={
                showFieldError("imageUrl") ? "form-input--invalid" : ""
              }
              aria-invalid={showFieldError("imageUrl")}
              aria-describedby={
                showFieldError("imageUrl")
                  ? fieldErrorId("imageUrl")
                  : undefined
              }
              value={formik.values.imageUrl}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("imageUrl") ? (
              <span
                id={fieldErrorId("imageUrl")}
                className="form-error"
                role="alert"
              >
                {formik.errors.imageUrl}
              </span>
            ) : null}
          </label>

          <label htmlFor="job-image-alt">
            Image alt text
            <input
              id="job-image-alt"
              name="imageAlt"
              className={
                showFieldError("imageAlt") ? "form-input--invalid" : ""
              }
              aria-invalid={showFieldError("imageAlt")}
              aria-describedby={
                showFieldError("imageAlt")
                  ? fieldErrorId("imageAlt")
                  : undefined
              }
              value={formik.values.imageAlt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {showFieldError("imageAlt") ? (
              <span
                id={fieldErrorId("imageAlt")}
                className="form-error"
                role="alert"
              >
                {formik.errors.imageAlt}
              </span>
            ) : null}
          </label>
        </div>
      </fieldset>

      {submitError ? (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      ) : null}

      <button
        className="job-form__submit"
        type="submit"
        disabled={formik.isSubmitting || isSubmitting || !formik.isValid}
        aria-busy={formik.isSubmitting || isSubmitting}
      >
        {formik.isSubmitting || isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}

export default JobForm;
