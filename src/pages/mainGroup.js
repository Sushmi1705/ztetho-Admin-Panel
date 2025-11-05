import React, { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import "../styles/MainGroups.scss";

const MainGroups = () => {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  // UI helpers
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Fetch all main groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMainGroups();
      const arr = Array.isArray(data) ? data : data.data || [];
      // normalize keys (id) if needed
      setGroups(arr.map((g) => ({ ...g })));
      setError(null);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
      setError("Unable to load groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Add or Update group
  const handleAddOrUpdate = async () => {
    if (!name.trim()) {
      setToast({ type: "error", message: "Group name is required" });
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await apiService.updateMainGroup(editingId, { name, description });
        setToast({ type: "success", message: "Group updated" });
      } else {
        await apiService.addMainGroup({ name, description });
        setToast({ type: "success", message: "Group added" });
      }

      setName("");
      setDescription("");
      setEditingId(null);
      await fetchGroups();
    } catch (err) {
      console.error("Error adding/updating group:", err);
      setToast({ type: "error", message: "Save failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleEdit = (group) => {
    setEditingId(group.id);
    setName(group.name || "");
    setDescription(group.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const promptDelete = (id) => {
    setDeletingId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setShowConfirm(false);
      setSaving(true);
      await apiService.deleteMainGroup(deletingId);
      setToast({ type: "success", message: "Group deleted" });
      setDeletingId(null);
      await fetchGroups();
    } catch (err) {
      console.error("Error deleting group:", err);
      setToast({ type: "error", message: "Delete failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setDescription("");
  };

  // Search + pagination
  const filtered = groups.filter(
    (g) =>
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const displayed = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <div className="main-groups container">
      <header className="mg-header">
        <div className="mg-title">
          <h2>Main Groups</h2>
          <p className="muted">Manage the top-level groups used across the app</p>
        </div>

        <div className="mg-stats">
          <div className="stat-card">
            <div className="stat-count">{groups.length}</div>
            <div className="stat-label">Total Groups</div>
          </div>

          {/* <button
            className="btn btn-primary btn-add"
            onClick={() => {
              cancelEdit();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label="Add group"
          >
            + Add Group
          </button> */}
        </div>
      </header>

      <section className="mg-top-row">
        <div className="mg-form card">
          <h3>{editingId ? "Edit Group" : "Add Group"}</h3>

          <div className="field">
            <label>Group Name</label>
            <input
              placeholder="Enter group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="field">
            <label>Description</label>
            <input
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleAddOrUpdate} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Group" : "Add Group"}
            </button>
            {editingId && (
              <button className="btn btn-ghost" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="mg-controls">
          <div className="search-box">
            <input
              placeholder="Search groups..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="legend muted">Showing {filtered.length} results</div>
        </div>
      </section>

      <section className="mg-table card">
        {loading ? (
          <div className="loading">Loading groups...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="desc-col">Description</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan="3" className="empty">
                      No groups found.
                    </td>
                  </tr>
                )}

                {displayed.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <div className="name-cell">
                        <div className="avatar">{(group.name || "?").charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="g-name">{group.name}</div>
                          <div className="g-meta muted">ID: {group.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="desc-col">{group.description || <span className="muted">—</span>}</td>
                    <td className="actions-col">
                      <button className="action-btn edit" onClick={() => handleEdit(group)} title="Edit">
                        ✎
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => promptDelete(group.id)}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer">
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹ Prev
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next ›
                </button>
              </div>

              <div className="page-size muted">Showing {displayed.length} / {filtered.length}</div>
            </div>
          </>
        )}
      </section>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="modal-backdrop" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Delete Group</h4>
            <p>Are you sure you want to delete this group? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.message}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
};

export default MainGroups;