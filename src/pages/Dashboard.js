import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import "../styles/_dashboard.scss";

/* Simple animated counter */
function AnimatedNumber({ value = 0, duration = 700 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = null;
    const start = performance.now();
    const from = 0;
    const to = Number(value) || 0;

    function step(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad-ish
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (t < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

/* small inline icons (SVG) */
const Icon = ({ name }) => {
  const size = 18;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };

  switch (name) {
    case "users":
      return (
        <svg {...common}><path d="M16 11c1.657 0 3 1.343 3 3v1H5v-1c0-1.657 1.343-3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      );
    case "groups":
      return (
        <svg {...common}><path d="M3 7h18M6 21V9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      );
    case "jobs":
      return (
        <svg {...common}><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M16 3H8v4h8V3z" stroke="currentColor" strokeWidth="1.6"/></svg>
      );
    case "posts":
      return (
        <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      );
    case "news":
      return (
        <svg {...common}><path d="M21 15V7a2 2 0 0 0-2-2H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 13l4-4 4 4 4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      );
    case "tickets":
      return (
        <svg {...common}><path d="M3 8v8a2 2 0 0 0 2 2h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 8V6a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.6"/></svg>
      );
    case "reported":
      return (
        <svg {...common}><path d="M12 2l3 7h7l-5.5 4.2L20 21l-8-5-8 5 1.5-7.8L0 9h7L12 2z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
      );
    default:
      return <span style={{fontSize: 16}}>📊</span>;
  }
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const result = await apiService.getDashboard();
        if (!mounted) return;
        setData(result);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (!mounted) return;
        setError("Failed to load dashboard data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchDashboard();
    return () => { mounted = false; };
  }, []);

  const cards = [
    { key: "totalUsers", title: "Total Users", icon: "users" },
    { key: "totalGroups", title: "Total Groups", icon: "groups" },
    { key: "totalJobs", title: "Total Jobs", icon: "jobs" },
    { key: "totalPosts", title: "Total Posts", icon: "posts" },
    { key: "totalNews", title: "Total News", icon: "news" },
    { key: "totalTickets", title: "Help & Support Tickets", icon: "tickets" },
    // { key: "reportedItems", title: "Reported Items", icon: "reported", highlight: true },
    { key: "reportedGroups", title: "Reported Groups", icon: "groups" },
    { key: "reportedNews", title: "Reported News", icon: "news" },
    { key: "reportedPosts", title: "Reported Posts", icon: "posts" },
    // { key: "reportedJobs", title: "Reported Jobs", icon: "jobs" },
    // { key: "reportedUsers", title: "Reported Users", icon: "users" },
  ];

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Admin Dashboard</h2>
      {/* <div className="dashboard-sub">Overview of the system — quick stats, health and reports.</div> */}

      {/* <div className="controls-row">
        <div className="filter">Last 7 days</div>
        <div className="filter">All projects</div>
      </div> */}

      {loading ? (
        <div className="dashboard-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="skeleton" key={i} />
          ))}
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : data ? (
        <div className="dashboard-grid">
          {cards.map((c) => {
            const value = data[c.key] ?? 0;
            return (
              <div className={`dashboard-card ${c.highlight ? "highlight" : ""}`} key={c.key}>
                <div className="card-top">
                  <div className="card-icon" aria-hidden>
                    <Icon name={c.icon} />
                  </div>
                  <div className="card-meta">
                    <div className="card-title">{c.title}</div>
                    <div className="card-subtitle">{c.highlight ? "Action needed" : "Overview"}</div>
                  </div>
                </div>

                <div className="card-value">
                  <AnimatedNumber value={value} />
                </div>

                <div className="card-foot">
                  {/* optional delta - would require previous period values; here we show a placeholder */}
                  <div className="delta">+{Math.floor(Math.random() * 10)}%</div>
                  <div className="note">since last period</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}

export default Dashboard;