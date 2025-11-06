import React, { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import "../styles/News.scss";

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    doctorId: "",
    heading: "",
    content: "",
    specialty: "",
    imageFile: null,
  });

  // Fetch news
  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllNews();
      setNewsList(data);
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handle form input
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
        await apiService.updateNews(editingId, form);
        alert("✅ News updated successfully!");
      } else {
        await apiService.addNews(form);
        alert("✅ News added successfully!");
      }
      resetForm();
      fetchNews();
    } catch (err) {
      console.error(err);
      alert("❌ Error occurred!");
    }
  };

  const resetForm = () => {
    setForm({ doctorId: "", heading: "", content: "", specialty: "", imageFile: null });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({
      doctorId: item.doctorId || "",
      heading: item.heading || "",
      content: item.content || "",
      specialty: item.specialty || "",
      imageFile: null,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;
    try {
      await apiService.deleteNews(id);
      alert("🗑️ News deleted successfully!");
      fetchNews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="news-page container py-5">
      <div className="header-section">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="page-title"> News Management</h2>
          <button
            className="btn add-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close Form" : "+ Add News"}
          </button>
        </div>
        
        {/* <div className="stats-bar">
          <div className="stat-card">
            <span className="stat-value">{newsList.length}</span>
            <span className="stat-label">Total News</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">5</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">24</span>
            <span className="stat-label">This Month</span>
          </div>
        </div> */}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="news-form card shadow-lg mb-5">
          <div className="form-header">
            <h3>{editingId ? "Edit News" : "Add New News"}</h3>
            <p>Fill in the details below to {editingId ? "update" : "create"} a news item</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-6">
              <div className="input-group">
                <label className="form-label">Doctor ID</label>
                <input
                  type="text"
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter doctor ID"
                  required
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="input-group">
                <label className="form-label">Specialty</label>
                <input
                  type="text"
                  name="specialty"
                  value={form.specialty}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter specialty"
                />
              </div>
            </div>
            
            <div className="col-md-12">
              <div className="input-group">
                <label className="form-label">Heading</label>
                <input
                  type="text"
                  name="heading"
                  value={form.heading}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter news heading"
                  required
                />
              </div>
            </div>
            
            <div className="col-md-12">
              <div className="input-group">
                <label className="form-label">Content</label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  className="form-control"
                  rows="4"
                  placeholder="Enter news content"
                  required
                ></textarea>
              </div>
            </div>
            
            <div className="col-md-12">
              <div className="input-group">
                <label className="form-label">Image</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleChange}
                    className="file-input"
                  />
                  <div className="file-upload-area">
                    <span className="upload-icon">📁</span>
                    <span className="upload-text">
                      {form.imageFile ? form.imageFile.name : "Drag & drop or click to upload"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-12">
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update News" : "Add News"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="news-grid">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading news...</p>
          </div>
        ) : newsList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <h3>No News Found</h3>
            <p>Get started by adding your first news item</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Add News
            </button>
          </div>
        ) : (
          newsList.map((item) => (
            <div key={item.id} className="news-card">
              <div className="card-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.heading} />
                ) : (
                  <div className="image-placeholder">
                    <span className="placeholder-icon">📰</span>
                  </div>
                )}
                <div className="specialty-badge">
                  {item.specialty || "General"}
                </div>
              </div>
              
              <div className="card-content">
                <div className="card-header">
                  <h3 className="news-title">{item.heading}</h3>
                  <span className="doctor-id">ID: {item.doctorId || "N/A"}</span>
                </div>
                
                <p className="news-content">
                  {item.content.length > 120 
                    ? `${item.content.substring(0, 120)}...` 
                    : item.content}
                </p>
                
                <div className="card-footer">
                  <div className="actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => handleEdit(item)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="date">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default News;