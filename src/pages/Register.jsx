import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import {
  REGISTER_FIELD_GROUPS,
  REGISTER_INITIAL_VALUES,
} from "../config/forms/registerFormConfig";
import usersService from "../services/usersService";
import { createRegisterValidationSchema } from "../validation/schemas";
import { getUserFriendlyErrorMessage } from "../utils/errors";
import { normalizeRegisterPayload } from "../utils/requestNormalization";

function Register() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const formik = useFormik({
    initialValues: REGISTER_INITIAL_VALUES,
    validateOnMount: true,
    validationSchema: createRegisterValidationSchema(),
    onSubmit: async (values, helpers) => {
      setSubmitError("");
      setSubmitSuccess("");

      const payload = normalizeRegisterPayload(values);

      try {
        await usersService.register(payload);
        setSubmitSuccess("Registration completed. You can now log in.");
        helpers.resetForm();
        navigate("/login");
      } catch (error) {
        setSubmitError(
          getUserFriendlyErrorMessage(
            error,
            "Registration failed. Please try again.",
          ),
        );
      }
    },
  });

  return (
    <main className="register-page">
      <h1>Create Account</h1>
      <p className="intro">
        Create your account to save jobs, track applications, and personalize
        your experience on Jonah's Job Board.
      </p>

      <form className="register-form" onSubmit={formik.handleSubmit} noValidate>
        {REGISTER_FIELD_GROUPS.map((group) => (
          <fieldset key={group.legend} className="group">
            <legend>{group.legend}</legend>
            <div className="grid">
              {group.fields.map((field) => (
                <FormInput
                  key={field.name}
                  formik={formik}
                  name={field.name}
                  label={field.label}
                  prefix="register"
                  type={field.type}
                  inputProps={field.inputProps}
                />
              ))}
            </div>
          </fieldset>
        ))}

        <fieldset className="group">
          <legend>Account Type</legend>
          <label className="checkbox">
            <input
              type="checkbox"
              name="isRecruiter"
              checked={formik.values.isRecruiter}
              onChange={formik.handleChange}
            />
            Register as recruiter
          </label>
          <p className="hint">
            Administrator registration is not available from this form.
          </p>
        </fieldset>

        {!!submitError ? (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        ) : null}
        {!!submitSuccess ? (
          <p className="form-success">{submitSuccess}</p>
        ) : null}

        <button
          className="submit"
          type="submit"
          disabled={formik.isSubmitting || !formik.isValid}
          aria-busy={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Saving..." : "Create account"}
        </button>
      </form>
    </main>
  );
}

export default Register;
