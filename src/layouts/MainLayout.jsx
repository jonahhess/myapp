import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import useAuth from "../hooks/useAuth.js";
import useTheme from "../hooks/useTheme.js";
import {
  isAdmin as hasAdminRole,
  isRecruiter as hasRecruiterRole,
} from "../utils/accessControl";

function MainLayout({ children }) {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const { toggleTheme } = useTheme();

  const isAdmin = hasAdminRole(currentUser);
  const isRecruiter = hasRecruiterRole(currentUser);
  const isJobCreator = false;

  const handleSearch = () => {
    navigate("/jobs");
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <Navbar
        user={currentUser}
        isAuthenticated={isAuthenticated}
        onSearch={handleSearch}
        onThemeToggle={handleThemeToggle}
        onLogout={handleLogout}
      />
      {children({ isAuthenticated, isAdmin, isRecruiter, isJobCreator })}
      <Footer user={currentUser} isAuthenticated={isAuthenticated} />
    </>
  );
}

export default MainLayout;
