import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { logout } from "../api";

function NavBar() {
    const [signedIn, setSignedIn] = useState(Boolean(localStorage.getItem("taskManagerToken")));

    useEffect(() => {
        const updateAuthState = () => setSignedIn(Boolean(localStorage.getItem("taskManagerToken")));
        window.addEventListener("auth-changed", updateAuthState);
        window.addEventListener("auth-expired", updateAuthState);
        return () => {
            window.removeEventListener("auth-changed", updateAuthState);
            window.removeEventListener("auth-expired", updateAuthState);
        };
    }, []);

    return (
        <nav style={{
            marginBottom: "24px",
            display: "flex",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "999px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
            justifyContent: "center",
            flexWrap: "wrap"
        }}>
            {signedIn && <>
                <Link to="/" style={{ textDecoration: "none", color: "#4338ca", fontWeight: 600, padding: "8px 12px", borderRadius: "999px" }}>Home</Link>
                <Link to="/about" style={{ textDecoration: "none", color: "#4338ca", fontWeight: 600, padding: "8px 12px", borderRadius: "999px" }}>About</Link>
                <Link to="/projects" style={{ textDecoration: "none", color: "#4338ca", fontWeight: 600, padding: "8px 12px", borderRadius: "999px" }}>Projects</Link>
                <Link to="/contact" style={{ textDecoration: "none", color: "#4338ca", fontWeight: 600, padding: "8px 12px", borderRadius: "999px" }}>Contact</Link>
            </>}
            {signedIn ? <button type="button" onClick={logout} style={{ color: "#4338ca", fontWeight: 600, padding: "8px 12px", border: 0, background: "transparent", cursor: "pointer" }}>Log out</button> : <Link to="/login" style={{ textDecoration: "none", color: "#4338ca", fontWeight: 600, padding: "8px 12px", borderRadius: "999px" }}>Sign in</Link>}
        </nav>
    );
}

export default NavBar;
