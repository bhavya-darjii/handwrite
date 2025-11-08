// Dashboard.tsx
import { motion } from "framer-motion";
import Aurora from "./Aurora Background/Aurora";
import "./Dashboard.css"; // Reuse the same CSS for consistency
import "./Aurora Background/Aurora.css";

export default function Dashboard() {
  return (
    <div className="page">
      {/* Aurora Background */}
      <div className="aurora-wrapper">
        <div className="aurora-container">
          <Aurora
            colorStops={["#ffcc00", "#FFffff", "#2969ff"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>
      </div>

      {/* Dark overlay */}
      <div className="aurora-overlay" />

      {/* Main Content */}
      <div className="center-wrapper">
        <motion.h2
          className="subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          HANDWRITE
        </motion.h2>

        <motion.h1
          className="title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Welcome to Your <span className="highlight">Handwrite</span> Dashboard
        </motion.h1>

        {/* Quick Stats Cards */}
        <div style={{ display: "flex", gap: "1rem", width: "100%", justifyContent: "center", margin: "2rem 0" }}>
          <motion.div
            className="form-box" // Reuse form-box for card-like styling
            style={{ maxWidth: "120px", padding: "1rem", background: "rgba(255, 255, 255, 0.06)", borderRadius: "10px" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 style={{ fontSize: "1.5rem", color: "#ffcc00", margin: "0 0 0.5rem" }}>5</h3>
            <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>Active Projects</p>
          </motion.div>

          <motion.div
            className="form-box"
            style={{ maxWidth: "120px", padding: "1rem", background: "rgba(255, 255, 255, 0.06)", borderRadius: "10px" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 style={{ fontSize: "1.5rem", color: "#00ff88", margin: "0 0 0.5rem" }}>12</h3>
            <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>Recent Notes</p>
          </motion.div>

          <motion.div
            className="form-box"
            style={{ maxWidth: "120px", padding: "1rem", background: "rgba(255, 255, 255, 0.06)", borderRadius: "10px" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 style={{ fontSize: "1.5rem", color: "#ffde59", margin: "0 0 0.5rem" }}>3</h3>
            <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>Pending Tasks</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="form-box"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            type="button"
            style={{
              background: "#ffcc00",
              border: "none",
              borderRadius: "10px",
              padding: "12px 14px",
              color: "#000",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
              transition: "transform 0.2s",
              width: "100%",
              marginBottom: "0.5rem"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            New Handwrite Project
          </button>
          <button
            type="button"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "12px 14px",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
              transition: "transform 0.2s",
              width: "100%"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            View All Notes
          </button>
        </motion.div>

        <motion.p
          className="footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.7 }}
        >
          Handwrite: Effortlessly capture and organize your ideas.
        </motion.p>
      </div>
    </div>
  );
}