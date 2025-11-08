// Loading Page/Loading.tsx
import { motion } from "framer-motion";
import Aurora from "../Aurora Background/Aurora"; // Adjust path if needed
import "../Aurora Background/Aurora.css"; // Adjust path if needed

export default function Loading() {
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
        <motion.div
          className="loading-pill"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.div>
      </div>
    </div>
  );
}