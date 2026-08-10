function AdminUsersToolbar({ query, onQueryChange }) {
  return (
    <div className="admin-toolbar">
      <label htmlFor="admin-user-search" className="search-label">
        Search users
      </label>
      <input
        id="admin-user-search"
        className="search-input"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by name, email, or phone"
      />
    </div>
  );
}

export default AdminUsersToolbar;
