import { isAdmin, isRecruiter } from "./accessControl";

const NAV_ITEMS = {
  login: { key: "login", label: "Login", type: "route", to: "/login" },
  register: {
    key: "register",
    label: "Register",
    type: "route",
    to: "/register",
  },
  about: { key: "about", label: "About", type: "route", to: "/about" },
  home: { key: "home", label: "Home", type: "route", to: "/" },
  savedJobs: {
    key: "savedJobs",
    label: "Saved Jobs",
    type: "route",
    to: "/jobs-saved",
  },
  myJobs: { key: "myJobs", label: "My Jobs", type: "route", to: "/my-jobs" },
  createJob: {
    key: "createJob",
    label: "Create Job",
    type: "route",
    to: "/create/jobs",
  },
  admin: { key: "admin", label: "Admin", type: "route", to: "/admin" },
  search: { key: "search", label: "Search", type: "action", action: "search" },
  theme: { key: "theme", label: "Theme", type: "action", action: "theme" },
  logout: { key: "logout", label: "Logout", type: "action", action: "logout" },
};

const NAV_ORDER = {
  guest: ["login", "register", "about", "home", "search", "theme"],
  registered: ["logout", "savedJobs", "about", "home", "search", "theme"],
  recruiter: [
    "home",
    "about",
    "savedJobs",
    "myJobs",
    "createJob",
    "logout",
    "search",
    "theme",
  ],
  admin: ["search", "home", "about", "savedJobs", "admin", "logout", "theme"],
};

export function getUserNavigationTier(user, isAuthenticated) {
  if (!isAuthenticated) {
    return "guest";
  }

  if (isAdmin(user)) {
    return "admin";
  }

  if (isRecruiter(user)) {
    return "recruiter";
  }

  return "registered";
}

export function getNavigationItems(user, isAuthenticated) {
  const tier = getUserNavigationTier(user, isAuthenticated);
  return NAV_ORDER[tier].map((key) => NAV_ITEMS[key]);
}
