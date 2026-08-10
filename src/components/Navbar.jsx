import { NavLink } from "react-router-dom";
import { getNavigationItems } from "../utils/navigation";

function Navbar({
  title = "Jonah's Job Board",
  user = null,
  isAuthenticated = false,
  onSearch,
  onThemeToggle,
  onLogout,
}) {
  const items = getNavigationItems(user, isAuthenticated);
  const authItem = items.find(
    (item) => item.key === "login" || item.key === "logout",
  );
  const primaryItems = items.filter((item) => item !== authItem);
  const authClassName = authItem
    ? authItem.key === "login"
      ? "login"
      : "logout"
    : "";

  const actionHandlers = {
    search: onSearch,
    theme: onThemeToggle,
    logout: onLogout,
  };

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <h1 className="brand">{title}</h1>
      <div className="menu">
        <ul className="links">
          {primaryItems.map((item) => (
            <li key={item.key}>
              {item.type === "route" ? (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `link${isActive ? " active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <button
                  type="button"
                  className="link button"
                  onClick={actionHandlers[item.action]}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        {authItem ? (
          <div className="auth">
            {authItem.type === "route" ? (
              <NavLink
                to={authItem.to}
                className={({ isActive }) =>
                  `link auth ${authClassName}${isActive ? " active" : ""}`
                }
              >
                {authItem.label}
              </NavLink>
            ) : (
              <button
                type="button"
                className={`link button auth ${authClassName}`}
                onClick={actionHandlers[authItem.action]}
              >
                {authItem.label}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export default Navbar;
