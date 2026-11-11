const API_URL = "http://localhost:5000";

function getHeaders() {
    const token = localStorage.getItem("buildAndBloomToken");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
}

async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...getHeaders(),
            ...options.headers
        }
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Notification request failed.");
    }

    return result;
}

export async function getNotifications() {
    return request("/api/notifications");
}

export async function markNotificationRead(advisoryId) {
    return request(`/api/notifications/${advisoryId}/read`, {
        method: "POST"
    });
}

export async function getAdminAdvisories() {
    return request("/api/notifications/admin/advisories");
}

export async function sendWeatherAdvisory(advisory) {
    return request("/api/notifications/admin/advisories", {
        method: "POST",
        body: JSON.stringify(advisory)
    });
}
