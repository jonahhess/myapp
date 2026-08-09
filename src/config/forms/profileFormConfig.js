export const PROFILE_INITIAL_VALUES = {
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  email: "",
  imageUrl: "",
  imageAlt: "",
  country: "",
  city: "",
  street: "",
  houseNumber: "",
  district: "",
  postalCode: "",
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
      { name: "country", label: "Country" },
      { name: "city", label: "City" },
      { name: "street", label: "Street" },
      { name: "houseNumber", label: "House number" },
      { name: "district", label: "District (optional)" },
      { name: "postalCode", label: "Postal code (optional)" },
    ],
  },
];

export function mapUserToProfileValues(payload = {}) {
  const user = payload?.user || payload?.data?.user || payload;

  return {
    firstName: user?.name?.first || user?.firstName || user?.first_name || "",
    middleName:
      user?.name?.middle || user?.middleName || user?.middle_name || "",
    lastName: user?.name?.last || user?.lastName || user?.last_name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    imageUrl: user?.image?.url || user?.imageUrl || user?.image_url || "",
    imageAlt: user?.image?.alt || user?.imageAlt || user?.image_alt || "",
    country: user?.address?.country || "",
    city: user?.address?.city || "",
    street: user?.address?.street || "",
    houseNumber:
      user?.address?.houseNumber === null ||
      user?.address?.houseNumber === undefined
        ? ""
        : String(user.address.houseNumber),
    district: user?.address?.district || "",
    postalCode:
      user?.address?.postalCode === null ||
      user?.address?.postalCode === undefined
        ? ""
        : String(user.address.postalCode),
    isAdmin: Boolean(user?.isAdmin),
    isRecruiter: Boolean(user?.isRecruiter),
  };
}
