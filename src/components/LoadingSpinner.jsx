function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div role="status" aria-live="polite">
      {label}
    </div>
  );
}

export default LoadingSpinner;
