import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import usersService from "../services/usersService";
import { createProfileValidationSchema } from "../validation/schemas";
import { getUserFriendlyErrorMessage } from "../utils/errors";
import { normalizeUserProfileUpdatePayload } from "../utils/requestNormalization";

function mapUserToProfileValues(payload = {}) {
  const user = payload?.user || payload?.data?.user || payload;

  return {
    firstName: user?.name?.first || user?.firstName || user?.first_name || "",
    middleName:
      user?.name?.middle || user?.middleName || user?.middle_name || "",
    lastName: user?.name?.last || user?.lastName || user?.last_name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    imageUrl: user?.image?.url || user?.imageUrl || user?.image_url || "",
    imageAlt: user?.image?.alt || user?.imageAlt || user?.image_alt || "",
    country: user?.address?.country || "",
    city: user?.address?.city || "",
    street: user?.address?.street || "",
    houseNumber:
      user?.address?.houseNumber === null ||
      user?.address?.houseNumber === undefined
        ? ""
        : String(user.address.houseNumber),
    district: user?.address?.district || "",
    postalCode:
      user?.address?.postalCode === null ||
      user?.address?.postalCode === undefined
        ? ""
        : String(user.address.postalCode),
    isAdmin: Boolean(user?.isAdmin),
    isRecruiter: Boolean(user?.isRecruiter),
  };
}

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingRecruiter, setIsTogglingRecruiter] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    email: "",
    imageUrl: "",
    imageAlt: "",
    country: "",
    city: "",
    street: "",
    houseNumber: "",
    district: "",
    postalCode: "",
    isAdmin: false,
    isRecruiter: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadUserProfile() {
      if (!user?.id) {
        setIsLoading(false);
        setLoadError("Unable to determine current user.");
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const payload = await usersService.getUserById(user.id);
        if (isMounted) {
          setInitialValues(mapUserToProfileValues(payload));
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            getUserFriendlyErrorMessage(error, "Failed to load your profile."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUserProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnMount: true,
    validationSchema: createProfileValidationSchema(),
    onSubmit: async (values, helpers) => {
      if (!user?.id) {
        return;
      }

      setSubmitError("");
      setSuccessMessage("");

      const payload = normalizeUserProfileUpdatePayload(values);

      try {
        await usersService.updateUserById(user.id, payload);
        setSuccessMessage("Profile updated successfully.");
      } catch (error) {
        setSubmitError(
          getUserFriendlyErrorMessage(error, "Failed to update profile."),
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const showFieldError = (name) =>
    Boolean(
      (formik.touched[name] || formik.submitCount > 0) && formik.errors[name],
    );
  const fieldErrorId = (name) => `profile-${name}-error`;

  const handleToggleRecruiterStatus = async () => {
    if (!user?.id || isTogglingRecruiter) {
      return;
    }

    setIsTogglingRecruiter(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      await usersService.toggleRecruiterStatus(user.id);
      await logout();
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Recruiter status changed. Please log in again to refresh your permissions.",
        },
      });
    } catch (error) {
      setSubmitError(
        getUserFriendlyErrorMessage(
          error,
          "Failed to change recruiter status.",
        ),
      );
    } finally {
      setIsTogglingRecruiter(false);
    }
  };

  if (isLoading) {
    return (
      <main className="profile-page">
        <h1>Profile Settings</h1>
        <LoadingSpinner label="Loading profile..." />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="profile-page">
        <h1>Profile Settings</h1>
        <p className="form-error" role="alert">
          {loadError}
        </p>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <h1>Profile Settings</h1>
      <p className="profile-page__intro">
        Keep your profile information accurate. Email, password, and
        administrator status cannot be changed from this form.
      </p>

      {submitError ? (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      ) : null}
      {successMessage ? <p className="form-success">{successMessage}</p> : null}

      <form className="profile-form" onSubmit={formik.handleSubmit} noValidate>
        <fieldset className="profile-form__group">
          <legend>Account Information</legend>
          <div className="profile-form__grid">
            <label htmlFor="profile-email">
              Email (read-only)
              <input
                id="profile-email"
                name="email"
                value={formik.values.email}
                readOnly
                disabled
                className="profile-form__readonly"
              />
            </label>

            <label htmlFor="profile-password-placeholder">
              Password
              <input
                id="profile-password-placeholder"
                value="********"
                readOnly
                disabled
                className="profile-form__readonly"
              />
            </label>

            <label htmlFor="profile-admin">
              Administrator status
              <input
                id="profile-admin"
                value={formik.values.isAdmin ? "Admin" : "Standard user"}
                readOnly
                disabled
                className="profile-form__readonly"
              />
            </label>

            <label htmlFor="profile-recruiter">
              Recruiter status
              <input
                id="profile-recruiter"
                value={
                  formik.values.isRecruiter ? "Recruiter" : "Not recruiter"
                }
                readOnly
                disabled
                className="profile-form__readonly"
              />
            </label>
          </div>

          <button
            type="button"
            className="profile-form__toggle"
            onClick={handleToggleRecruiterStatus}
            disabled={isTogglingRecruiter}
            aria-busy={isTogglingRecruiter}
          >
            {isTogglingRecruiter
              ? "Saving..."
              : formik.values.isRecruiter
                ? "Disable Recruiter Mode"
                : "Enable Recruiter Mode"}
          </button>
        </fieldset>

        <fieldset className="profile-form__group">
          <legend>Personal Details</legend>
          <div className="profile-form__grid">
            <label htmlFor="profile-firstName">
              First name
              <input
                id="profile-firstName"
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

            <label htmlFor="profile-middleName">
              Middle name (optional)
              <input
                id="profile-middleName"
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

            <label htmlFor="profile-lastName">
              Last name
              <input
                id="profile-lastName"
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

            <label htmlFor="profile-phone">
              Phone number
              <input
                id="profile-phone"
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
          </div>
        </fieldset>

        <fieldset className="profile-form__group">
          <legend>Image</legend>
          <div className="profile-form__grid">
            <label htmlFor="profile-imageUrl">
              Image URL (optional)
              <input
                id="profile-imageUrl"
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

            <label htmlFor="profile-imageAlt">
              Image alt text
              <input
                id="profile-imageAlt"
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

        <fieldset className="profile-form__group">
          <legend>Address</legend>
          <div className="profile-form__grid">
            <label htmlFor="profile-country">
              Country
              <input
                id="profile-country"
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

            <label htmlFor="profile-city">
              City
              <input
                id="profile-city"
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

            <label htmlFor="profile-street">
              Street
              <input
                id="profile-street"
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

            <label htmlFor="profile-houseNumber">
              House number
              <input
                id="profile-houseNumber"
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

            <label htmlFor="profile-district">
              District (optional)
              <input
                id="profile-district"
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

            <label htmlFor="profile-postalCode">
              Postal code (optional)
              <input
                id="profile-postalCode"
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

        <button
          className="profile-form__submit"
          type="submit"
          disabled={formik.isSubmitting || !formik.isValid}
          aria-busy={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}

export default Profile;
