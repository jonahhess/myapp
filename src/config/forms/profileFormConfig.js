export const PROFILE_INITIAL_VALUES = {
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  email: "",
  imageUrl: "",
  imageAlt: "",
  state: "",
  country: "",
  city: "",
  street: "",
  houseNumber: "",
  zip: "",
  isAdmin: false,
  isRecruiter: false,
};

export const PROFILE_EDITABLE_GROUPS = [
  {
    legend: "Personal Details",
    fields: [
      { name: "firstName", label: "First name" },
      { name: "middleName", label: "Middle name (optional)" },
      { name: "lastName", label: "Last name" },
      { name: "phone", label: "Phone number" },
    ],
  },
  {
    legend: "Image",
    fields: [
      { name: "imageUrl", label: "Image URL (optional)" },
      { name: "imageAlt", label: "Image alt text" },
    ],
  },
  {
    legend: "Address",
    fields: [
      { name: "state", label: "State" },
      { name: "country", label: "Country" },
      { name: "city", label: "City" },
      { name: "street", label: "Street" },
      { name: "houseNumber", label: "House number" },
      { name: "zip", label: "Zip Code (optional)" },
    ],
  },
];

export function mapUserToProfileValues(payload = {}) {
  const user = payload;

  return {
    firstName: user?.name?.first || "",
    middleName: user?.name?.middle || "",
    lastName: user?.name?.last || "",
    phone: user?.phone || "",
    email: user?.email || "",
    imageUrl: user?.image?.url || "",
    imageAlt: user?.image?.alt || "",
    state: user?.address?.state || "",
    country: user?.address?.country || "",
    city: user?.address?.city || "",
    street: user?.address?.street || "",
    houseNumber:
      user?.address?.houseNumber === null ||
      user?.address?.houseNumber === undefined
        ? ""
        : String(user.address.houseNumber),
    zip:
      user?.address?.zip === null || user?.address?.zip === undefined
        ? ""
        : String(user.address.zip),
    isAdmin: Boolean(user?.isAdmin),
    isRecruiter: Boolean(user?.isRecruiter),
  };
}
