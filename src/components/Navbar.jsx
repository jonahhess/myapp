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
      ? "app-nav__link--auth-login"
      : "app-nav__link--auth-logout"
    : "";

  const actionHandlers = {
    search: onSearch,
    theme: onThemeToggle,
    logout: onLogout,
  };

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <h1 className="app-nav__brand">{title}</h1>
      <div className="app-nav__menu">
        <ul className="app-nav__list">
          {primaryItems.map((item) => (
            <li key={item.key} className="app-nav__item">
              {item.type === "route" ? (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `app-nav__link${isActive ? " app-nav__link--active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <button
                  type="button"
                  className="app-nav__link app-nav__button"
                  onClick={actionHandlers[item.action]}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        {authItem ? (
          <div className="app-nav__auth">
            {authItem.type === "route" ? (
              <NavLink
                to={authItem.to}
                className={({ isActive }) =>
                  `app-nav__link app-nav__link--auth ${authClassName}${isActive ? " app-nav__link--active" : ""}`
                }
              >
                {authItem.label}
              </NavLink>
            ) : (
              <button
                type="button"
                className={`app-nav__link app-nav__button app-nav__link--auth ${authClassName}`}
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
