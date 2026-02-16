import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import Aurora from "../Aurora Background/Aurora";
import { useEffect } from "react";
import "./Success.css";

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const expiryDateFromState = location.state?.expiry;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Format Date Function: 15 Jan 2026
  const formatExpiryDate = (isoString: string) => {
    if (!isoString) return "30 Days from today";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="success-page">
      <div className="payment-wall-aurora-wrapper">
        <Aurora colorStops={["#00ff88", "#FFffff", "#2969ff"]} speed={0.5} />
      </div>
      <div className="payment-wall-aurora-overlay" />
      
      <motion.div 
        className="success-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="success-checkmark-svg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.1 }}
        >
          <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#00ff88" />
            <motion.path
              d="M14 24L21 31L34 17"
              stroke="#000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            />
          </svg>
        </motion.div>

        <h1 className="success-title">
          Payment <span className="payment-wall-highlight">Successful</span>
        </h1>
        
        <p className="success-message">
          Your credit pack has been activated. Your balance is updated and you can now continue generating handwritten pages.
        </p>
        
        <div className="success-details-box">
          <div className="detail-row">
            <span>Payment Status</span>
            <span className="status-badge">Confirmed</span>
          </div>

          {/* NEW EXPIRY ROW */}
          <div className="detail-row" style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
            <span>Credits Expiry</span>
            <span style={{ color: "#ffcc00", fontWeight: "700" }}>
               {formatExpiryDate(expiryDateFromState)}
            </span>
          </div>
        </div>

        <motion.button 
          className="success-home-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}