import { useEffect, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import "../styles/_reportedGroups.scss";

/* ---------- Helpers ---------- */
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

/* ---------- Confirm Modal ---------- */
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

/* ---------- Main Component ---------- */
export default function ReportedGroups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [q, setQ] = useState("");
    const [filter, setFilter] = useState("all");
    const [modal, setModal] = useState({ open: false, action: null, payload: null });

    const toggleExpand = (id) => setExpandedId(prev => (prev === id ? null : id));

    useEffect(() => {
        let mounted = true;
        const fetchGroups = async () => {
            try {
                const data = await apiService.getReportedGroups();
                if (!mounted) return;
                setGroups(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                if (!mounted) return;
                setError("Failed to load reported groups");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchGroups();
        return () => { mounted = false; };
    }, []);

    // Modal handling
    const openConfirm = (action, payload) => setModal({ open: true, action, payload });
    const closeConfirm = () => setModal({ open: false, action: null, payload: null });

    const handleResolve = (report, groupId) => openConfirm("resolve", { report, groupId });
    const handleDismiss = (report, groupId) => openConfirm("dismiss", { report, groupId });

    /* ---------- UPDATED performAction ---------- */
    const performAction = async (groupId, report, status) => {
        const prev = JSON.parse(JSON.stringify(groups));

        try {
            const group = groups.find(g => g.id === groupId);
            if (!group) return;

            // Find report by userId only (avoids undefined id issues)
            const reportIndex = group.reports.findIndex(r => r.userId === report.userId);
            if (reportIndex === -1) return;

            // Optimistic UI update
            setGroups(curr =>
                curr.map(g => {
                    if (g.id !== groupId) return g;
                    const updatedReports = g.reports.map((r, i) =>
                        r.userId === report.userId ? { ...r, status } : r
                    );
                    return { ...g, reports: updatedReports };
                })
            );

            // Call backend
            if (status === "resolved")
                await apiService.resolveGroupReport(groupId, report.userId);
            else if (status === "dismissed")
                await apiService.dismissGroupReport(groupId, report.userId);

        } catch (err) {
            console.error("Action failed", err);
            setGroups(prev); // revert UI
        }
    };

    const confirmModalAction = async () => {
        const { action, payload } = modal;
        if (!payload) return closeConfirm();
        const { report, groupId } = payload;
        const status = action === "resolve" ? "resolved" : "dismissed";
        await performAction(groupId, report, status);
        closeConfirm();
    };

    // Filtering
    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return groups;
        return groups.filter(g => {
            const inId = String(g.id || "").toLowerCase().includes(term);
            const inName = (g.groupName || "").toLowerCase().includes(term);
            const inReports = (g.reports || []).some(r =>
                (r.reason || "").toLowerCase().includes(term) ||
                String(r.userId || "").toLowerCase().includes(term)
            );
            return inId || inName || inReports;
        });
    }, [groups, q]);

    const getSeverity = (count) => {
        if (count >= 10) return "high";
        if (count >= 5) return "medium";
        return "low";
    };

    if (loading) return (
        <div className="reported-groups-container">
            <div className="page-header">
                <div className="left">
                    <h2 className="title">Reported Groups</h2>
                    <div className="sub">Review flagged groups and moderate quickly.</div>
                </div>
            </div>
            <div className="grid">
                {Array.from({ length: 6 }).map((_, i) => <div className="skeleton" key={i} />)}
            </div>
        </div>
    );

    if (error) return <p className="reported-groups-container error">{error}</p>;

    return (
        <div className="reported-groups-container">
            <div className="page-header">
                <div className="left">
                    <h2 className="title">👥 Reported Groups</h2>
                    {/* <div className="sub">{groups.length} groups flagged — click to expand</div> */}
                </div>
                <div className="controls">
                    <div className="search" role="search">
                        <span style={{ color: "#94a3b8" }}>🔎</span>
                        <input
                            aria-label="Search reported groups"
                            placeholder="Search..."
                            value={q}
                            onChange={e => setQ(e.target.value)}
                        />
                    </div>
                    <select value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <button className="btn" onClick={() => { setQ(""); setFilter("all"); }}>Reset</button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="empty">No reported groups found 🎉</div>
            ) : (
                <div className="grid">
                    {filtered.map(group => {
                        const reports = group.reports || [];
                        const latestReport = reports[0] || {};
                        const severity = getSeverity(group.reportCount || reports.length);
                        const groupName = group.groupName || "Unnamed Group";
                        const initials = groupName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                        const preview = latestReport.reason || "No reason provided";

                        return (
                            <article
                                key={group.id}
                                className={`group-card ${expandedId === group.id ? "expanded" : ""}`}
                                onClick={() => toggleExpand(group.id)}
                            >
                                <div className="top">
                                    <div className="avatar" aria-hidden>{initials}</div>
                                    <div className="meta">
                                        <h3 className="group-name">{groupName}</h3>
                                        <div className="group-id">ID: {group.id}</div>
                                        <div className="badges">
                                            <div className="badge reports">{reports.length} reports</div>
                                            <div className={`badge severity ${severity}`}>
                                                <span className="dot" />
                                                <span style={{ marginLeft: 6, fontWeight: 700 }}>{severity.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="preview">{preview}</div>

                                <div className="footer">
                                    <div className="left">
                                        <div style={{ color: "#64748b", fontSize: 13 }}>
                                            {reports.length > 0 ? `Latest by ${latestReport.userId}` : "No reporters"}
                                        </div>
                                    </div>
                                    <div className="actions">
                                        <button className="btn view" onClick={e => { e.stopPropagation(); toggleExpand(group.id); }}>
                                            {expandedId === group.id ? "Hide" : "View"}
                                        </button>
                                        {latestReport.id && !latestReport.status && (
                                            <>
                                                <button className="btn resolve" onClick={e => { e.stopPropagation(); handleResolve(latestReport, group.id); }}>
                                                    Resolve
                                                </button>
                                                <button className="btn dismiss" onClick={e => { e.stopPropagation(); handleDismiss(latestReport, group.id); }}>
                                                    Dismiss
                                                </button>
                                            </>
                                        )}
                                        {/* {latestReport.status && (
                                            <span style={{ fontWeight: 700, textTransform: "capitalize" }}>{latestReport.status}</span>
                                        )} */}
                                    </div>
                                </div>

                                {expandedId === group.id && (
                                    <div className="details" aria-live="polite">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Reporter</th>
                                                    <th>Reason</th>
                                                    <th>Reported At</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.map((r) => {
                                                    const status = r.status || "pending"; // default to pending
                                                    return (
                                                        <tr key={r.id}>
                                                            <td>
                                                                <div>{r.userId}</div>
                                                                <small style={{ color: "#64748b" }}>id</small>
                                                            </td>
                                                            <td>
                                                                <div style={{ fontWeight: 700 }}>{r.reason || "—"}</div>
                                                                {r.details && <small>{r.details}</small>}
                                                            </td>
                                                            <td>{relativeTime(safeDate(r.createdAt))}</td>
                                                            <td>
                                                                <span className={`status-badge ${status}`}>
                                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {status === "pending" ? (
                                                                    <div style={{ display: "flex", gap: 8 }}>
                                                                        <button
                                                                            className="btn resolve"
                                                                            onClick={(e) => { e.stopPropagation(); handleResolve(r, group.id); }}
                                                                        >
                                                                            Resolve
                                                                        </button>
                                                                        <button
                                                                            className="btn dismiss"
                                                                            onClick={(e) => { e.stopPropagation(); handleDismiss(r, group.id); }}
                                                                        >
                                                                            Dismiss
                                                                        </button>
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
