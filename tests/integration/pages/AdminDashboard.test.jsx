import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "../../../src/pages/AdminDashboard";

const usersServiceMocks = vi.hoisted(() => ({
  getUsers: vi.fn(),
  deleteUserById: vi.fn(),
}));

vi.mock("../../../src/services/usersService", () => ({
  default: {
    getUsers: usersServiceMocks.getUsers,
    deleteUserById: usersServiceMocks.deleteUserById,
  },
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads users, protects admin delete action, and keeps delete for non-admin users", async () => {
    usersServiceMocks.getUsers.mockResolvedValueOnce([
      {
        id: "admin-1",
        name: { first: "Alice", last: "Admin" },
        email: "alice@corp.com",
        phone: "0501111111",
        createdAt: "2026-07-01T00:00:00.000Z",
        isAdmin: true,
        isRecruiter: true,
      },
      {
        id: "user-1",
        name: { first: "Bob", last: "User" },
        email: "bob@corp.com",
        phone: "0502222222",
        createdAt: "2026-07-02T00:00:00.000Z",
        isAdmin: false,
        isRecruiter: false,
      },
    ]);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(usersServiceMocks.getUsers).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText("Bob User")).toBeInTheDocument();
    expect(screen.getByText("Protected")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(1);
  });

  it("filters users by search query", async () => {
    const user = userEvent.setup();

    usersServiceMocks.getUsers.mockResolvedValueOnce([
      {
        id: "u-1",
        name: { first: "Dana", last: "Tester" },
        email: "dana@example.com",
        phone: "0503333333",
      },
      {
        id: "u-2",
        name: { first: "Eli", last: "Reviewer" },
        email: "eli@example.com",
        phone: "0504444444",
      },
    ]);

    render(<AdminDashboard />);

    await screen.findByText("Dana Tester");

    const searchInput = screen.getByLabelText("Search users");
    await user.type(searchInput, "eli");

    expect(screen.queryByText("Dana Tester")).not.toBeInTheDocument();
    const row = screen.getByRole("row", { name: /eli reviewer/i });
    expect(within(row).getByText("eli@example.com")).toBeInTheDocument();
  });

  it("opens confirmation modal and deletes a non-admin user after confirm", async () => {
    const user = userEvent.setup();

    usersServiceMocks.getUsers.mockResolvedValueOnce([
      {
        id: "admin-1",
        name: { first: "Root", last: "Admin" },
        email: "root@example.com",
        isAdmin: true,
      },
      {
        id: "u-9",
        name: { first: "Noa", last: "Candidate" },
        email: "noa@example.com",
        isAdmin: false,
      },
    ]);
    usersServiceMocks.deleteUserById.mockResolvedValueOnce({ success: true });

    render(<AdminDashboard />);

    await screen.findByText("Noa Candidate");

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      screen.getByRole("dialog", { name: "Delete user account?" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Delete permanently" }),
    );

    await waitFor(() => {
      expect(usersServiceMocks.deleteUserById).toHaveBeenCalledWith("u-9");
    });

    expect(screen.queryByText("Noa Candidate")).not.toBeInTheDocument();
    expect(screen.getByText("Root Admin")).toBeInTheDocument();
  });
});
