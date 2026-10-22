import React from "react";

function Footer() {
	return (
		<footer style={{ marginTop: 28, padding: "18px 12px", textAlign: "center", color: "#e2e8f0", opacity: 0.95 }}>
			<div style={{ fontSize: "0.95rem", color: "#f8fafc" }}>© {new Date().getFullYear()} Khushee Amin </div>
			<div style={{ marginTop: 8, fontSize: "0.9rem", color: "#cbd5e1" }}>
				Thanks for visiting my portfolio.
			</div>
		</footer>
	);
}

export default Footer;

