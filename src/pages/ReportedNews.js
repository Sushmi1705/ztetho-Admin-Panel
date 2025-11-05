import { useEffect, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import "../styles/_reportedNews.scss";

/* Helpers */
const safeDate = (d) => {
  if (!d) return null;
  if (typeof d === "object" && (d._seconds || d.seconds)) {
    const seconds = d._seconds ?? d.seconds;
    return new Date(seconds * 1000);
  }
  const t = new Date(d);
  return isNaN(t) ? null : t;
};

const relativeTime = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return date.toLocaleDateString();
};

/* Simple modal for confirmations */
function ConfirmModal({ open, title, message, onCancel, onConfirm, confirmLabel = "Confirm" }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal">
        <h3 style={{ margin: 0 }}>{title}</h3>
        <p style={{ color: "#64748b", marginTop: 8 }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn dismiss" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function ReportedNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState({ open: false, action: null, payload: null });

  useEffect(() => {
    let mounted = true;
    const fetchNews = async () => {
      try {
        const data = await apiService.getReported("news");
        if (!mounted) return;
        setNews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Failed to load reported news");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchNews();
    return () => { mounted = false; };
  }, []);

  const openConfirm = (action, payload) => setModal({ open: true, action, payload });
  const closeConfirm = () => setModal({ open: false, action: null, payload: null });

  const handleResolve = (report, newsId) => openConfirm("resolve", { report, newsId });
  const handleDismiss = (report, newsId) => openConfirm("dismiss", { report, newsId });

  const performAction = async (newsId, reportId, action) => {
    const prev = JSON.parse(JSON.stringify(news));
    try {
      // Optimistic UI update
      setNews((curr) =>
        curr.map((n) =>
          n.id === newsId
            ? {
                ...n,
                reports: n.reports.map((r) =>
                  r.id === reportId ? { ...r, status: action } : r
                ),
              }
            : n
        )
      );

      if (action === "resolve") {
        await apiService.resolveNewsReport(newsId, reportId);
      } else if (action === "dismiss") {
        await apiService.dismissNewsReport(newsId, reportId);
      }
    } catch (err) {
      console.error("Action failed", err);
      setNews(prev); // revert UI
      setError("Action failed. Please try again.");
    }
  };

  const confirmModalAction = async () => {
    const { action, payload } = modal;
    if (!payload) return closeConfirm();

    const reportId = payload.report?.id;
    const newsId = payload.newsId;
    if (!newsId || !reportId) return closeConfirm();

    await performAction(newsId, reportId, action);
    closeConfirm();
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return news;
    return news.filter((item) => {
      const inHeading = (item.heading || "").toLowerCase().includes(term);
      const inSpecialty = (item.specialty || "").toLowerCase().includes(term);
      const inReports = (item.reports || []).some(
        (r) =>
          (r.reason || "").toLowerCase().includes(term) ||
          String(r.userId || "").toLowerCase().includes(term)
      );
      return inHeading || inSpecialty || inReports;
    });
  }, [news, q]);

  if (loading) {
    return (
      <div className="reported-news-container">
        <div className="page-header">
          <div>
            <h2 className="title">Reported News</h2>
            <div className="sub">Review flagged news items and moderate quickly.</div>
          </div>
        </div>
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => <div className="skeleton" key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="reported-news-container empty">{error}</p>;
  }

  return (
    <div className="reported-news-container">
      <div className="page-header">
        <div>
          <h2 className="title">📰 Reported News</h2>
          {/* <div className="sub">{news.length} items flagged — click any card to expand</div> */}
        </div>

        <div className="controls">
          <div className="search" role="search">
            <span style={{ color: "#94a3b8" }}>🔎</span>
            <input
              aria-label="Search reported news"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <button className="btn" onClick={() => { setQ(""); setFilter("all"); }}>Reset</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No reported news found 🎉</div>
      ) : (
        <div className="grid">
          {filtered.map((item) => {
            const reports = item.reports || [];
            const latestReport = reports[0] || {};
            const created = safeDate(item.createdAt) || null;
            const preview = item.content ? item.content.slice(0, 220) : (latestReport.reason || "No content");
            const thumbnail = item.imageUrl || "";

            return (
              <article key={item.id} className={`card ${expandedId === item.id ? "expanded" : ""}`}>
                <div className="top">
                  <img
                    className="thumb"
                    src={thumbnail}
                    alt={item.heading || "news image"}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div className="meta">
                    <h3 className="heading">{item.heading || "Untitled"}</h3>
                    <div className="row">
                      <div className="specialty">{item.specialty || "General"}</div>
                      <div className="reports">{item.reportsCount ?? reports.length} reports</div>
                      <div style={{ marginLeft: 6, color: "#94a3b8", fontSize: 13 }}>
                        {created ? relativeTime(created) : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="content" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  {preview}
                </div>

                <div className="footer">
                  <div className="left">
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {reports.length > 0 ? `Latest by ${latestReport.userId}` : "No reporters"}
                    </div>
                  </div>

                  <div className="actions">
                    <button
                      className="btn view"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      {expandedId === item.id ? "Hide" : "View"}
                    </button>
                  </div>
                </div>

                {expandedId === item.id && (
                  <div className="details" aria-live="polite">
                    <table>
                      <thead>
                        <tr>
                          <th>Reporter</th>
                          <th>Reason</th>
                          <th>Reported At</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((r) => {
                          const status = r.status || "pending";
                          return (
                            <tr key={r.id}>
                              <td>{r.userId}</td>
                              <td>{r.reason || "—"}</td>
                              <td>{relativeTime(safeDate(r.reportedAt))}</td>
                              <td>
                                <span
                                  className={`status-badge ${status}`}
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                              </td>
                              <td>
                                {status === "pending" ? (
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button className="btn resolve" onClick={() => handleResolve(r, item.id)}>Resolve</button>
                                    <button className="btn dismiss" onClick={() => handleDismiss(r, item.id)}>Dismiss</button>
                                  </div>
                                ) : (
                                  <span style={{ color: "#64748b" }}>Action taken</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={modal.open}
        title={modal.action === "resolve" ? "Resolve report?" : "Dismiss report?"}
        message={modal.payload ? `This will mark the report by ${modal.payload.report?.userId} as ${modal.action}. Continue?` : ""}
        onCancel={closeConfirm}
        onConfirm={confirmModalAction}
        confirmLabel={modal.action === "resolve" ? "Resolve" : "Dismiss"}
      />
    </div>
  );
}
