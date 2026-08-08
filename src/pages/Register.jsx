import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import usersService from "../services/usersService";
import { createRegisterValidationSchema } from "../validation/schemas";
import { getUserFriendlyErrorMessage } from "../utils/errors";
import { normalizeRegisterPayload } from "../utils/requestNormalization";

function Register() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const formik = useFormik({
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      imageUrl: "",
      imageAlt: "",
      country: "",
      city: "",
      street: "",
      houseNumber: "",
      district: "",
      postalCode: "",
      isRecruiter: false,
    },
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

  const showFieldError = (name) =>
    Boolean(
      (formik.touched[name] || formik.submitCount > 0) && formik.errors[name],
    );
  const fieldErrorId = (name) => `register-${name}-error`;

  return (
    <main className="register-page">
      <h1>Create Account</h1>
      <p className="register-page__intro">
        Create your account to save jobs, track applications, and personalize
        your experience on Jonah's Job Board.
      </p>

      <form className="register-form" onSubmit={formik.handleSubmit} noValidate>
        <fieldset className="register-form__group">
          <legend>Personal Details</legend>
          <div className="register-form__grid">
            <label>
              First name
              <input
                name="firstName"
                className={
                  showFieldError("firstName") ? "form-input--invalid" : ""
                }
                aria-invalid={showFieldError("firstName")}
                aria-describedby={
                  showFieldError("firstName")
                    ? fieldErrorId("firstName")
                    : undefined
                }
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {showFieldError("firstName") ? (
                <span
                  id={fieldErrorId("firstName")}
                  className="form-error"
                  role="alert"
                >
                  {formik.errors.firstName}
                </span>
              ) : null}
            </label>

            <label>
              Middle name (optional)
              <input
                name="middleName"
                className={
                  showFieldError("middleName") ? "form-input--invalid" : ""
                }
                aria-invalid={showFieldError("middleName")}
                aria-describedby={
                  showFieldError("middleName")
                    ? fieldErrorId("middleName")
                    : undefined
                }
                value={formik.values.middleName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {showFieldError("middleName") ? (
                <span
                  id={fieldErrorId("middleName")}
                  className="form-error"
                  role="alert"
                >
                  {formik.errors.middleName}
                </span>
              ) : null}
            </label>

            <label>
              Last name
              <input
                name="lastName"
                className={
                  showFieldError("lastName") ? "form-input--invalid" : ""
                }
                aria-invalid={showFieldError("lastName")}
                aria-describedby={
                  showFieldError("lastName")
                    ? fieldErrorId("lastName")
                    : undefined
                }
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {showFieldError("lastName") ? (
                <span
                  id={fieldErrorId("lastName")}
                  className="form-error"
                  role="alert"
                >
                  {formik.errors.lastName}
                </span>
              ) : null}
            </label>

            <label>
              Phone number
              <input
                name="phone"
                className={showFieldError("phone") ? "form-input--invalid" : ""}
                aria-invalid={showFieldError("phone")}
                aria-describedby={
                  showFieldError("phone") ? fieldErrorId("phone") : undefined
                }
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="05X-XXXXXXX"
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

            <label>
              Email
              <input
                type="email"
                name="email"
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

            <label>
              Password
              <input
                type="password"
                name="password"
                className={
                  showFieldError("password") ? "form-input--invalid" : ""
                }
                aria-invalid={showFieldError("password")}
                aria-describedby={
                  showFieldError("password")
                    ? fieldErrorId("password")
                    : undefined
                }
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {showFieldError("password") ? (
                <span
                  id={fieldErrorId("password")}
                  className="form-error"
                  role="alert"
                >
                  {formik.errors.password}
                </span>
              ) : null}
            </label>
          </div>
        </fieldset>

        <fieldset className="register-form__group">
          <legend>Image</legend>
          <div className="register-form__grid">
            <label>
              Image URL (optional)
              <input
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

            <label>
              Image alt text
              <input
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

        <fieldset className="register-form__group">
          <legend>Address</legend>
          <div className="register-form__grid">
            <label>
              Country
              <input
                name="country"
                className={
                  showFieldError("country") ? "form-input--invalid" : ""
                }
                aria-invalid={showFieldError("country")}
                aria-describedby={
                  showFieldError("country")
                    ? fieldErrorId("country")
                    : undefined
                }
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {showFieldError("country") ? (
                <span
                  id={fieldErrorId("country")}
                  className="form-error"
                  role="alert"
                >
                  {formik.errors.country}
                </span>
              ) : null}
            </label>

            <label>
              City
              <input
                name="city"
                className={showFieldError("city") ? "form-input--invalid" : ""}
                aria-invalid={showFieldError("city")}
                aria-describedby={
                  showFieldError("city") ? fieldErrorId("city") : undefined
                }
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {showFieldError("city") ? (
                <span
                  id={fieldErrorId("city")}
                  className="form-error"
                  role="alert"
                >
                  {formik.errors.city}
                </span>
              ) : null}
            </label>

            <label>
              Street
              <input
                name="street"
                className={
                  showFieldError("street") ? "form-input--invalid" : ""
                }
                aria-invalid={showFieldError("street")}
                aria-describedby={
                  showFieldError("street") ? fieldErrorId("street") : undefined
                }
                value={formik.values.street}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {showFieldError("street") ? (
                <span
                  id={fieldErrorId("street")}
                  className="form-error"
                  role="alert"
                >
                  {formik.errors.street}
                </span>
              ) : null}
            </label>

            <label>
              House number
              <input
                name="houseNumber"
                className={
                  showFieldError("houseNumber") ? "form-input--invalid" : ""
                }
                aria-invalid={showFieldError("houseNumber")}
                aria-describedby={
                  showFieldError("houseNumber")
                    ? fieldErrorId("houseNumber")
                    : undefined
                }
                value={formik.values.houseNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputMode="numeric"
              />
              {showFieldError("houseNumber") ? (
                <span
                  id={fieldErrorId("houseNumber")}
                  className="form-error"
                  role="alert"
                >
                  {formik.errors.houseNumber}
                </span>
              ) : null}
            </label>

            <label>
              District (optional)
              <input
                name="district"
                className={
                  showFieldError("district") ? "form-input--invalid" : ""
                }
                aria-invalid={showFieldError("district")}
                aria-describedby={
                  showFieldError("district")
                    ? fieldErrorId("district")
                    : undefined
                }
                value={formik.values.district}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {showFieldError("district") ? (
                <span
                  id={fieldErrorId("district")}
                  className="form-error"
                  role="alert"
                >
                  {formik.errors.district}
                </span>
              ) : null}
            </label>

            <label>
              Postal code (optional)
              <input
                name="postalCode"
                className={
                  showFieldError("postalCode") ? "form-input--invalid" : ""
                }
                aria-invalid={showFieldError("postalCode")}
                aria-describedby={
                  showFieldError("postalCode")
                    ? fieldErrorId("postalCode")
                    : undefined
                }
                value={formik.values.postalCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputMode="numeric"
              />
              {showFieldError("postalCode") ? (
                <span
                  id={fieldErrorId("postalCode")}
                  className="form-error"
                  role="alert"
                >
                  {formik.errors.postalCode}
                </span>
              ) : null}
            </label>
          </div>
        </fieldset>

        <fieldset className="register-form__group">
          <legend>Account Type</legend>
          <label className="register-form__checkbox">
            <input
              type="checkbox"
              name="isRecruiter"
              checked={formik.values.isRecruiter}
              onChange={formik.handleChange}
            />
            Register as recruiter
          </label>
          <p className="register-form__hint">
            Administrator registration is not available from this form.
          </p>
        </fieldset>

        {submitError ? (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        ) : null}
        {submitSuccess ? <p className="form-success">{submitSuccess}</p> : null}

        <button
          className="register-form__submit"
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
