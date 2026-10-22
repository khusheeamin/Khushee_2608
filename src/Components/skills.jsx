import React from "react";

const SKILLS = [
    "HTML",
    "CSS",
    "JavaScript",
    "Figma",

];

function SkillBar({ name }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "flex-start", fontWeight: 700, color: "#111111" }}>
                <span>{name}</span>
            </div>

            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 8, marginTop: 8 }}>
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        background: "linear-gradient(90deg,#e5e7eb,#e9d5ff)",
                        borderRadius: 8,
                    }}
                />
            </div>
        </div>
    );
}

function Skills() {
    return (
        <div style={{ padding: "28px", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", backdropFilter: "blur(12px)", boxShadow: "0 12px 35px rgba(15, 23, 42, 0.08)" }}>
            <h2 style={{ marginTop: 0, color: "#4f46e5" }}>Skills</h2>
            <p style={{ color: "#374151" }}>Tools and technologies I use regularly.</p>

            <div style={{ marginTop: 12 }}>
                {SKILLS.map((s) => (
                    <SkillBar key={s} name={s} />
                ))}
            </div>
        </div>
    );
}

export default Skills;
