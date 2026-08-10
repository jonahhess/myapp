import ConfirmationModal from "../components/ConfirmationModal.jsx";
import CollectionPagination from "../components/CollectionPagination.jsx";
import CollectionStateSwitch from "../components/CollectionStateSwitch.jsx";
import AdminUsersTable from "../components/AdminUsersTable.jsx";
import AdminUsersToolbar from "../components/AdminUsersToolbar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { USERS_PER_PAGE } from "../utils/adminUsersUtils.js";
import useAdminUsers from "../hooks/useAdminUsers.js";

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

      {errorMessage ? (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? <p className="form-success">{successMessage}</p> : null}

      <CollectionStateSwitch
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={filteredUsersCount === 0}
        loadingLabel="Loading users..."
        errorFallback={
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        }
        emptyState={
          <EmptyState
            title={query ? "No users match your search" : "No users found"}
            description={
              query
                ? "Try a different search query."
                : "No users are available to manage right now."
            }
          />
        }
      >
        <AdminUsersTable
          pageUsers={pageUsers}
          isDeletingUser={isDeletingUser}
          onDeleteRequest={handleDeleteRequest}
        />
      </CollectionStateSwitch>

      <CollectionPagination
        isLoading={isLoading}
        totalCount={filteredUsersCount}
        pageSize={USERS_PER_PAGE}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

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
