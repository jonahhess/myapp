import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
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
  return (
    <MainLayout>
      {({ isAuthenticated, isAdmin, isRecruiter, isJobCreator }) => (
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
            <Route path="/my-jobs" element={<MyJobs />} />
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
      )}
    </MainLayout>
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
