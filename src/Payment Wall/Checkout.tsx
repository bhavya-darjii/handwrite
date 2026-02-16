import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
// NOTE: We removed direct Firestore imports (doc, updateDoc, etc.)
// because the backend now handles the database updates.
import Aurora from "../Aurora Background/Aurora";
import "./Checkout.css";

// Declare Razorpay on window to avoid TS errors
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const uid = localStorage.getItem("authToken");

  // 1. GATEKEEPER LOGIC
  useEffect(() => {
    if (!location.state || !location.state.plan) {
      console.warn("Direct access denied. Redirecting to Payment Wall...");
      navigate("/payment-wall", { replace: true });
    }
  }, [location, navigate]);

  const { plan } = location.state || {};

  const handlePayment = async () => {
    if (!uid) {
      alert("User ID missing. Please log in again.");
      return;
    }

    if (!window.Razorpay) {
      return alert("Razorpay SDK not loaded. Please check your internet connection.");
    }

    setLoading(true);

    try {
      // --- STEP 1: Create Order via Backend ---
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: plan.price }), // Sending plan price
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create order on server");
      }

      const orderData = await orderRes.json();

      if (!orderData.id) {
        throw new Error("Invalid order data received from server");
      }

      // --- STEP 2: Configure Razorpay with Server Data ---
      const options = {
        key: orderData.razorpay_public_key, // Received from backend!
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HANDWRITE",
        description: `Purchase ${plan.label} Pack`,
        order_id: orderData.id, // <--- CRITICAL: The secure Order ID
        
        handler: async function (response: any) {
          console.log("Payment authorized, verifying signature...");
          
          try {
            // --- STEP 3: Verify & Update DB via Backend ---
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: uid,
                creditsToAdd: plan.credits, // Tell backend how many credits to add
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.status === 'ok') {
               // --- STEP 4: Success Navigation ---
               // We use the expiry date returned by the server to ensure sync
               navigate("/success", { 
                 state: { expiry: verifyData.newExpiry },
                 replace: true 
               });
            } else {
               throw new Error(verifyData.message || "Verification failed");
            }

          } catch (error: any) {
            console.error("Verification error:", error);
            alert("Payment successful, but verification failed: " + error.message);
            // Don't set loading false here, keeps user from double paying while they check status
          }
        },
        prefill: {
          email: "", 
          contact: "" 
        },
        theme: { color: "#ffcc00" },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any){
          console.error("Payment Failed:", response.error);
          alert("Payment Failed: " + response.error.description);
          setLoading(false);
      });

      rzp.open();

    } catch (err: any) {
      console.error("Checkout initialization error:", err);
      alert("Could not initiate payment: " + err.message);
      setLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <div className="checkout-page">
      <div className="payment-wall-aurora-wrapper">
        <Aurora colorStops={["#ffcc00", "#FFffff", "#2969ff"]} speed={0.5} />
      </div>
      <div className="payment-wall-aurora-overlay" />
      <motion.div
        className="checkout-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="checkout-back-link" onClick={() => navigate(-1)}>
          ← Change Plan
        </button>
        <h1 className="checkout-header">
          Confirm <span className="payment-wall-highlight">Order</span>
        </h1>
        <div className="checkout-summary">
          <div className="summary-item">
            <span>Plan</span>
            <span className="summary-bold">{plan.label}</span>
          </div>
          <div className="summary-item">
            <span>Credits</span>
            <span className="summary-bold">{plan.credits} Page Credits</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item total">
            <span>Payable</span>
            <span className="checkout-total-price">₹{plan.price}</span>
          </div>
        </div>
        <motion.button
          className="checkout-pay-button"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay ₹${plan.price} Securely`}
        </motion.button>
      </motion.div>
    </div>
  );
}