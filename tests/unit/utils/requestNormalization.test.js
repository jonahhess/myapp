import {
  normalizeLoginPayload,
  normalizeRegisterPayload,
  normalizeUserProfileUpdatePayload,
} from "../../../src/utils/requestNormalization";

describe("requestNormalization", () => {
  it("normalizes login payload by trimming email", () => {
    const payload = normalizeLoginPayload({
      email: "  user@example.com ",
      password: "secret123",
    });

    expect(payload).toEqual({
      email: "user@example.com",
      password: "secret123",
    });
  });

  it("normalizes register payload into backend shape", () => {
    const payload = normalizeRegisterPayload({
      firstName: "  Jane ",
      middleName: " ",
      lastName: " Doe  ",
      phone: "050-123-4567",
      email: "  jane@example.com ",
      password: "12345678",
      imageUrl: " https://cdn.example.com/pic.jpg ",
      imageAlt: " Jane profile  ",
      country: " Israel ",
      city: " Tel Aviv ",
      street: " Dizengoff ",
      houseNumber: "7",
      district: " ",
      postalCode: "61000",
      isRecruiter: true,
    });

    expect(payload).toEqual({
      name: {
        first: "Jane",
        middle: undefined,
        last: "Doe",
      },
      phone: "0501234567",
      email: "jane@example.com",
      password: "12345678",
      image: {
        url: "https://cdn.example.com/pic.jpg",
        alt: "Jane profile",
      },
      address: {
        country: "Israel",
        city: "Tel Aviv",
        street: "Dizengoff",
        houseNumber: 7,
        district: undefined,
        postalCode: 61000,
      },
      isRecruiter: true,
    });
  });

  it("normalizes profile update payload and excludes role/email/password fields", () => {
    const payload = normalizeUserProfileUpdatePayload({
      firstName: "John",
      middleName: "Q",
      lastName: "Public",
      phone: "972-50-111-2222",
      imageUrl: "",
      imageAlt: "",
      country: "Israel",
      city: "Haifa",
      street: "Herzl",
      houseNumber: "5",
      district: "North",
      postalCode: "35000",
      isAdmin: true,
      email: "should-not-be-used@example.com",
      password: "ignored",
    });

    expect(payload).toEqual({
      name: {
        first: "John",
        middle: "Q",
        last: "Public",
      },
      phone: "972501112222",
      image: {
        url: "",
        alt: "",
      },
      address: {
        country: "Israel",
        city: "Haifa",
        street: "Herzl",
        houseNumber: 5,
        district: "North",
        postalCode: 35000,
      },
    });
    expect(payload).not.toHaveProperty("email");
    expect(payload).not.toHaveProperty("password");
    expect(payload).not.toHaveProperty("isAdmin");
    expect(payload).not.toHaveProperty("isRecruiter");
  });
});
