function About() {
  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <p className="eyebrow">About Jonah's Job Board</p>
        <h1 id="about-title">Built for Better Hiring Conversations</h1>
        <p className="lead">
          Jonah's Job Board helps candidates discover meaningful roles,
          recruiters publish high-quality opportunities, and administrators keep
          the marketplace clear, safe, and trustworthy.
        </p>
      </section>

      <section className="about-grid" aria-label="Role-based experience">
        <article className="about-card">
          <h2>Candidates</h2>
          <p>
            Search jobs, save opportunities, and compare openings without noise.
          </p>
        </article>
        <article className="about-card">
          <h2>Recruiters</h2>
          <p>
            Create and manage listings quickly, then keep each role current as
            hiring needs evolve.
          </p>
        </article>
        <article className="about-card">
          <h2>Admins</h2>
          <p>
            Protect quality standards across content and maintain platform
            consistency.
          </p>
        </article>
      </section>

      <section
        className="about-principles"
        aria-labelledby="about-principles-title"
      >
        <h2 id="about-principles-title">How We Design the Experience</h2>
        <ul>
          <li>
            Clarity first: straightforward flows and role-appropriate tools.
          </li>
          <li>
            Trust by default: predictable behavior and transparent actions.
          </li>
          <li>
            Focused outcomes: less friction from job post to successful match.
          </li>
        </ul>
      </section>

      <section className="about-cta" aria-label="Closing statement">
        <p>
          Whether you are applying, hiring, or moderating, the goal stays the
          same: make hiring faster, clearer, and more human.
        </p>
      </section>
    </main>
  );
}

export default About;
