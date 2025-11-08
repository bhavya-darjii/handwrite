// PaymentWall.tsx
import { useState } from "react";
import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { doc, updateDoc } from "firebase/firestore"; 
// import { db } from "../firebase";
import Aurora from "../Aurora Background/Aurora";
import "../Aurora Background/Aurora.css";
import "./PaymentWall.css";

export default function PaymentWall() {
  const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
  const uid = localStorage.getItem("authToken"); // Use uid as token

//   const handleSubscribe = async () => {
//     if (!uid) return;
//     setLoading(true);
//     try {
//       // Simulate payment - in real app, integrate Stripe/Razorpay here
//       // For hardcoded: Update purchasedPro to true
//       await updateDoc(doc(db, "users", uid), {
//         purchasedPro: true,
//       });
//       setTimeout(() => {
//         navigate("/"); // Redirect to dashboard after "purchase"
//       }, 1000);
//     } catch (err: any) {
//       console.error(err);
//       alert("Subscription failed. Please try again.");
//       setLoading(false);
//     }
//   };

  const handleSubscribe = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      // Temporarily disabled - does nothing for now
      console.log("Subscription clicked - functionality disabled for now");
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      alert("Subscription failed. Please try again.");
      setLoading(false);
    }
  };

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
          Unlock Full Access to <span className="highlight">Handwrite</span>
        </motion.h1>

        <motion.div
          className="payment-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="price-box">
            <h2 className="price">₹199</h2>
            <p className="price-period">per month</p>
          </div>

          <ul className="benefits-list">
            <li>Complete access to Handwrite features.</li>
            <li>Write unlimited notes in your own handwriting</li>
            <li>Priority customer support 24/7</li>
            <li>Seamless sync across all your devices</li>
            <li>Access to premium templates and tools</li>
          </ul>

          <button 
            className="subscribe-button" 
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "Processing..." : "Subscribe Now & Start Writing"}
          </button>
        </motion.div>

        <motion.p
          className="footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          Secure payment. Cancel anytime. Your creativity deserves it.
        </motion.p>
      </div>
    </div>
  );
}