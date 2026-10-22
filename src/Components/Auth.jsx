import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";

function Auth() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            if (mode === "register") await register(form);
            await login(form);
            navigate("/projects");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return <main style={{ maxWidth: "480px", margin: "0 auto", padding: "28px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
        <h2 style={{ marginTop: 0, color: "#4f46e5" }}>{mode === "login" ? "Sign in" : "Create an account"}</h2>
        {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
        <form onSubmit={submit} style={{ display: "grid", gap: "12px" }}>
            <input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "10px" }} />
            <input required minLength="8" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "10px" }} />
            <button disabled={submitting} type="submit" style={{ padding: "12px", border: 0, borderRadius: "10px", background: "#4f46e5", color: "#fff", fontWeight: 700 }}>{submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Register"}</button>
        </form>
        <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ marginTop: "16px", border: 0, background: "transparent", color: "#4338ca", cursor: "pointer" }}>
            {mode === "login" ? "Need an account? Register" : "Already registered? Sign in"}
        </button>
    </main>;
}

export default Auth;