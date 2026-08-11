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
        { to: "/my-jobs", label: "My Jobs" },
        { to: "/create/jobs", label: "Create Job" },
      ]
    : [];

  return (
    <footer className="app-footer" aria-label="Site footer">
      <div className="grid">
        <section className="section" aria-label="Browse links">
          <h2 className="title">Browse</h2>
          <ul className="list">
            {browseLinks.map((item) => (
              <li key={item.to}>
                <Link className="link" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="section" aria-label="Account links">
          <h2 className="title">Account</h2>
          <ul className="list">
            {accountLinks.map((item) => (
              <li key={item.to}>
                <Link className="link" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {recruiterLinks.length > 0 && (
          <section className="section" aria-label="Recruiter shortcuts">
            <h2 className="title">Recruiter</h2>
            <ul className="list">
              {recruiterLinks.map((item) => (
                <li key={item.to}>
                  <Link className="link" to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="section" aria-label="Platform information">
          <h2 className="title">Platform</h2>
          <p className="text">
            JWT-based auth, recruiter tools, and streamlined job discovery.
          </p>
          <p className="text">Need help? Visit About for support details.</p>
        </section>
      </div>

      <div className="bottom">
        <small>
          {text} | © {currentYear}
        </small>
      </div>
    </footer>
  );
}

export default Footer;
