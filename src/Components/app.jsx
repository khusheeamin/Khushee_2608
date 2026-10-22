import React, { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./footer";
import Home from "./Home";
import AboutMe from "./Aboutme";
import Auth from "./Auth";

const Projects = lazy(() => import("./Projects"));
const Contact = lazy(() => import("./Contact"));

function PageLoading() {
    return (
        <div role="status" aria-live="polite" style={{ padding: "40px 20px", textAlign: "center", color: "#4f46e5", fontWeight: 700 }}>
            Loading page...
        </div>
    );
}

function RequireAuth({ children }) {
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

    return signedIn ? children : <Navigate to="/login" replace />;
}

function EntryRoute() {
    return localStorage.getItem("taskManagerToken") ? <Home /> : <Navigate to="/login" replace />;
}

function App() {
    return (
        <div style={{
            fontFamily: "Poppins, Arial, sans-serif",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 55%, #f1f5f9 100%)",
            color: "#111111",
            padding: "24px"
        }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <header style={{
                    marginBottom: "20px",
                    padding: "24px",
                    borderRadius: "24px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    backdropFilter: "blur(14px)",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)"
                }}>
                    <p style={{ textTransform: "uppercase", letterSpacing: "3px", color: "#4f46e5", fontSize: "0.8rem", marginBottom: "6px" }}>
                        Computer Engineering Student
                    </p>
                    <h1 style={{ fontSize: "2.4rem", margin: "0 0 8px 0", color: "#111111" }}>Khushee Amin</h1>

                </header>

                <NavBar />

                <Suspense fallback={<PageLoading />}>
                    <Routes>
                        <Route path="/login" element={<Auth />} />
                        <Route path="/" element={<EntryRoute />} />
                        <Route path="/about" element={<RequireAuth><AboutMe /></RequireAuth>} />
                        <Route path="/projects" element={<RequireAuth><Projects /></RequireAuth>} />
                        <Route path="/contact" element={<RequireAuth><Contact /></RequireAuth>} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export default App;