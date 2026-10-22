import React, { useState } from "react";

function Home() {
    const [showSummary, setShowSummary] = useState(true);

    return (
        <div style={{ padding: "28px", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", backdropFilter: "blur(12px)", boxShadow: "0 12px 35px rgba(15, 23, 42, 0.08)" }}>
            <h2 style={{ marginTop: 0, color: "#4f46e5" }}>Welcome to My Portfolio</h2>
            <p style={{ color: "#374151" }}>
                I’m a Computer Engineering student passionate about UI/UX design, creativity, and building meaningful digital experiences.
            </p>

            <button
                onClick={() => setShowSummary(!showSummary)}
                style={{ marginTop: "12px", padding: "10px 16px", borderRadius: "999px", border: "none", cursor: "pointer", background: "linear-gradient(90deg, #2563eb, #7c3aed)", color: "#fff", fontWeight: 700 }}
            >
                {showSummary ? "Hide Summary" : "Show Summary"}
            </button>

            {showSummary && (
                <div style={{ marginTop: "16px", padding: "14px 16px", borderRadius: "16px", background: "#f8fafc" }}>
                    <p style={{ margin: 0, color: "#111111" }}>Currently learning React, UI/UX design, and web development fundamentals while building creative projects.</p>
                </div>
            )}


        </div>
    );
}

export default Home;
