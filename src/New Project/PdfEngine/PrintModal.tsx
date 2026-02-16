// PrintModal.tsx
import React from "react";
import { motion } from "framer-motion";

interface PrintModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ onClose, onConfirm }) => {
  return (
    <motion.div
      className="handwrite-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="handwrite-modal"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="handwrite-content" style={{ backgroundColor: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center", padding: "2.5rem 2rem", position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button
            className="handwrite-close"
            onClick={onClose}
            style={{ position: "absolute", top: "1rem", right: "1rem", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.2rem" }}
          >
            ×
          </button>
          <h3 style={{ color: "#fff", margin: "0 0 1rem", fontSize: "1.4rem", fontWeight: "600" }}>Hold Up, <br></br>Before you print...</h3>
          <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", textAlign: "left", color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "2rem", width: "100%", maxWidth: "350px" }}>
            <li style={{ marginBottom: "0.8rem" }}>Print on the full page without leaving any border.</li>
            <li style={{ marginBottom: "0.8rem" }}>If you want the print to be in blue ink, take color print or else take black and white print.</li>
            <li>Print Front and back or according to your requirements.</li>
          </ul>
          <button
            style={{ background: "#ffcc00", color: "#000", border: "none", borderRadius: "12px", padding: "14px 28px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", width: "100%", transition: "transform 0.2s" }}
            onClick={onConfirm}
          >
            Got it, Download PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};