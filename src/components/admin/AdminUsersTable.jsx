import { formatDate } from "../../pages/adminDashboard/adminUsersUtils";

function AdminUsersTable({ pageUsers, isDeletingUser, onDeleteRequest }) {
  return (
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
                    onClick={() => onDeleteRequest(entry)}
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
  );
}

export default AdminUsersTable;
