import { useEffect, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import "../styles/_helpSupportTickets.scss";

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

const getPriority = (queryType) => {
    const high = ["app crash", "payment issue", "account locked"];
    const medium = ["job posting issue", "login problem", "profile update"];
    const lower = queryType.toLowerCase();
    if (high.some((k) => lower.includes(k))) return "high";
    if (medium.some((k) => lower.includes(k))) return "medium";
    return "low";
};

/* Modal for reply/resolve */
function ActionModal({ open, ticket, onCancel, onSubmit }) {
    const [reply, setReply] = useState("");

    if (!open || !ticket) return null;

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Ticket Action">
            <div className="modal">
                <h3 className="modal-title">Respond to Ticket #{ticket.id}</h3>
                <div className="modal-body">
                    <p style={{ color: "#64748b", marginBottom: 12 }}>
                        <strong>User:</strong> {ticket.userId}
                        <br />
                        <strong>Query:</strong> {ticket.queryType}
                    </p>
                    <textarea
                        placeholder="Type your response here..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        aria-label="Response message"
                    />
                </div>
                <div className="modal-footer">
                    <button className="btn" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className="btn resolve"
                        onClick={() => {
                            onSubmit(ticket.id, reply, "resolved");
                            setReply("");
                        }}
                    >
                        Send & Resolve
                    </button>
                    <button
                        className="btn in-progress"
                        onClick={() => {
                            onSubmit(ticket.id, reply, "in-progress");
                            setReply("");
                        }}
                    >
                        Send & Mark In Progress
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function HelpSupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [q, setQ] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [modal, setModal] = useState({ open: false, ticket: null });

    useEffect(() => {
        let mounted = true;
        const fetchTickets = async () => {
            try {
                const data = await apiService.getHelpSupport();
                if (!mounted) return;
                setTickets(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                if (!mounted) return;
                setError("Failed to load support tickets");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchTickets();
        return () => {
            mounted = false;
        };
    }, []);

    const openModal = (ticket) => setModal({ open: true, ticket });
    const closeModal = () => setModal({ open: false, ticket: null });

    const handleSubmit = async (ticketId, reply, newStatus) => {
        const prev = JSON.parse(JSON.stringify(tickets)); // backup
        try {
            // Optimistic UI update
            setTickets((curr) =>
                curr.map((t) =>
                    t.id === ticketId ? { ...t, status: newStatus, reply } : t
                )
            );

            // Call backend API
            await apiService.updateTicketStatus(ticketId, newStatus, reply);

            closeModal();
            setExpandedId(null); // collapse the ticket card
        } catch (err) {
            console.error("Action failed", err);
            setTickets(prev); // revert if API fails
            setError("Action failed. Please try again.");
        }
    };

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        let result = tickets;

        if (filterStatus !== "all") {
            result = result.filter((t) => t.status === filterStatus);
        }

        if (term) {
            result = result.filter(
                (t) =>
                    String(t.id || "").toLowerCase().includes(term) ||
                    (t.userId || "").toLowerCase().includes(term) ||
                    (t.queryType || "").toLowerCase().includes(term) ||
                    (t.message || "").toLowerCase().includes(term)
            );
        }

        return result;
    }, [tickets, q, filterStatus]);

    const stats = useMemo(() => {
        const pending = tickets.filter((t) => t.status === "pending").length;
        const resolved = tickets.filter((t) => t.status === "resolved").length;
        const inProgress = tickets.filter((t) => t.status === "in-progress").length;
        return { total: tickets.length, pending, resolved, inProgress };
    }, [tickets]);

    if (loading) {
        return (
            <div className="help-support-container">
                <div className="page-header">
                    <div className="left">
                        <h2 className="title">Help & Support Tickets</h2>
                        <div className="sub">Manage user queries and support requests.</div>
                    </div>
                </div>
                <div className="list">{Array.from({ length: 5 }).map((_, i) => <div className="skeleton" key={i} />)}</div>
            </div>
        );
    }

    if (error) {
        return <p className="help-support-container error">{error}</p>;
    }

    return (
        <div className="help-support-container">
            <div className="page-header">
                <div className="left">
                    <h2 className="title">🎫 Help & Support Tickets</h2>
                    {/* <div className="sub">{tickets.length} tickets — click any card to expand</div> */}
                </div>

                <div className="controls">
                    <div className="search" role="search">
                        <span style={{ color: "#94a3b8" }}>🔎</span>
                        <input
                            aria-label="Search tickets"
                            placeholder="Search..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        aria-label="Filter by status"
                    >
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>

                    <button
                        className="btn"
                        onClick={() => {
                            setQ("");
                            setFilterStatus("all");
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-label">Total Tickets</div>
                    <div className="stat-value">{stats.total}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Pending</div>
                    <div className="stat-value" style={{ color: "#f59e0b" }}>{stats.pending}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">In Progress</div>
                    <div className="stat-value" style={{ color: "#3b82f6" }}>{stats.inProgress}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Resolved</div>
                    <div className="stat-value" style={{ color: "#10b981" }}>{stats.resolved}</div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="empty">No tickets found 🎉</div>
            ) : (
                <div className="list">
                    {filtered.map((ticket) => {
                        const priority = getPriority(ticket.queryType || "");
                        const created = safeDate(ticket.createdAt);
                        return (
                            <article
                                key={ticket.id}
                                className={`ticket-card ${expandedId === ticket.id ? "expanded" : ""}`}
                                onClick={() =>
                                    setExpandedId(expandedId === ticket.id ? null : ticket.id)
                                }
                            >
                                <div className={`priority-bar ${priority}`} aria-hidden />

                                <div className="main">
                                    <div className="top">
                                        <div className="meta">
                                            <div className="ticket-id">Ticket #{ticket.id}</div>
                                            <div className="query-type">{ticket.queryType || "General Query"}</div>
                                            <div className="user-info">User: {ticket.userId}</div>
                                        </div>

                                        <div className="badges">
                                            <div className={`badge status ${ticket.status}`}>{ticket.status || "pending"}</div>
                                            <div className={`badge priority ${priority}`}>{priority.toUpperCase()}</div>
                                        </div>
                                    </div>

                                    <div className="message">{ticket.message}</div>

                                    <div className="footer">
                                        <div className="time">{relativeTime(created)}</div>

                                        <div className="actions">
                                            <button
                                                className="btn view"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedId(expandedId === ticket.id ? null : ticket.id);
                                                }}
                                            >
                                                {expandedId === ticket.id ? "Collapse" : "Expand"}
                                            </button>

                                            {ticket.status !== "resolved" && (
                                                <button
                                                    className="btn in-progress"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openModal(ticket);
                                                    }}
                                                >
                                                    Respond
                                                </button>
                                            )}
                                        </div>

                                    </div>

                                    {expandedId === ticket.id && (
                                        <div className="details" aria-live="polite">
                                            <div className="detail-row"><div className="label">Ticket ID</div><div className="value">{ticket.id}</div></div>
                                            <div className="detail-row"><div className="label">User ID</div><div className="value">{ticket.userId}</div></div>
                                            <div className="detail-row"><div className="label">Query Type</div><div className="value">{ticket.queryType}</div></div>
                                            <div className="detail-row"><div className="label">Status</div><div className="value">{ticket.status}</div></div>
                                            <div className="detail-row"><div className="label">Priority</div><div className="value">{priority.toUpperCase()}</div></div>
                                            <div className="detail-row"><div className="label">Created At</div><div className="value">{created ? created.toLocaleString() : "—"}</div></div>
                                            <div className="detail-row"><div className="label">Message</div><div className="value">{ticket.message}</div></div>
                                            {ticket.reply && <div className="detail-row"><div className="label">Reply</div><div className="value">{ticket.reply}</div></div>}
                                        </div>
                                    )}
                                </div>

                                <div className="side">{/* Reserved for future actions or metadata */}</div>
                            </article>
                        );
                    })}
                </div>
            )}

            <ActionModal
                open={modal.open}
                ticket={modal.ticket}
                onCancel={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
