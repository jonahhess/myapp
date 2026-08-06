import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import {
  isAdmin as hasAdminRole,
  isRecruiter as hasRecruiterRole,
} from "../utils/accessControl";
import About from "../pages/About.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import CreateJob from "../pages/CreateJob.jsx";
import EditJob from "../pages/EditJob.jsx";
import Home from "../pages/Home.jsx";
import JobsSearch from "../pages/JobsSearch.jsx";
import JobDetails from "../pages/JobDetails.jsx";
import Login from "../pages/Login.jsx";
import MyJobs from "../pages/MyJobs.jsx";
import NotFound from "../pages/NotFound.jsx";
import Profile from "../pages/Profile.jsx";
import Register from "../pages/Register.jsx";
import SavedJobs from "../pages/SavedJobs.jsx";

function AppShell() {
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobsSearch />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/about" element={<About />} />

        <Route
          element={
            <ProtectedRoute isAllowed={!isAuthenticated} redirectTo="/" />
          }
        >
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          element={
            <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/login" />
          }
        >
          <Route path="/jobs-saved" element={<SavedJobs />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={isAuthenticated && isRecruiter}
              redirectTo="/"
            />
          }
        >
          <Route path="/jobs-my" element={<MyJobs />} />
          <Route path="/create/jobs" element={<CreateJob />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={
                isAuthenticated && (isAdmin || isRecruiter || isJobCreator)
              }
              redirectTo="/"
            />
          }
        >
          <Route path="/jobs/:id/edit" element={<EditJob />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={isAuthenticated && isAdmin}
              redirectTo="/"
            />
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer user={currentUser} isAuthenticated={isAuthenticated} />
    </>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default AppRoutes;
