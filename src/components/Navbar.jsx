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

  const actionHandlers = {
    search: onSearch,
    theme: onThemeToggle,
    logout: onLogout,
  };

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <h1 className="app-nav__brand">{title}</h1>
      <ul className="app-nav__list">
        {items.map((item) => (
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
    </nav>
  );
}

export default Navbar;
