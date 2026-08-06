function SearchInput({
  id,
  value,
  onChange,
  placeholder = "Search jobs...",
  className,
}) {
  return (
    <input
      id={id}
      className={className}
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label="Search jobs"
    />
  );
}

export default SearchInput;
