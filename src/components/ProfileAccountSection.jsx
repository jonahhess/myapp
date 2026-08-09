function ProfileAccountSection({
  formik,
  isTogglingRecruiter,
  onToggleRecruiterStatus,
}) {
  return (
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
            value={formik.values.isRecruiter ? "Recruiter" : "Not recruiter"}
            readOnly
            disabled
            className="profile-form__readonly"
          />
        </label>
      </div>

      <button
        type="button"
        className="profile-form__toggle"
        onClick={onToggleRecruiterStatus}
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
  );
}

export default ProfileAccountSection;
