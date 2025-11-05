import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import "../styles/_dashboard.scss";

function ReportedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiService.getReported("users");
        setUsers(data || []);
      } catch (err) {
        setError("Failed to load reported users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <p>Loading reported users...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="reported-container">
      <h2>Reported Users</h2>
      {users.length === 0 ? (
        <p>No reported users found</p>
      ) : (
        <table className="reported-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Reported By</th>
              <th>Reason</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td>{u.userId}</td>
                <td>{u.username}</td>
                <td>{u.reportedBy}</td>
                <td>{u.reason}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReportedUsers;
