import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask, deleteTask, getTasks, updateTask } from "../api";

const emptyForm = { title: "", description: "", priority: "medium" };

function Spinner() {
    return (
        <div style={{ display: "grid", placeItems: "center", padding: "40px 20px", color: "#4f46e5", fontWeight: 700 }}>
            <div
                style={{
                    width: "42px",
                    height: "42px",
                    border: "4px solid #c7d2fe",
                    borderTopColor: "#4f46e5",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                }}
            />
            <p style={{ marginTop: "12px" }}>Loading repositories...</p>
        </div>
    );
}

function ErrorMessage({ message, onRetry }) {
    return (
        <div style={{ padding: "24px", background: "#fff7ed", borderRadius: "20px", border: "1px solid #fdba74" }}>
            <h3 style={{ marginTop: 0, color: "#b45309" }}>Something went wrong</h3>
            <p style={{ marginBottom: "16px", color: "#9a5b08" }}>{message}</p>
            <button
                onClick={onRetry}
                style={{
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    cursor: "pointer",
                    background: "#ea580c",
                    color: "#ffffff",
                    fontWeight: 700,
                }}
            >
                Retry
            </button>
        </div>
    );
}

function Toast({ toast }) {
    if (!toast) return null;
    return <div role="status" style={{ marginBottom: "16px", padding: "12px 16px", borderRadius: "10px", background: toast.type === "success" ? "#dcfce7" : "#fee2e2", color: toast.type === "success" ? "#166534" : "#991b1b", fontWeight: 600 }}>{toast.message}</div>;
}

function Projects() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        window.setTimeout(() => setToast(null), 3500);
    };

    const fetchTasks = async () => {
        setLoading(true);
        setLoadError(null);
        try { setTasks(await getTasks()); }
        catch (err) { setLoadError(err.message || "Failed to load tasks."); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const handleAuthExpired = () => navigate("/login");
        window.addEventListener("auth-expired", handleAuthExpired);
        fetchTasks();
        return () => window.removeEventListener("auth-expired", handleAuthExpired);
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const taskInput = { ...form, title: form.title.trim() };
        if (!taskInput.title) return showToast("error", "A task title is required.");
        setSaving(true);
        const currentEditingId = editingId;
        const temporaryId = `temporary-${Date.now()}`;
        if (!currentEditingId) setTasks((current) => [{ ...taskInput, _id: temporaryId, completed: false }, ...current]);
        try {
            if (currentEditingId) {
                const savedTask = await updateTask(currentEditingId, taskInput);
                setTasks((current) => current.map((task) => task._id === currentEditingId ? savedTask : task));
                showToast("success", "Task updated successfully.");
            } else {
                const savedTask = await createTask(taskInput);
                setTasks((current) => current.map((task) => task._id === temporaryId ? savedTask : task));
                showToast("success", "Task created successfully.");
            }
            setForm(emptyForm); setEditingId(null);
        } catch (err) {
            if (!currentEditingId) setTasks((current) => current.filter((task) => task._id !== temporaryId));
            showToast("error", err.message || "The task could not be saved.");
        } finally { setSaving(false); }
    };

    const handleToggle = async (task) => {
        setSaving(true);
        try {
            const savedTask = await updateTask(task._id, { completed: !task.completed });
            setTasks((current) => current.map((item) => item._id === task._id ? savedTask : item));
            showToast("success", "Task status updated.");
        } catch (err) { showToast("error", err.message || "The task status could not be updated."); }
        finally { setSaving(false); }
    };

    const handleDelete = async (task) => {
        if (!window.confirm(`Delete "${task.title}"?`)) return;
        setDeletingId(task._id);
        try {
            await deleteTask(task._id);
            setTasks((current) => current.filter((item) => item._id !== task._id));
            showToast("success", "Task deleted successfully.");
        } catch (err) { showToast("error", err.message || "The task could not be deleted."); }
        finally { setDeletingId(null); }
    };

    if (loading) return <div style={{ padding: "40px 20px", textAlign: "center", color: "#4f46e5", fontWeight: 700 }}>Loading tasks...</div>;
    if (loadError) return <div style={{ padding: "24px", background: "#fff7ed", borderRadius: "20px", border: "1px solid #fdba74" }}><h3 style={{ marginTop: 0, color: "#b45309" }}>Unable to load tasks</h3><p style={{ color: "#9a5b08" }}>{loadError}</p><button onClick={fetchTasks} style={{ border: "none", borderRadius: "10px", padding: "10px 16px", cursor: "pointer", background: "#ea580c", color: "#ffffff", fontWeight: 700 }}>Retry</button></div>;

    return <div style={{ padding: "28px", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 12px 35px rgba(15, 23, 42, 0.08)" }}>
        <h2 style={{ marginTop: 0, color: "#4f46e5" }}>Task Manager</h2><Toast toast={toast} />
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px", marginBottom: "24px" }}>
            <input required placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ padding: "12px 14px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" style={{ padding: "12px 14px", borderRadius: "12px", border: "1px solid #cbd5e1", resize: "vertical" }} />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={{ padding: "12px 14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option></select>
            <div><button type="submit" disabled={saving} style={{ border: "none", borderRadius: "10px", padding: "10px 16px", cursor: saving ? "wait" : "pointer", background: "#4f46e5", color: "#fff", fontWeight: 700 }}>{saving ? "Saving..." : editingId ? "Update task" : "Add task"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} style={{ marginLeft: "8px", padding: "10px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>Cancel</button>}</div>
        </form>
        <div style={{ display: "grid", gap: "14px" }}>{tasks.length === 0 ? <div style={{ padding: "16px", borderRadius: "16px", background: "#f8fafc" }}>No tasks yet. Add your first task above.</div> : tasks.map((task) => <div key={task._id} style={{ padding: "16px", borderRadius: "16px", background: "#f8fafc", opacity: task._id.startsWith("temporary-") ? 0.65 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start" }}><strong style={{ color: "#111111", textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</strong><span style={{ color: task.priority === "high" ? "#b91c1c" : "#475569", textTransform: "capitalize" }}>{task.priority}</span></div>
            {task.description && <p style={{ margin: "6px 0 0", color: "#374151" }}>{task.description}</p>}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}><button disabled={saving || task._id.startsWith("temporary-")} onClick={() => handleToggle(task)} style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", cursor: "pointer" }}>{task.completed ? "Mark active" : "Complete"}</button><button disabled={saving || task._id.startsWith("temporary-")} onClick={() => { setEditingId(task._id); setForm({ title: task.title, description: task.description || "", priority: task.priority || "medium" }); }} style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", cursor: "pointer" }}>Edit</button><button disabled={deletingId === task._id || task._id.startsWith("temporary-")} onClick={() => handleDelete(task)} style={{ padding: "8px 10px", border: "none", borderRadius: "8px", background: "#dc2626", color: "#fff", cursor: "pointer" }}>{deletingId === task._id ? "Deleting..." : "Delete"}</button></div>
        </div>)}</div>
    </div>;
}

export default Projects;
