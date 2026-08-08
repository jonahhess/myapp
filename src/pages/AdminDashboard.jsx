import { useEffect, useMemo, useState } from "react";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Pagination from "../components/Pagination.jsx";
import usersService from "../services/usersService";
import { getUserFriendlyErrorMessage } from "../utils/errors";

const USERS_PER_PAGE = 8;

function readUsersPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.users)) {
    return payload.users;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data?.users)) {
    return payload.data.users;
  }

  return [];
}

function normalizeUserRow(user = {}) {
  const fullName = [
    user?.name?.first || user?.firstName || user?.first_name || "",
    user?.name?.middle || user?.middleName || user?.middle_name || "",
    user?.name?.last || user?.lastName || user?.last_name || "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const role = String(user?.role || "").toLowerCase();

  return {
    id: user?.id || user?._id || "",
    fullName: fullName || "Unknown user",
    email: user?.email || "",
    phone: user?.phone || "",
    createdAt: user?.createdAt || user?.created_at || null,
    isRecruiter: Boolean(user?.isRecruiter) || role === "recruiter",
    isAdmin: Boolean(user?.isAdmin) || role === "admin",
  };
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const payload = await usersService.getUsers();
        const nextUsers = readUsersPayload(payload).map(normalizeUserRow);
        if (isMounted) {
          setUsers(nextUsers);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getUserFriendlyErrorMessage(error, "Failed to load users."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return users;
    }

    return users.filter((item) => {
      const fullName = item.fullName.toLowerCase();
      const email = item.email.toLowerCase();
      const phone = String(item.phone || "").toLowerCase();

      return (
        fullName.includes(normalizedQuery) ||
        email.includes(normalizedQuery) ||
        phone.includes(normalizedQuery)
      );
    });
  }, [query, users]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * USERS_PER_PAGE;
  const pageUsers = filteredUsers.slice(pageStart, pageStart + USERS_PER_PAGE);

  const handleDeleteRequest = (targetUser) => {
    if (!targetUser || targetUser.isAdmin || isDeletingUser) {
      return;
    }

    setPendingDeleteUser(targetUser);
  };

  const handleDeleteCancel = () => {
    if (isDeletingUser) {
      return;
    }

    setPendingDeleteUser(null);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteUser?.id || isDeletingUser) {
      return;
    }

    setIsDeletingUser(true);
    setErrorMessage("");

    try {
      await usersService.deleteUserById(pendingDeleteUser.id);
      setUsers((prevUsers) =>
        prevUsers.filter((entry) => entry.id !== pendingDeleteUser.id),
      );
      setSuccessMessage(`Deleted ${pendingDeleteUser.fullName} successfully.`);
      setPendingDeleteUser(null);
    } catch (error) {
      setErrorMessage(
        getUserFriendlyErrorMessage(error, "Failed to delete user."),
      );
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <main className="admin-page">
      <h1>Admin Management</h1>
      <p className="admin-page__intro">
        Manage users, monitor account types, and moderate platform access.
      </p>

      <div className="admin-page__toolbar">
        <label htmlFor="admin-user-search" className="admin-page__search-label">
          Search users
        </label>
        <input
          id="admin-user-search"
          className="admin-page__search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by name, email, or phone"
        />
      </div>

      {errorMessage ? (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? <p className="form-success">{successMessage}</p> : null}

      {isLoading ? <LoadingSpinner label="Loading users..." /> : null}

      {!isLoading && filteredUsers.length === 0 ? (
        <EmptyState
          title={query ? "No users match your search" : "No users found"}
          description={
            query
              ? "Try a different search query."
              : "No users are available to manage right now."
          }
        />
      ) : null}

      {!isLoading && filteredUsers.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
                <th>Recruiter</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map((entry) => (
                <tr key={entry.id || `${entry.email}-${entry.fullName}`}>
                  <td>{entry.fullName}</td>
                  <td>{entry.email || "-"}</td>
                  <td>{entry.phone || "-"}</td>
                  <td>{formatDate(entry.createdAt)}</td>
                  <td>
                    <span
                      className={`admin-badge ${entry.isRecruiter ? "admin-badge--on" : ""}`}
                    >
                      {entry.isRecruiter ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${entry.isAdmin ? "admin-badge--on" : ""}`}
                    >
                      {entry.isAdmin ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    {entry.isAdmin ? (
                      <span className="admin-table__muted">Protected</span>
                    ) : (
                      <button
                        type="button"
                        className="admin-table__delete"
                        onClick={() => handleDeleteRequest(entry)}
                        disabled={isDeletingUser}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!isLoading && filteredUsers.length > USERS_PER_PAGE ? (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}

      <ConfirmationModal
        isOpen={Boolean(pendingDeleteUser)}
        title="Delete user account?"
        message={`This action will permanently delete ${pendingDeleteUser?.fullName || "this user"}. This cannot be undone.`}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        cancelLabel="Cancel"
        confirmLabel={isDeletingUser ? "Deleting..." : "Delete permanently"}
        confirmDisabled={isDeletingUser}
        cancelDisabled={isDeletingUser}
      />
    </main>
  );
}

export default AdminDashboard;
