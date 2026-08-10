import ConfirmationModal from "../components/ConfirmationModal.jsx";
import AdminUsersTable from "../components/admin/AdminUsersTable.jsx";
import AdminUsersToolbar from "../components/admin/AdminUsersToolbar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Pagination from "../components/Pagination.jsx";
import { USERS_PER_PAGE } from "./adminDashboard/adminUsersUtils";
import useAdminUsers from "./adminDashboard/useAdminUsers";

function AdminDashboard() {
  const {
    query,
    isLoading,
    isDeletingUser,
    pendingDeleteUser,
    errorMessage,
    successMessage,
    filteredUsersCount,
    pageUsers,
    totalPages,
    safeCurrentPage,
    setCurrentPage,
    handleQueryChange,
    handleDeleteRequest,
    handleDeleteCancel,
    handleDeleteConfirm,
  } = useAdminUsers();

  return (
    <main className="admin-page">
      <h1>Admin Management</h1>
      <p className="admin-page__intro">
        Manage users, monitor account types, and moderate platform access.
      </p>

      <AdminUsersToolbar query={query} onQueryChange={handleQueryChange} />

      {!!errorMessage ? (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {!!successMessage ? (
        <p className="form-success">{successMessage}</p>
      ) : null}

      {isLoading ? <LoadingSpinner label="Loading users..." /> : null}

      {!isLoading && filteredUsersCount === 0 && (
        <EmptyState
          title={query ? "No users match your search" : "No users found"}
          description={
            query
              ? "Try a different search query."
              : "No users are available to manage right now."
          }
        />
      )}

      {!isLoading && filteredUsersCount > 0 && (
        <AdminUsersTable
          pageUsers={pageUsers}
          isDeletingUser={isDeletingUser}
          onDeleteRequest={handleDeleteRequest}
        />
      )}

      {!isLoading && filteredUsersCount > USERS_PER_PAGE && (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

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
