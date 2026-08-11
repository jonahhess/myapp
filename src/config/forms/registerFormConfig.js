export const REGISTER_INITIAL_VALUES = {
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  imageUrl: "",
  imageAlt: "",
  state: "",
  country: "",
  city: "",
  street: "",
  houseNumber: "",
  zip: "",
  isRecruiter: false,
};

export const REGISTER_FIELD_GROUPS = [
  {
    legend: "Personal Details",
    fields: [
      { name: "firstName", label: "First name" },
      { name: "middleName", label: "Middle name (optional)" },
      { name: "lastName", label: "Last name" },
      {
        name: "phone",
        label: "Phone number",
        inputProps: {
          placeholder: "05X-XXXXXXX",
        },
      },
      { name: "email", label: "Email", type: "email" },
      { name: "password", label: "Password", type: "password" },
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
      {
        name: "houseNumber",
        label: "House number",
        inputProps: {
          inputMode: "numeric",
        },
      },
      {
        name: "zip",
        label: "Zip code (optional)",
        inputProps: {
          inputMode: "numeric",
        },
      },
    ],
  },
];
