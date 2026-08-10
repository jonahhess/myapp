import { Suspense, use, useState } from "react";
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

const profileResourceCache = new Map();

function resetProfileResourceCache(userId) {
  const key = String(userId || "").trim();
  if (!key) {
    return;
  }

  profileResourceCache.delete(key);
}

function readProfileResource(userId) {
  const key = String(userId || "");

  if (!key) {
    return Promise.resolve({
      initialValues: PROFILE_INITIAL_VALUES,
      loadError: "Unable to determine current user.",
    });
  }

  if (!profileResourceCache.has(key)) {
    profileResourceCache.set(
      key,
      (async () => {
        try {
          const payload = await usersService.getUserById(key);
          return {
            initialValues: mapUserToProfileValues(payload),
            loadError: "",
          };
        } catch (error) {
          return {
            initialValues: PROFILE_INITIAL_VALUES,
            loadError: getUserFriendlyErrorMessage(
              error,
              "Failed to load your profile.",
            ),
          };
        }
      })(),
    );
  }

  return profileResourceCache.get(key);
}

function ProfileContent({ user, logout, navigate }) {
  const [isTogglingRecruiter, setIsTogglingRecruiter] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { initialValues, loadError } = use(readProfileResource(user?.id));

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
        resetProfileResourceCache(user.id);
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

  if (loadError) {
    return (
      <p className="form-error" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <>
      <p className="profile-page__intro">
        Keep your profile information accurate. Email, password, and
        administrator status cannot be changed from this form.
      </p>

      {!!submitError ? (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      ) : null}
      {!!successMessage ? (
        <p className="form-success">{successMessage}</p>
      ) : null}

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
    </>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <main className="profile-page">
      <h1>Profile Settings</h1>

      <Suspense fallback={<LoadingSpinner label="Loading profile..." />}>
        <ProfileContent user={user} logout={logout} navigate={navigate} />
      </Suspense>
    </main>
  );
}

export default Profile;
