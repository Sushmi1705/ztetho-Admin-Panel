import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ReportedPosts from "./pages/ReportedPosts";
import ReportedNews from "./pages/ReportedNews";
import ReportedJobs from "./pages/ReportedJobs";
import ReportedGroups from "./pages/ReportedGroups";
import ReportedUsers from "./pages/ReportedUsers";
import HelpSupport from "./pages/HelpSupport";
import MainGroups from "./pages/mainGroup";
import News from "./pages/News";
import Notification from "./pages/Notification";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage token on initial render
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {isAuthenticated ? (
        <div className="layout">
          <Sidebar />
          <div className="main-content">
            <Topbar onLogout={handleLogout} />
            <div className="content-area">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/reported-posts" element={<ReportedPosts />} />
                <Route path="/reported-news" element={<ReportedNews />} />
                <Route path="/reported-jobs" element={<ReportedJobs />} />
                <Route path="/reported-groups" element={<ReportedGroups />} />
                <Route path="/reported-users" element={<ReportedUsers />} />
                <Route path="/help-support" element={<HelpSupport />} />
                <Route path="/main-group" element={<MainGroups />} />
                <Route path="/news" element={<News />} />
                <Route path="/notification" element={<Notification />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;