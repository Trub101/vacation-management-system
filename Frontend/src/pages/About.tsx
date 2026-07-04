const BACKEND_TECH = ["Node.js", "TypeScript", "Express", "MySQL", "JWT", "bcrypt", "Multer", "MCP SDK", "Anthropic SDK"];
const FRONTEND_TECH = ["React 18", "TypeScript", "Redux Toolkit", "React Router v6", "Axios", "Recharts", "React Hook Form", "date-fns", "react-toastify"];

export default function About() {
  return (
    <div className="page">
      <h1>About This System</h1>
      <div className="card about-section">
        <p>
          <strong>Vacations</strong> is a full-stack vacation browsing platform.
          Registered users can explore trips from around the world, like the ones
          they love, get AI-generated travel recommendations, and query the live
          database in plain English through an MCP-powered chat. Administrators can
          add, edit and delete vacations, and view a likes report with charts and
          CSV export.
        </p>

        <h2>How it works</h2>
        <p>
          The React front end talks to an Express + TypeScript API secured with JWT
          authentication. Vacation data lives in MySQL. AI features are powered by
          Anthropic's Claude model — the MCP Chat page uses a custom Model Context
          Protocol server that exposes read-only database tools the model can call
          to answer questions with real data.
        </p>

        <h2>Backend stack</h2>
        <div className="tech-list">
          {BACKEND_TECH.map((t) => <span key={t}>{t}</span>)}
        </div>

        <h2>Frontend stack</h2>
        <div className="tech-list">
          {FRONTEND_TECH.map((t) => <span key={t}>{t}</span>)}
        </div>

        <h2>Developer</h2>
        <p>
          Built by <strong>Daniel Trubiner</strong> as a full-stack project —
          John Bryce course, 2026.
        </p>
      </div>
    </div>
  );
}
