const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const apiService = {
    // 🔹 Admin Login
    login: async (credentials) => {
        const res = await fetch(`${BASE_URL}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        return await res.json();
    },

    // 🔹 Dashboard Stats
    getDashboard: async () => {
        const res = await fetch(`${BASE_URL}/admin/dashboard`);
        return await res.json();
    },

    // 🔹 Help & Support
    getHelpSupport: async () => {
        const res = await fetch(`${BASE_URL}/admin/help-support`);
        return await res.json();
    },

    updateTicketStatus: async (ticketId, status, reply) => {
        const res = await fetch(`${BASE_URL}/admin/tickets/${ticketId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, reply }),
        });
        if (!res.ok) throw new Error("Failed to update ticket");
        return res.json();
    },

    addTicketReply: async (ticketId, reply) => {
        const res = await fetch(`${BASE_URL}/admin/tickets/${ticketId}/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply }),
        });
        if (!res.ok) throw new Error("Failed to add reply");
        return res.json();
    },

    // 🔹 Get Reported Data (generic)
    // type: "posts" | "groups" | "news" | "users"
    getReported: async (type) => {
        const res = await fetch(`${BASE_URL}/admin/reported/${type}`);
        return await res.json();
    },

    // --- 🔹 Reported News ---
    getReportedNews: async () => {
        const res = await fetch(`${BASE_URL}/admin/reported/news`);
        return await res.json();
    },

    resolveNewsReport: async (newsId, reportId) => {
        const res = await fetch(`${BASE_URL}/admin/reported/news/${newsId}/${reportId}/resolve`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },

    dismissNewsReport: async (newsId, reportId) => {
        const res = await fetch(`${BASE_URL}/admin/reported/news/${newsId}/${reportId}/dismiss`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },

    // --- 🔹 Reported Groups ---
    getReportedGroups: async () => {
        const res = await fetch(`${BASE_URL}/admin/reported/groups`);
        return await res.json();
    },

    resolveGroupReport: async (groupId, reportId) => {
        const res = await fetch(`${BASE_URL}/admin/reported/groups/${groupId}/${reportId}/resolve`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },

    dismissGroupReport: async (groupId, reportId) => {
        const res = await fetch(`${BASE_URL}/admin/reported/groups/${groupId}/${reportId}/dismiss`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },

    // --- 🔹 Reported Posts (common routes) ---
    getReportedPosts: async () => {
        const res = await fetch(`${BASE_URL}/admin/reported/posts`);
        return await res.json();
    },

    resolveReported: async (reportId) => {
        const res = await fetch(`${BASE_URL}/admin/reported/${reportId}/resolve`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },

    dismissReported: async (reportId) => {
        const res = await fetch(`${BASE_URL}/admin/reported/${reportId}/dismiss`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },
    // ===== Main Groups =====
    getMainGroups: async () => {
        const res = await fetch(`${BASE_URL}/admin/main-groups`);
        return await res.json();
    },
    addMainGroup: async (data) => {
        const res = await fetch(`${BASE_URL}/admin/main-groups`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    },
    updateMainGroup: async (id, data) => {
        const res = await fetch(`${BASE_URL}/admin/main-groups/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    },
    deleteMainGroup: async (id) => {
        const res = await fetch(`${BASE_URL}/admin/main-groups/${id}`, {
            method: "DELETE",
        });
        return await res.json();
    },

    // --- 🔹 News Management ---
    getAllNews: async () => {
        const res = await fetch(`${BASE_URL}/news`);
        if (!res.ok) throw new Error("Failed to fetch news");
        return await res.json();
    },

    addNews: async (data) => {
        const formData = new FormData();
        for (const key in data) {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        }

        const res = await fetch(`${BASE_URL}/news`, {
            method: "POST",
            body: formData,
        });
        if (!res.ok) throw new Error("Failed to add news");
        return await res.json();
    },

    updateNews: async (id, data) => {
        const formData = new FormData();
        for (const key in data) {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        }

        const res = await fetch(`${BASE_URL}/news/${id}`, {
            method: "PUT",
            body: formData,
        });
        if (!res.ok) throw new Error("Failed to update news");
        return await res.json();
    },

    deleteNews: async (id) => {
        const res = await fetch(`${BASE_URL}/news/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete news");
        return await res.json();
    },

    // ===== 🔔 Notification Management =====

    getNotifications: async () => {
        const res = await fetch(`${BASE_URL}/notifications`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        return await res.json();
    },

    addNotification: async (data) => {
        const formData = new FormData();
        for (const key in data) {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        }

        const res = await fetch(`${BASE_URL}/notifications`, {
            method: "POST",
            body: formData,
        });
        if (!res.ok) throw new Error("Failed to add notification");
        return await res.json();
    },

    updateNotification: async (id, data) => {
        const formData = new FormData();
        for (const key in data) {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        }

        const res = await fetch(`${BASE_URL}/notifications/${id}`, {
            method: "PUT",
            body: formData,
        });
        if (!res.ok) throw new Error("Failed to update notification");
        return await res.json();
    },

    deleteNotification: async (id) => {
        const res = await fetch(`${BASE_URL}/notifications/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete notification");
        return await res.json();
    },

};
