import { useEffect } from "react";
import { apiService } from "../services/apiService";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    apiService.logout();
    localStorage.removeItem("adminToken");
    navigate("/login");
  }, [navigate]);

  return <p>Logging out...</p>;
}

export default Logout;
