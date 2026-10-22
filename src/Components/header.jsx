import React from "react";

function Header() {
    return (
        <header style={{
            marginBottom: "20px",
            padding: "20px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            textAlign: "center",
            color: "#f8fafc"
        }}>
            <p style={{ textTransform: "uppercase", letterSpacing: "3px", color: "#f9a8d4", margin: 0, fontSize: "0.85rem" }}>
                Computer Engineering Student
            </p>
            <h1 style={{ margin: "6px 0 0 0", fontSize: "2rem" }}>Khushee Amin</h1>
            <p style={{ margin: "6px 0 0 0", color: "#e2e8f0" }}>
                Crafting immersive digital experiences through design and code.
            </p>
        </header>
    );
}

export default Header;
