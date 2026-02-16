import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import Aurora from "../Aurora Background/Aurora";
import "./Dashboard.css";
import "../Aurora Background/Aurora.css";

// --- FIREBASE IMPORTS ---
import { auth, db } from "../firebase";
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
// ------------------------

export default function Dashboard() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number>(0);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // User Data State
  const [userName, setUserName] = useState("");
  
  // NEW: State to hide button if request is completed
  const [hasCompletedHandwriting, setHasCompletedHandwriting] = useState(false);

  // Modal States
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Phone Input State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // --- FETCH DATA & CHECK ROLE ---
  useEffect(() => {
    // Define unsubscribe functions outside to handle cleanup correctly
    let unsubscribeSnapshot: (() => void) | undefined;
    let unsubscribeRequests: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      // Clean up previous listeners on auth change
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubscribeRequests) unsubscribeRequests();

      if (user) {
        const userRef = doc(db, "users", user.uid);

        // 1. CHECK FOR ADMIN ROLE FIRST
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().isAdmin === true) {
          navigate("/admin-dashboard");
          return;
        }

        // 2. IF NOT ADMIN, LISTEN FOR USER DATA
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCredits(data.credits || 0);
            setUserEmail(data.email || user.email || "");
            setUserName(data.name || user.displayName || "Unknown User");

            // --- WELCOME POPUP LOGIC ---
            if (data.isNewUser === true && data.hasSeenWelcomePopup !== true) {
              setTimeout(() => setShowWelcomeModal(true), 500);
            }

            // --- FEEDBACK POPUP LOGIC ---
            const todayStr = new Date().toDateString();
            const lastFeedbackDate = localStorage.getItem("handwrite_last_feedback_date");

            if (lastFeedbackDate !== todayStr && !data.isNewUser) {
                const randomChance = Math.random(); 
                if (randomChance > 0.5) {
                    setTimeout(() => {
                        setShowFeedbackModal(true);
                        localStorage.setItem("handwrite_last_feedback_date", todayStr);
                    }, 4000); 
                }
            }

            setIsLoading(false);
          }
        });

        // 3. LISTEN FOR HANDWRITING REQUEST STATUS
        // FIX: We query ONLY by uid to avoid Indexing errors, then check status in code.
        const requestsRef = collection(db, "handwriting_requests");
        const q = query(
            requestsRef, 
            where("uid", "==", user.uid)
        );

        unsubscribeRequests = onSnapshot(q, (snapshot) => {
            // Check if ANY document in the result has status === "completed"
            const isCompleted = snapshot.docs.some(doc => doc.data().status === "completed");
            
            if (isCompleted) {
                setHasCompletedHandwriting(true);
            } else {
                setHasCompletedHandwriting(false);
            }
        });

      } else {
        setIsLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        if (unsubscribeRequests) unsubscribeRequests();
    };
  }, [navigate]);

  // --- HANDLERS ---

  const handleNewProject = () => {
    navigate("/new-project");
  };

  const handleMakeOwnHandwriting = () => {
    setShowPhoneModal(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError("");
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) {
      setPhoneNumber(val);
    }
  };

  const handleCloseWelcome = async () => {
    setShowWelcomeModal(false);
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        hasSeenWelcomePopup: true,
        isNewUser: false,
      });
    }
  };

  // --- FEEDBACK SUBMIT HANDLER ---
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) return;

      setIsSubmittingFeedback(true);
      try {
          await addDoc(collection(db, "app_feedback"), {
              uid: user.uid,
              name: userName,
              email: userEmail,
              rating: feedbackRating,
              suggestion: feedbackText,
              createdAt: serverTimestamp(),
          });
          
          setShowFeedbackModal(false);
          setFeedbackRating(0);
          setFeedbackText("");
          
          localStorage.setItem("handwrite_last_feedback_date", new Date().toDateString());

      } catch (err) {
          console.error("Error sending feedback:", err);
      } finally {
          setIsSubmittingFeedback(false);
      }
  };

