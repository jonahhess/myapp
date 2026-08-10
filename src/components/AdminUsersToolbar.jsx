function AdminUsersToolbar({ query, onQueryChange }) {
  return (
    <div className="admin-page__toolbar">
      <label htmlFor="admin-user-search" className="admin-page__search-label">
        Search users
      </label>
      <input
        id="admin-user-search"
        className="admin-page__search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by name, email, or phone"
      />
    </div>
  );
}

export default AdminUsersToolbar;
