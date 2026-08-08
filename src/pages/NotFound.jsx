import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="not-found-page">
      <h1>Page Not Found</h1>
      <p className="not-found-page__text">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link className="not-found-page__home-link" to="/">
        Return to Home
      </Link>
    </main>
  );
}

export default NotFound;