// Submit Logic for Phone
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (phoneNumber.length !== 10) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setFormError("You must be logged in.");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestsRef = collection(db, "handwriting_requests");
      
      const q = query(
        requestsRef, 
        where("phone", "==", phoneNumber), 
        where("uid", "==", user.uid)
      );
      
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setFormError("You have already submitted a request with this number.");
        setIsSubmitting(false);
        return;
      }

      const safeName = userName || "Unknown User";
      
      await addDoc(collection(db, "handwriting_requests"), {
        uid: user.uid,
        name: safeName, 
        email: userEmail,
        phone: phoneNumber,
        createdAt: serverTimestamp(),
        status: "pending",
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        phoneNumber: phoneNumber,
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setPhoneNumber("");
    } catch (error: any) {
      console.error("Error submitting request:", error);
      if (error.code === 'permission-denied') {
         setFormError("Permission denied. Please refresh and try again.");
      } else {
         setFormError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  const handleClosePhoneModal = () => {
    setShowPhoneModal(false);
    setTimeout(() => {
      setSubmitSuccess(false);
      setPhoneNumber("");
      setFormError("");
    }, 300);
  };

  // --- LOADING SCREEN ---
  if (isLoading) {
    return (
      <div className="dashboard-root-page" style={{ justifyContent: "center" }}>
        <div className="dashboard-bg-wrapper">
          <div className="dashboard-bg-inner">
            <Aurora
              colorStops={["#ffcc00", "#FFffff", "#2969ff"]}
              blend={0.5}
            />
          </div>
        </div>
        <div
          style={{
            width: "30px",
            height: "30px",
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "#ffcc00",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-root-page">
      <div className="dashboard-bg-wrapper">
        <div className="dashboard-bg-inner">
          <Aurora
            colorStops={["#ffcc00", "#FFffff", "#2969ff"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>
      </div>

      <div className="dashboard-bg-overlay" />

      <div className="dashboard-main-content">
        <motion.h2
          className="dashboard-text-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          HANDWRITE
        </motion.h2>

        <motion.h1
          className="dashboard-text-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Let's Start
          <span className="dashboard-text-highlight"> Handwriting.</span>
        </motion.h1>

        <motion.div
          className="dashboard-controls-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            type="button"
            className="dashboard-btn-primary"
            onClick={handleNewProject}
          >
            New Handwrite Project
          </button>

          <div className="dashboard-credits-wrapper">
            <span className="dashboard-credits-label-text">
              Available Page Credits:
            </span>
            <span className="dashboard-credits-count-text">{credits}</span>
          </div>

          {/* CONDITIONAL RENDERING: Button hides if hasCompletedHandwriting is true */}
          {!hasCompletedHandwriting && (
            <button
              type="button"
              className="dashboard-btn-secondary-pill"
              onClick={handleMakeOwnHandwriting}
            >
              Make Your Own Handwriting!
            </button>
          )}

        </motion.div>

        <motion.p
          className="dashboard-text-footer-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.7 }}
        >
          Effortlessly capture and organize your ideas.
        </motion.p>
      </div>

      <motion.div
        className="dashboard-legal-bar-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Link to="/disclaimer" className="dashboard-legal-link-item">
          Disclaimer
        </Link>
        <Link to="/privacy-policy" className="dashboard-legal-link-item">
          Privacy Policy
        </Link>
        <Link to="/terms-of-use" className="dashboard-legal-link-item">
          Terms of Use
        </Link>
        <Link to="/contact-us" className="dashboard-legal-link-item">
          Contact Us
        </Link>
      </motion.div>

      {/* ============================================================ */}
      {/* 1. WELCOME POPUP (Unlimited Credits)                         */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            className="handwrite-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseWelcome}
          >
            <motion.div
              className="handwrite-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="handwrite-content"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <button
                  className="handwrite-close"
                  onClick={handleCloseWelcome}
                >
                  <span className="close-inner">×</span>
                </button>

                <motion.div
                  className="handwrite-checkmark"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.1 }}
                  style={{ marginBottom: "1rem" }}
                >
                  <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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

                <h3 className="handwrite-title" style={{ color: "#fff" }}>Congratulations!</h3>
                <p className="handwrite-subtitle" style={{ color: "#fff" }}>
                  You just got <b>10 Free Credits</b> for trying out Handwrite.
                </p>
                <p className="handwrite-subtitle" style={{ fontSize: "0.9rem" }}>
                  Use our app freely and tell us how you like it. We are building this for you.
                </p>

                <button
                  className="dashboard-btn-primary"
                  onClick={handleCloseWelcome}
                  style={{ marginTop: "1rem" }}
                >
                  Awesome, Let's Go!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 2. FEEDBACK POPUP                                            */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            className="handwrite-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowFeedbackModal(false)}
          >
            <motion.div
              className="handwrite-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="handwrite-content"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <button
                  className="handwrite-close"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  <span className="close-inner">×</span>
                </button>

                <h3 className="handwrite-title" style={{ color: "#fff", marginBottom: "1rem" }}>
                  How are you liking Handwrite?
                </h3>

                {/* 5 STARS RATING */}
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "1.5rem" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                            key={star}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setFeedbackRating(star)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            <svg width="37" height="37" viewBox="0 0 24 24" fill={star <= feedbackRating ? "#ffcc00" : "none"} stroke="#ffcc00" strokeWidth="1.5">
                                <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                            </svg>
                        </motion.button>
                    ))}
                </div>

                <form onSubmit={handleFeedbackSubmit} className="form-box">
                    <textarea
                        placeholder="Suggest any improvements we could bring to Handwrite..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="handwrite-input-styled"
                        style={{ resize: "vertical", minHeight: "150px", fontFamily: "inherit" }}
                    />
                    
                    <button
                        disabled={isSubmittingFeedback || feedbackRating === 0}
                        type="submit"
                        className="dashboard-btn-primary"
                        style={{ marginTop: "1rem" }}
                    >
                        {isSubmittingFeedback ? "Sending..." : "Send Feedback"}
                    </button>
                </form>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 3. PHONE NUMBER MODAL                                        */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showPhoneModal && (
          <motion.div
            className="handwrite-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClosePhoneModal}
          >
            <motion.div
              className="handwrite-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="handwrite-content">
                <button
                  className="handwrite-close"
                  onClick={handleClosePhoneModal}
                >
                  <span className="close-inner">×</span>
                </button>

                {!submitSuccess ? (
                  <>
                    <h3 className="handwrite-title">
                      Digitize Your Handwriting
                    </h3>
                    <p className="handwrite-subtitle">
                      Enter your phone number. We'll reach out to you within
                      24-48 hours.
                    </p>

                    <form className="form-box" onSubmit={handlePhoneSubmit}>
                      <input
                        type="tel"
                        placeholder="Phone Number (10 digits)"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        className="handwrite-input-styled"
                      />

                      {formError && (
                        <div className="error-pill">{formError}</div>
                      )}

                      <button
                        disabled={isSubmitting || phoneNumber.length < 10}
                        type="submit"
                        className="dashboard-btn-primary"
                      >
                        {isSubmitting ? "Submitting..." : "Request Processing"}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
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

                    <h3 className="handwrite-title">Request Received!</h3>

                    <div className="handwrite-email-card">
                      <div className="email-header-box">
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            color: "#fff",
                            textAlign: "center",
                          }}
                        >
                          The Handwrite Team will reach out to you within 24-48
                          hours.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}