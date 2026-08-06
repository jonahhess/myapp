import { Link } from "react-router-dom";
import { isRecruiter as hasRecruiterRole } from "../utils/accessControl";

function Footer({
  text = "Built for Jonah's Job Board",
  user = null,
  isAuthenticated = false,
}) {
  const currentYear = new Date().getFullYear();
  const isRecruiter = hasRecruiterRole(user);

  const browseLinks = [
    { to: "/", label: "Home" },
    { to: "/jobs", label: "Search Jobs" },
    { to: "/about", label: "About" },
  ];

  const accountLinks = isAuthenticated
    ? [
        { to: "/jobs-saved", label: "Saved Jobs" },
        { to: "/profile", label: "Profile" },
      ]
    : [
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" },
      ];

  const recruiterLinks = isRecruiter
    ? [
        { to: "/jobs-my", label: "My Jobs" },
        { to: "/create/jobs", label: "Create Job" },
      ]
    : [];

  return (
    <footer className="app-footer" aria-label="Site footer">
      <div className="app-footer__grid">
        <section className="app-footer__section" aria-label="Browse links">
          <h2 className="app-footer__title">Browse</h2>
          <ul className="app-footer__list">
            {browseLinks.map((item) => (
              <li key={item.to}>
                <Link className="app-footer__link" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="app-footer__section" aria-label="Account links">
          <h2 className="app-footer__title">Account</h2>
          <ul className="app-footer__list">
            {accountLinks.map((item) => (
              <li key={item.to}>
                <Link className="app-footer__link" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {recruiterLinks.length > 0 ? (
          <section
            className="app-footer__section"
            aria-label="Recruiter shortcuts"
          >
            <h2 className="app-footer__title">Recruiter</h2>
            <ul className="app-footer__list">
              {recruiterLinks.map((item) => (
                <li key={item.to}>
                  <Link className="app-footer__link" to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          className="app-footer__section"
          aria-label="Platform information"
        >
          <h2 className="app-footer__title">Platform</h2>
          <p className="app-footer__text">
            JWT-based auth, recruiter tools, and streamlined job discovery.
          </p>
          <p className="app-footer__text">
            Need help? Visit About for support details.
          </p>
        </section>
      </div>

      <div className="app-footer__bottom">
        <small>
          {text} | © {currentYear}
        </small>
      </div>
    </footer>
  );
}

export default Footer;
