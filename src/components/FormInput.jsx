function hasFormikFieldError(formik, name) {
  return Boolean(
    (formik?.touched?.[name] || formik?.submitCount > 0) &&
    formik?.errors?.[name],
  );
}

function FormInput({
  formik,
  name,
  label,
  id,
  prefix = "",
  type = "text",
  inputProps,
  wrapperClassName = "",
  errorClassName = "form-error",
  invalidClassName = "invalid",
}) {
  const resolvedId = id || `${prefix ? `${prefix}-` : ""}${name}`;
  const errorId = `${prefix ? `${prefix}-` : ""}${name}-error`;
  const showError = hasFormikFieldError(formik, name);

  return (
    <label htmlFor={resolvedId} className={wrapperClassName || undefined}>
      {label}
      <input
        {...inputProps}
        id={resolvedId}
        name={name}
        type={type}
        className={showError ? invalidClassName : ""}
        aria-invalid={showError}
        aria-describedby={showError ? errorId : undefined}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values?.[name] ?? ""}
      />
      {!!showError && (
        <span id={errorId} className={errorClassName} role="alert">
          {formik.errors[name]}
        </span>
      )}
    </label>
  );
}

export default FormInput;
