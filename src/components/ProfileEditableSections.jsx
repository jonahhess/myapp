import FormInput from "./FormInput.jsx";

function ProfileEditableSections({ formik, groups }) {
  return groups.map((group) => (
    <fieldset key={group.legend} className="group">
      <legend>{group.legend}</legend>
      <div className="grid">
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
