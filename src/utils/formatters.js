export function formatSalary(
  value,
  {
    locale = "en-US",
    currency = "USD",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = {},
) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

export function formatSalaryRange(min, max, options = {}) {
  const minValue = Number(min);
  const maxValue = Number(max);

  if (!Number.isFinite(minValue) && !Number.isFinite(maxValue)) {
    return "";
  }

  if (Number.isFinite(minValue) && Number.isFinite(maxValue)) {
    return `${formatSalary(minValue, options)} - ${formatSalary(maxValue, options)}`;
  }

  if (Number.isFinite(minValue)) {
    return `From ${formatSalary(minValue, options)}`;
  }

  return `Up to ${formatSalary(maxValue, options)}`;
}
