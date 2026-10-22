const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
    const token = localStorage.getItem("taskManagerToken");
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
        ...options,
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
        localStorage.removeItem("taskManagerToken");
        window.dispatchEvent(new CustomEvent("auth-expired"));
    }
    if (!response.ok || body.success === false) {
        const validationError = body.errors && Object.values(body.errors).join(" ");
        const error = new Error(validationError || body.error || "The request could not be completed.");
        error.status = response.status;
        throw error;
    }
    return body.data;
}

export const register = (credentials) => request("/register", { method: "POST", body: JSON.stringify(credentials) });
export const login = async (credentials) => {
    const result = await request("/login", { method: "POST", body: JSON.stringify(credentials) });
    localStorage.setItem("taskManagerToken", result.token);
    window.dispatchEvent(new CustomEvent("auth-changed"));
    return result;
};
export const logout = () => {
    localStorage.removeItem("taskManagerToken");
    window.dispatchEvent(new CustomEvent("auth-changed"));
};
export const getMe = () => request("/me");

export const getTasks = () => request("/tasks");
export const createTask = (task) => request("/tasks", { method: "POST", body: JSON.stringify(task) });
export const updateTask = (id, task) => request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: "DELETE" });
export const getContacts = () => request("/contacts");
export const createContact = (contact) => request("/contacts", { method: "POST", body: JSON.stringify(contact) });
export const updateContact = (id, contact) => request(`/contacts/${id}`, { method: "PUT", body: JSON.stringify(contact) });
export const deleteContact = (id) => request(`/contacts/${id}`, { method: "DELETE" });