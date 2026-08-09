import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ProfileAccountSection from "../components/ProfileAccountSection.jsx";
import ProfileEditableSections from "../components/ProfileEditableSections.jsx";
import {
  mapUserToProfileValues,
  PROFILE_EDITABLE_GROUPS,
  PROFILE_INITIAL_VALUES,
} from "../config/forms/profileFormConfig";
import { useAuth } from "../contexts/AuthContext.jsx";
import usersService from "../services/usersService";
import { createProfileValidationSchema } from "../validation/schemas";
import { getUserFriendlyErrorMessage } from "../utils/errors";
import { normalizeUserProfileUpdatePayload } from "../utils/requestNormalization";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingRecruiter, setIsTogglingRecruiter] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [initialValues, setInitialValues] = useState(PROFILE_INITIAL_VALUES);

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
        <ProfileAccountSection
          formik={formik}
          isTogglingRecruiter={isTogglingRecruiter}
          onToggleRecruiterStatus={handleToggleRecruiterStatus}
        />

        <ProfileEditableSections
          formik={formik}
          groups={PROFILE_EDITABLE_GROUPS}
        />

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
