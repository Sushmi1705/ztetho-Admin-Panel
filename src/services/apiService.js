const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api/admin";

export const apiService = {
    // 🔹 Admin Login
    login: async (credentials) => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        return await res.json();
    },

    // 🔹 Dashboard Stats
    getDashboard: async () => {
        const res = await fetch(`${BASE_URL}/dashboard`);
        return await res.json();
    },

    // 🔹 Help & Support
    getHelpSupport: async () => {
        const res = await fetch(`${BASE_URL}/help-support`);
        return await res.json();
    },

    updateTicketStatus: async (ticketId, status, reply) => {
        const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, reply }),
        });
        if (!res.ok) throw new Error("Failed to update ticket");
        return res.json();
    },

    addTicketReply: async (ticketId, reply) => {
        const res = await fetch(`${BASE_URL}/tickets/${ticketId}/reply`, {
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
        const res = await fetch(`${BASE_URL}/reported/${type}`);
        return await res.json();
    },

    // --- 🔹 Reported News ---
    getReportedNews: async () => {
        const res = await fetch(`${BASE_URL}/reported/news`);
        return await res.json();
    },

    resolveNewsReport: async (newsId, reportId) => {
        const res = await fetch(`${BASE_URL}/reported/news/${newsId}/${reportId}/resolve`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },

    dismissNewsReport: async (newsId, reportId) => {
        const res = await fetch(`${BASE_URL}/reported/news/${newsId}/${reportId}/dismiss`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },

    // --- 🔹 Reported Groups ---
    getReportedGroups: async () => {
        const res = await fetch(`${BASE_URL}/reported/groups`);
        return await res.json();
    },

    resolveGroupReport: async (groupId, reportId) => {
        const res = await fetch(`${BASE_URL}/reported/groups/${groupId}/${reportId}/resolve`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },

    dismissGroupReport: async (groupId, reportId) => {
        const res = await fetch(`${BASE_URL}/reported/groups/${groupId}/${reportId}/dismiss`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },

    // --- 🔹 Reported Posts (common routes) ---
    getReportedPosts: async () => {
        const res = await fetch(`${BASE_URL}/reported/posts`);
        return await res.json();
    },

    resolveReported: async (reportId) => {
        const res = await fetch(`${BASE_URL}/reported/${reportId}/resolve`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },

    dismissReported: async (reportId) => {
        const res = await fetch(`${BASE_URL}/reported/${reportId}/dismiss`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    },
    // ===== Main Groups =====
    getMainGroups: async () => {
        const res = await fetch(`${BASE_URL}/main-groups`);
        return await res.json();
    },
    addMainGroup: async (data) => {
        const res = await fetch(`${BASE_URL}/main-groups`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    },
    updateMainGroup: async (id, data) => {
        const res = await fetch(`${BASE_URL}/main-groups/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    },
    deleteMainGroup: async (id) => {
        const res = await fetch(`${BASE_URL}/main-groups/${id}`, {
            method: "DELETE",
        });
        return await res.json();
    },

};
