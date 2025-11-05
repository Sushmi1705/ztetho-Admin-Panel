import { useEffect, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import "../styles/_reportedPosts.scss";

/* Helpers */
const safeDate = (d) => {
  if (!d) return null;
  if (typeof d === "object" && (d._seconds || d.seconds)) {
    const seconds = d._seconds ?? d.seconds;
    return new Date(seconds * 1000);
  }
  const parsed = new Date(d);
  if (!isNaN(parsed)) return parsed;
  return null;
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

/* Confirm Modal */
function ConfirmModal({ open, title, message, onCancel, onConfirm, confirmLabel = "Confirm" }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal">
        <h3 style={{ margin: 0 }}>{title}</h3>
        <p style={{ color: "#64748b", marginTop: 8 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn dismiss" onClick={onConfirm} style={{ minWidth: 100 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportedPosts() {
  const [posts, setPosts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState({ open: false, action: null, payload: null });

  /* Fetch all reported posts */
  const fetchReports = async () => {
    try {
      const data = await apiService.getReported("posts");
      const grouped = data.reduce((acc, item) => {
        const { postId } = item;
        if (!acc[postId]) acc[postId] = { postId, reports: [] };
        acc[postId].reports.push(item);
        return acc;
      }, {});
      setPosts(Object.values(grouped).sort((a, b) => b.reports.length - a.reports.length));
    } catch (err) {
      console.error("Error fetching reported posts", err);
      setError("Failed to load reported posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (filterStatus !== "all") {
        const has = p.reports.some((r) => (r.status || "pending") === filterStatus);
        if (!has) return false;
      }
      if (!term) return true;
      return (
        String(p.postId).toLowerCase().includes(term) ||
        p.reports.some(
          (r) =>
            (r.reason || "").toLowerCase().includes(term) ||
            String(r.reportedBy || "").toLowerCase().includes(term) ||
            (r.postPreview || "").toLowerCase().includes(term)
        )
      );
    });
  }, [posts, q, filterStatus]);

  const openConfirm = (action, payload) => setModal({ open: true, action, payload });
  const closeConfirm = () => setModal({ open: false, action: null, payload: null });

  /* ✅ Updated performAction */
  const performAction = async (report, status) => {
    try {
      // Optimistic UI update
      setPosts((cur) =>
        cur.map((group) => ({
          ...group,
          reports: group.reports.map((r) =>
            r.id === report.id ? { ...r, status } : r
          ),
        }))
      );

      // Backend call
      if (status === "resolved") {
        await apiService.resolveReported(report.id);
      } else if (status === "dismissed") {
        await apiService.dismissReported(report.id);
      }

      // Refetch fresh data
      await fetchReports();
    } catch (err) {
      console.error("Action failed:", err);
      setError("Action failed. Please try again.");
    }
  };

  const handleResolve = (report) => openConfirm("resolve", report);
  const handleDismiss = (report) => openConfirm("dismiss", report);

  const confirmAction = async () => {
    const { action, payload } = modal;
    if (!payload) return closeConfirm();
    if (action === "resolve") {
      await performAction(payload, "resolved");
    } else if (action === "dismiss") {
      await performAction(payload, "dismissed");
    }
    closeConfirm();
  };

  if (loading) return <p className="loading">⏳ Loading reported posts...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="reported-posts-container">
      <h2 className="title">🧾 Reported Posts</h2>
      {/* <p className="subtitle">Review and moderate posts flagged by users.</p> */}

      <div className="controls">
        <div className="search" role="search">
          <span className="icon">🔎</span>
          <input
            aria-label="Search reported posts"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <button className="btn" onClick={() => { setQ(""); setFilterStatus("all"); }}>Reset</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No reported posts found 🎉</div>
      ) : (
        <div className="post-list">
          {filtered.map((group) => {
            const first = group.reports[0] || {};
            const severity = first.severity || "low";
            const created = safeDate(first.createdAt) || new Date();

            return (
              <div
                key={group.postId}
                className={`post-card ${expandedId === group.postId ? "expanded" : ""}`}
                aria-expanded={expandedId === group.postId}
              >
                <div className="avatar" aria-hidden>
                  {String(group.postId).slice(0, 2).toUpperCase()}
                </div>

                <div
                  className="post-main"
                  onClick={() => toggleExpand(group.postId)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="post-top">
                    <div className="meta">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div className="post-id">Post #{group.postId}</div>
                        <div className={`severity ${severity}`}>
                          <span className="dot" />
                          <span style={{ marginLeft: 6, fontWeight: 700, fontSize: 12 }}>
                            {severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="post-title">
                        {first.postPreview
                          ? first.postPreview.slice(0, 80)
                          : first.reason || "No preview available"}
                      </div>
                    </div>
                    <div className="summary">{group.reports.length} reports</div>
                  </div>

                  <div className="post-body">
                    {first.postPreview || first.reason || "No reason provided"}
                  </div>

                  <div className="tags" style={{ display: "flex" }}>
                    {Array.from(new Set(group.reports.map((r) => r.reportedBy)))
                      .slice(0, 4)
                      .map((u) => (
                        <div key={u} className="badge">
                          Reporter: {String(u)}
                        </div>
                      ))}
                    {group.reports.length > 4 && (
                      <div className="badge">+{group.reports.length - 4} more</div>
                    )}
                  </div>

                  {expandedId === group.postId && (
                    <div className="report-details" style={{ marginTop: 12 }}>
                      <table>
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Reported On</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.reports.map((r) => (
                            <tr key={r.id}>
                              <td>{r.reportedBy}</td>
                              <td>{r.reason || "—"}</td>
                              <td>
                                <span
                                  style={{
                                    padding: "6px 8px",
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    background:
                                      r.status === "resolved"
                                        ? "#ecfdf5"
                                        : r.status === "dismissed"
                                        ? "#fff1f2"
                                        : "#f8fafc",
                                    color:
                                      r.status === "resolved"
                                        ? "#059669"
                                        : r.status === "dismissed"
                                        ? "#dc2626"
                                        : "#0b1220",
                                  }}
                                >
                                  {r.status || "pending"}
                                </span>
                              </td>
                              <td>{relativeTime(safeDate(r.createdAt))}</td>
                              <td>
                                <div style={{ display: "flex", gap: 8 }}>
                                  {r.status !== "resolved" && r.status !== "dismissed" && (
                                    <>
                                      <button className="btn resolve" onClick={() => handleResolve(r)}>
                                        Resolve
                                      </button>
                                      <button className="btn dismiss" onClick={() => handleDismiss(r)}>
                                        Dismiss
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="post-actions">
                  <div className="time">{relativeTime(created)}</div>
                  <div className="actions-row">
                    {first.status !== "resolved" && first.status !== "dismissed" && (
                      <>
                        {/* <button className="btn resolve" onClick={() => handleResolve(first)}>
                          Resolve
                        </button>
                        <button className="btn dismiss" onClick={() => handleDismiss(first)}>
                          Dismiss
                        </button> */}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={modal.open}
        title={modal.action === "resolve" ? "Resolve report?" : "Dismiss report?"}
        message={
          modal.payload
            ? `Are you sure you want to ${modal.action} the report by ${modal.payload.reportedBy} for post ${modal.payload.postId}?`
            : ""
        }
        onCancel={closeConfirm}
        onConfirm={confirmAction}
        confirmLabel={modal.action === "resolve" ? "Resolve" : "Dismiss"}
      />
    </div>
  );
}

export default ReportedPosts;
