import usersService from "../../../src/services/usersService";

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
  setAuthToken: vi.fn(),
}));

vi.mock("../../../src/services/apiClient", () => ({
  default: {
    post: mocks.post,
    get: mocks.get,
    put: mocks.put,
    patch: mocks.patch,
    delete: mocks.del,
  },
  setAuthToken: mocks.setAuthToken,
}));

describe("usersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves token on login when token is returned", async () => {
    mocks.post.mockResolvedValueOnce({
      data: {
        token: "jwt-token",
      },
    });

    const result = await usersService.login({
      email: "user@example.com",
      password: "secret",
    });

    expect(mocks.post).toHaveBeenCalledWith("/users/login", {
      email: "user@example.com",
      password: "secret",
    });
    expect(mocks.setAuthToken).toHaveBeenCalledWith("jwt-token");
    expect(result).toEqual({ token: "jwt-token" });
  });

  it("supports nested token response shape on login", async () => {
    mocks.post.mockResolvedValueOnce({
      data: {
        data: {
          token: "nested-token",
        },
      },
    });

    await usersService.login({ email: "a@b.com", password: "pw" });

    expect(mocks.setAuthToken).toHaveBeenCalledWith("nested-token");
  });

  it("does not set token when login response has no token", async () => {
    mocks.post.mockResolvedValueOnce({
      data: {
        message: "ok",
      },
    });

    await usersService.login({ email: "a@b.com", password: "pw" });

    expect(mocks.setAuthToken).not.toHaveBeenCalled();
  });

  it("calls CRUD endpoints with expected methods and paths", async () => {
    mocks.get.mockResolvedValue({ data: { ok: true } });
    mocks.put.mockResolvedValue({ data: { ok: true } });
    mocks.patch.mockResolvedValue({ data: { ok: true } });
    mocks.del.mockResolvedValue({ data: { ok: true } });

    await usersService.getUserById("123");
    await usersService.updateUserById("123", { firstName: "Jane" });
    await usersService.toggleRecruiterStatus("123");
    await usersService.getUsers();
    await usersService.deleteUserById("123");

    expect(mocks.get).toHaveBeenNthCalledWith(1, "/users/123");
    expect(mocks.put).toHaveBeenCalledWith("/users/123", { firstName: "Jane" });
    expect(mocks.patch).toHaveBeenCalledWith("/users/123");
    expect(mocks.get).toHaveBeenNthCalledWith(2, "/users");
    expect(mocks.del).toHaveBeenCalledWith("/users/123");
  });

  it("clears token on logout", async () => {
    const result = await usersService.logout();

    expect(mocks.setAuthToken).toHaveBeenCalledWith(null);
    expect(result).toEqual({ success: true });
  });
});
