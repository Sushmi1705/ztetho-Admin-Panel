import React, { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import "../styles/Notification.scss";

const Notification = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: "",
        message: "",
        type: "info",
        imageFile: null,
    });

    // Fetch Notifications
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await apiService.getNotifications();
            setList(response.data || []); // <-- FIX
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchNotifications();
    }, []);

    // Handle Input
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) setForm({ ...form, imageFile: files[0] });
        else setForm({ ...form, [name]: value });
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await apiService.updateNotification(editingId, form);
                alert("Notification updated!");
            } else {
                await apiService.addNotification(form);
                alert("Notification added!");
            }

            resetForm();
            fetchNotifications();
        } catch (err) {
            console.error(err);
            alert("Error saving notification!");
        }
    };

    const resetForm = () => {
        setForm({ title: "", message: "", type: "info", imageFile: null });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (item) => {
        setForm({
            title: item.title || "",
            message: item.message || "",
            type: item.type || "info",
            imageFile: null,
        });
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await apiService.deleteNotification(id);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="notification-page container py-5">
            <div className="d-flex justify-content-between mb-4">
                <h2 className="page-title">Notification Management</h2>
                <button className="btn add-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Close Form" : "+ Add Notification"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="notification-form card shadow-lg mb-4">
                    <div className="row g-3">

                        <div className="col-md-6">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Type</label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="info">Info</option>
                                <option value="update">Update</option>
                                <option value="alert">Alert</option>
                            </select>
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Message</label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                className="form-control"
                                rows="4"
                                required
                            />
                        </div>

                        {/* <div className="col-md-12">
              <label className="form-label">Image (optional)</label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                onChange={handleChange}
                className="form-control"
              />
            </div> */}

                        <div className="col-md-12 text-end">
                            <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingId ? "Update" : "Add"}
                            </button>
                        </div>

                    </div>
                </form>
            )}

            {/* Notification List */}
            <div className="notification-grid">
                {loading ? (
                    <p>Loading...</p>
                ) : list.length === 0 ? (
                    <div>No notifications found</div>
                ) : (
                    list.map((item) => (
                        <div key={item.id} className="notification-card">
                            {item.imageUrl && <img src={item.imageUrl} alt="" className="card-img" />}

                            <h3>{item.title}</h3>
                            <p>{item.message}</p>

                            <div className="badge">{item.type}</div>

                            <div className="actions">
                                <button className="btn-icon" onClick={() => handleEdit(item)}>✏️</button>
                                <button className="btn-icon delete" onClick={() => handleDelete(item.id)}>🗑️</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notification;
