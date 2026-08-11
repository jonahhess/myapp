import { useFormik } from "formik";
import FormInput from "./FormInput.jsx";
import { createLoginValidationSchema } from "../validation/schemas";

const LOGIN_FIELDS = [
  {
    name: "email",
    label: "Email",
    type: "email",
    inputProps: {
      autoComplete: "email",
    },
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    inputProps: {
      autoComplete: "current-password",
    },
  },
];

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
    validationSchema: createLoginValidationSchema(),
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

  return (
    <form className={formClassName} onSubmit={formik.handleSubmit} noValidate>
      <fieldset className={groupClassName}>
        <legend>Account Login</legend>
        <div className={gridClassName}>
          {LOGIN_FIELDS.map((field) => (
            <FormInput
              key={field.name}
              formik={formik}
              name={field.name}
              label={field.label}
              type={field.type}
              inputProps={field.inputProps}
              errorClassName={errorClassName}
            />
          ))}
        </div>
      </fieldset>

      {!!submitError && (
        <p className={errorClassName} role="alert">
          {submitError}
        </p>
      )}

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
