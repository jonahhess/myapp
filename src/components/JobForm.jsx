import { useEffect } from "react";
import { useFormik } from "formik";
import FormInput from "./FormInput.jsx";
import FormSelect from "./FormSelect.jsx";
import {
  COMPENSATION_FIELDS,
  IMAGE_FIELDS,
  ROLE_SELECT_FIELDS,
  ROLE_TEXT_FIELDS,
} from "../config/forms/jobFormConfig";
import { createJobValidationSchema } from "../validation/schemas";
import { toJobApiPayload, toJobFormValues } from "../utils/jobFormValues.js";

function JobForm({
  initialValues,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting = false,
  submitError = "",
  enableReinitialize = false,
  onValuesChange,
}) {
  const formik = useFormik({
    initialValues: toJobFormValues(initialValues),
    enableReinitialize,
    validateOnMount: true,
    validationSchema: createJobValidationSchema(),
    onSubmit: async (values, helpers) => {
      try {
        await onSubmit?.(toJobApiPayload(values, initialValues), helpers);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const hasDescriptionError = Boolean(
    (formik.touched.description || formik.submitCount > 0) &&
    formik.errors.description,
  );
  const shouldDisableSubmit =
    formik.isSubmitting ||
    isSubmitting ||
    (enableReinitialize && !formik.dirty) ||
    (formik.submitCount > 0 && !formik.isValid);

  useEffect(() => {
    onValuesChange?.(formik.values);
  }, [formik.values, onValuesChange]);

  return (
    <form className="job-form" onSubmit={formik.handleSubmit} noValidate>
      <fieldset className="group">
        <legend>Role Details</legend>
        <div className="grid">
          {ROLE_TEXT_FIELDS.map((field) => (
            <FormInput
              key={field.name}
              formik={formik}
              id={field.id}
              name={field.name}
              label={field.label}
              prefix="job"
            />
          ))}
          {ROLE_SELECT_FIELDS.map((field) => (
            <FormSelect
              key={field.name}
              formik={formik}
              id={field.id}
              name={field.name}
              label={field.label}
              options={field.options}
              placeholder={field.placeholder}
              prefix="job"
            />
          ))}
        </div>

        <label htmlFor="job-description" className="full">
          Job description
          <textarea
            id="job-description"
            name="description"
            rows="6"
            className={hasDescriptionError ? "invalid" : ""}
            aria-invalid={hasDescriptionError}
            aria-describedby={
              hasDescriptionError ? "job-description-error" : undefined
            }
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {hasDescriptionError ? (
            <span
              id="job-description-error"
              className="form-error"
              role="alert"
            >
              {formik.errors.description}
            </span>
          ) : null}
        </label>
      </fieldset>

      <fieldset className="group">
        <legend>Compensation and Contact</legend>
        <div className="grid">
          {COMPENSATION_FIELDS.map((field) => (
            <FormInput
              key={field.name}
              formik={formik}
              id={field.id}
              name={field.name}
              label={field.label}
              type={field.type}
              prefix="job"
              inputProps={field.inputProps}
              wrapperClassName={field.wrapperClassName}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="group">
        <legend>Image</legend>
        <p className="hint">
          Image object is always sent. URL and alt text are optional unless URL
          is provided.
        </p>
        <div className="grid">
          {IMAGE_FIELDS.map((field) => (
            <FormInput
              key={field.name}
              formik={formik}
              id={field.id}
              name={field.name}
              label={field.label}
              prefix="job"
            />
          ))}
        </div>
      </fieldset>

      {submitError ? (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      ) : null}

      <button
        className="submit"
        type="submit"
        disabled={shouldDisableSubmit}
        aria-busy={formik.isSubmitting || isSubmitting}
      >
        {formik.isSubmitting || isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}

export default JobForm;
