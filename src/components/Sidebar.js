import { NavLink } from "react-router-dom";
import "../styles/_sidebar.scss";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">Zetho Admin</div>
      <ul>
        <li><NavLink to="/">Dashboard</NavLink></li>
        <li><NavLink to="/reported-posts">Reported Posts</NavLink></li>
        <li><NavLink to="/reported-news">Reported News</NavLink></li>
        {/* <li><NavLink to="/reported-jobs">Reported Jobs</NavLink></li> */}
        <li><NavLink to="/reported-groups">Reported Groups</NavLink></li>
        {/* <li><NavLink to="/reported-users">Reported Users</NavLink></li> */}
        <li><NavLink to="/help-support">Help & Support</NavLink></li>
        <li><NavLink to="/main-group">Main Group</NavLink></li>
      </ul>
    </div>
  );
};

export default Sidebar;
