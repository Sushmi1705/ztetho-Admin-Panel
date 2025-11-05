import { useNavigate } from "react-router-dom";
import "./../styles/_layout.scss";

const Topbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout(); // Update App state
    navigate("/login"); // Navigate to login page
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">Admin Panel</h2>
        <span className="topbar-subtitle">Manage your platform</span>
      </div>

      <div className="topbar-right">
        <div className="user-profile">
          <div className="avatar">
            <span>AD</span>
          </div>
          <div className="user-info">
            <div className="user-name">Admin User</div>
            <div className="user-role">Super Admin</div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span> Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;
