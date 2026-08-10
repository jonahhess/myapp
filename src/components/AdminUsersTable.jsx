import { formatDate } from "../utils/adminUsersUtils.js";

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
                <span className={`badge${entry.isRecruiter ? " on" : ""}`}>
                  {entry.isRecruiter ? "Yes" : "No"}
                </span>
              </td>
              <td>
                <span className={`badge${entry.isAdmin ? " on" : ""}`}>
                  {entry.isAdmin ? "Yes" : "No"}
                </span>
              </td>
              <td>
                {entry.isAdmin ? (
                  <span className="muted">Protected</span>
                ) : (
                  <button
                    type="button"
                    className="delete"
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
