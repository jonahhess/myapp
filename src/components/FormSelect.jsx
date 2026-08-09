function FormSelect({
  formik,
  name,
  label,
  options = [],
  placeholder = "Select",
  id,
  prefix = "",
  wrapperClassName = "",
  errorClassName = "form-error",
  invalidClassName = "form-input--invalid",
}) {
  const resolvedId = id || `${prefix ? `${prefix}-` : ""}${name}`;
  const errorId = `${prefix ? `${prefix}-` : ""}${name}-error`;
  const showError = Boolean(
    (formik?.touched?.[name] || formik?.submitCount > 0) &&
    formik?.errors?.[name],
  );

  return (
    <label htmlFor={resolvedId} className={wrapperClassName || undefined}>
      {label}
      <select
        id={resolvedId}
        name={name}
        className={showError ? invalidClassName : ""}
        aria-invalid={showError}
        aria-describedby={showError ? errorId : undefined}
        value={formik.values?.[name] ?? ""}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {showError ? (
        <span id={errorId} className={errorClassName} role="alert">
          {formik.errors[name]}
        </span>
      ) : null}
    </label>
  );
}

export default FormSelect;
