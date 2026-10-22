import React from "react";
import Skills from "./skills";

function AboutMe() {
    return (
        <section style={{ padding: "20px", borderRadius: 16, background: "#ffffff", border: "1px solid #e2e8f0", color: "#111111" }}>
            <h2 style={{ marginTop: 0, color: "#4f46e5" }}>About Me</h2>
            <p>
                I’m Khushee, a Computer Engineering student focused on building beautiful, accessible user
                interfaces and learning full-stack web development. I enjoy problem solving, UI/UX, and creative
                coding projects.
            </p>
            <p>
                I’m currently strengthening my skills in React, JavaScript, responsive design, and backend
                development with Node.js, Express, and MongoDB. I enjoy turning ideas into practical applications
                that are easy to use, visually clear, and useful in everyday life.
            </p>
            <p>
                My goal is to grow as a thoughtful software developer by combining technical knowledge with
                creativity and attention to detail. I’m always curious to learn new tools, improve my projects,
                and collaborate on meaningful digital experiences.
            </p>

            <div style={{ marginTop: 12 }}>
                <Skills />
            </div>
        </section>
    );
}

export default AboutMe;

