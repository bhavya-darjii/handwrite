import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  Timestamp,
  getCountFromServer,
} from "firebase/firestore";
import Aurora from "../Aurora Background/Aurora";
import "./JoinWaitlist.css";
import "./Aurora.css";

export default function JoinWaitlist() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitlistNumber, setWaitlistNumber] = useState<number | null>(null);
  const [modalEmail, setModalEmail] = useState(""); // Store email for modal
  const [showPerks, setShowPerks] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      // Get current count + 1000
      const snapshot = await getCountFromServer(collection(db, "waitlist"));
      const nextNumber = snapshot.data().count + 1;

      await addDoc(collection(db, "waitlist"), {
        name,
        email,
        number: nextNumber,
        createdAt: Timestamp.now(),
      });

      setModalEmail(email); // Store email for modal
      setWaitlistNumber(nextNumber);
      setLoading(false);
      setSuccess(true);
      setShowPerks(false);
      // Clear form after modal shows (email preserved for display)
      setTimeout(() => {
        setName("");
        setEmail("");
      }, 100); // Tiny delay to ensure modal renders with email
    } catch (err: any) {
      console.error(err);
      alert("Oops! Something went wrong. Please try again or contact support.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setShowPerks(false);
    // Clear form after close
    setName("");
    setEmail("");
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
          Join the waitlist for <span className="highlight">Handwrite</span>!
        </motion.h1>

        <motion.form
          className="form-box"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button disabled={loading} type="submit">
            {loading ? "Adding you..." : "Continue"}
          </button>
        </motion.form>

        <motion.p
          className="footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          Handwrite is coming crazy soon. It's developed to save your time and
          efforts
        </motion.p>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="handwrite-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="handwrite-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="handwrite-content">
                {/* Animated Checkmark */}
                <motion.div
                  className="handwrite-checkmark"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: 0.1,
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="24" cy="24" r="22" fill="#00ff88" />
                    <motion.path
                      d="M14 24L21 31L34 17"
                      stroke="#000"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    />
                  </svg>
                </motion.div>

                {/* Text */}
                <h3 className="handwrite-title">
                  We’ve added you to our waiting list!
                </h3>
                <p className="handwrite-subtitle">
                  We'll let you know when Handwrite is ready.
                </p>

                {/* Email Preview Card */}
                <div className="handwrite-email-card">
                  {/* Header Box - Same color as popup (#111) */}
                  <div className="email-header-box">
                    <div className="email-header">
                      <span className="email-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" />
                        </svg>
                      </span>
                      <span className="email-address">
                        {modalEmail || email}
                      </span>
                      <span className="email-number">#{waitlistNumber}</span>
                    </div>
                  </div>
                  {!showPerks ? (
                    <p className="email-footer">
                      Handwrite is coming crazy soon. <br></br>Developed by
                      @bhavya to save your efforts.
                    </p>
                  ) : (
                    <ul className="perks-list">
                      <li>First 100 users get a month's use complimentary</li>
                      <li>You get exclusive access to Handwrite</li>
                      <li>Early beta access to new features</li>
                      <li>Priority customer support</li>
                    </ul>
                  )}
                </div>
                <p></p>

                {!showPerks && (
                  <button
                    className="perks-button"
                    onClick={() => setShowPerks(true)}
                  >
                    CHECK OUT YOUR PERKS!
                  </button>
                )}

                {/* Close Button with Faint Gradient */}
                <button className="handwrite-close" onClick={handleClose}>
                  <span className="close-inner">×</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}