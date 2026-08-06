import { useFormik } from "formik";
import * as yup from "yup";

function Login({
  onSubmit,
  isSubmitting = false,
  submitError = "",
  formClassName = "",
  groupClassName = "",
  gridClassName = "",
  errorClassName = "",
  submitButtonClassName = "",
}) {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validateOnMount: true,
    validationSchema: yup.object({
      email: yup.string().email("Invalid email").required("Email is required"),
      password: yup.string().required("Password is required"),
    }),
    onSubmit: async (values, helpers) => {
      if (!onSubmit) {
        return;
      }

      try {
        await onSubmit(values);
      } catch {
        helpers.setSubmitting(false);
      }
    },
  });

  const showFieldError = (name) =>
    Boolean(
      (formik.touched[name] || formik.submitCount > 0) && formik.errors[name],
    );
  const fieldErrorId = (name) => `${name}-error`;

  return (
    <form className={formClassName} onSubmit={formik.handleSubmit} noValidate>
      <fieldset className={groupClassName}>
        <legend>Account Login</legend>
        <div className={gridClassName}>
          <label htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={showFieldError("email") ? "form-input--invalid" : ""}
              aria-invalid={showFieldError("email")}
              aria-describedby={
                showFieldError("email") ? fieldErrorId("email") : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {showFieldError("email") ? (
              <span
                id={fieldErrorId("email")}
                className={errorClassName}
                role="alert"
              >
                {formik.errors.email}
              </span>
            ) : null}
          </label>

          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={
                showFieldError("password") ? "form-input--invalid" : ""
              }
              aria-invalid={showFieldError("password")}
              aria-describedby={
                showFieldError("password")
                  ? fieldErrorId("password")
                  : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {showFieldError("password") ? (
              <span
                id={fieldErrorId("password")}
                className={errorClassName}
                role="alert"
              >
                {formik.errors.password}
              </span>
            ) : null}
          </label>
        </div>
      </fieldset>

      {submitError ? (
        <p className={errorClassName} role="alert">
          {submitError}
        </p>
      ) : null}

      <button
        className={submitButtonClassName}
        type="submit"
        disabled={formik.isSubmitting || isSubmitting || !formik.isValid}
        aria-busy={formik.isSubmitting || isSubmitting}
      >
        {formik.isSubmitting || isSubmitting ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}

export default Login;
