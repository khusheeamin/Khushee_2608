import React, { useEffect, useState } from "react";
import { createContact, deleteContact, getContacts, updateContact } from "../api";

const emptyForm = { name: "", message: "" };

function Contact() {
    const [contacts, setContacts] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);

    const showNotice = (type, message) => {
        setNotice({ type, message });
        window.setTimeout(() => setNotice(null), 3500);
    };

    const fetchContacts = async () => {
        setLoading(true);
        setError(null);
        try {
            setContacts(await getContacts());
        } catch (err) {
            setError(err.message || "Failed to load contacts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchContacts(); }, []);

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        const currentEditingId = editingId;
        try {
            const saved = currentEditingId ? await updateContact(currentEditingId, form) : await createContact(form);
            setContacts((current) => currentEditingId
                ? current.map((contact) => contact._id === currentEditingId ? saved : contact)
                : [saved, ...current]);
            setForm(emptyForm);
            setEditingId(null);
            showNotice("success", currentEditingId ? "Contact updated successfully." : "Contact saved successfully.");
        } catch (err) {
            setError(err.message || "The contact could not be saved.");
            showNotice("error", err.message || "The contact could not be saved.");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (contact) => {
        if (!window.confirm(`Delete the message from "${contact.name}"?`)) return;
        setDeletingId(contact._id);
        setError(null);
        try {
            await deleteContact(contact._id);
            setContacts((current) => current.filter((item) => item._id !== contact._id));
            if (editingId === contact._id) { setEditingId(null); setForm(emptyForm); }
            showNotice("success", "Contact deleted successfully.");
        } catch (err) {
            setError(err.message || "The contact could not be deleted.");
            showNotice("error", err.message || "The contact could not be deleted.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div style={{ padding: "28px", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 12px 35px rgba(15, 23, 42, 0.08)" }}>
            <h2 style={{ marginTop: 0, color: "#4f46e5" }}>Contact Me</h2>
            <p style={{ color: "#374151" }}>Send a message and it will be stored in MongoDB.</p>
            {notice && <div role="status" style={{ padding: "12px 16px", marginBottom: "12px", borderRadius: "10px", background: notice.type === "success" ? "#dcfce7" : "#fee2e2", color: notice.type === "success" ? "#166534" : "#991b1b", fontWeight: 600 }}>{notice.message}</div>}
            {error && <div role="alert" style={{ padding: "12px 16px", marginBottom: "12px", borderRadius: "10px", background: "#fff7ed", color: "#9a3412" }}>{error} <button onClick={fetchContacts} style={{ marginLeft: "8px" }}>Retry</button></div>}
            <form onSubmit={submit} style={{ display: "grid", gap: "10px", marginTop: 12 }}>
                <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" style={{ display: "block", width: "100%", padding: "10px", marginTop: "6px", borderRadius: "12px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} /></label>
                <label>Message<textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Enter your message" rows="4" style={{ display: "block", width: "100%", padding: "10px", marginTop: "6px", borderRadius: "12px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} /></label>
                <div><button type="submit" disabled={saving} style={{ padding: "10px 14px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", cursor: saving ? "wait" : "pointer" }}>{saving ? "Saving..." : editingId ? "Update contact" : "Send"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} style={{ marginLeft: "8px", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}>Cancel</button>}</div>
            </form>
            <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "2px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ color: "#4f46e5", margin: "0 0 12px" }}>Messages ({contacts.length})</h3><button onClick={fetchContacts} disabled={loading} style={{ padding: "8px 12px", borderRadius: "8px", border: "none", background: "#e0e7ff", color: "#4f46e5", cursor: "pointer", fontWeight: 600 }}>{loading ? "Loading..." : "Refresh"}</button></div>
                {loading ? <p style={{ color: "#6b7280" }}>Loading messages...</p> : contacts.length === 0 ? <p style={{ color: "#9ca3af" }}>No messages yet.</p> : <div style={{ display: "grid", gap: "12px" }}>{contacts.map((contact) => <div key={contact._id} style={{ padding: "16px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}><h4 style={{ color: "#111", margin: "0 0 6px" }}>{contact.name}</h4><p style={{ color: "#374151", margin: "0 0 8px", wordWrap: "break-word" }}>{contact.message}</p><p style={{ color: "#9ca3af", margin: "0 0 12px", fontSize: "12px" }}>{new Date(contact.createdAt).toLocaleString()}</p><button onClick={() => { setEditingId(contact._id); setForm({ name: contact.name, message: contact.message }); }} disabled={deletingId === contact._id} style={{ marginRight: "8px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff" }}>Edit</button><button onClick={() => remove(contact)} disabled={deletingId === contact._id} style={{ padding: "8px 10px", borderRadius: "8px", border: "none", background: "#dc2626", color: "#fff" }}>{deletingId === contact._id ? "Deleting..." : "Delete"}</button></div>)}</div>}
            </div>
        </div>
    );
}

export default Contact;
