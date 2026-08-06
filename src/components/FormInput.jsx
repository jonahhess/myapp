function FormInput({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
}) {
  return (
    <div>
      {label ? <label htmlFor={id || name}>{label}</label> : null}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {touched && error ? <p>{error}</p> : null}
    </div>
  );
}

export default FormInput;
