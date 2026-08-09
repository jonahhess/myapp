import FormInput from "./FormInput.jsx";

function ProfileEditableSections({ formik, groups }) {
  return groups.map((group) => (
    <fieldset key={group.legend} className="profile-form__group">
      <legend>{group.legend}</legend>
      <div className="profile-form__grid">
        {group.fields.map((field) => (
          <FormInput
            key={field.name}
            formik={formik}
            name={field.name}
            label={field.label}
            prefix="profile"
            type={field.type}
            inputProps={field.inputProps}
          />
        ))}
      </div>
    </fieldset>
  ));
}

export default ProfileEditableSections;
