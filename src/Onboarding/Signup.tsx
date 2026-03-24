import { useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import Aurora from "../Aurora Background/Aurora";
import "../Aurora Background/Aurora.css";
import "./Onboarding.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- UX POLISH: Clear error message when the user starts typing again ---
  useEffect(() => {
    if (error) setError("");
  }, [name, email, password, confirmPassword]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // --- NAME VALIDATION ---
    if (trimmedName.length < 2) {
      setError("Please enter your full name.");
      setLoading(false);
      return;
    }

    // --- STRICT EMAIL VALIDATION ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isInvalidEnd = trimmedEmail.endsWith(".con");

    if (!emailRegex.test(trimmedEmail) || isInvalidEnd) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // --- ROBUST PASSWORD COMPLEXITY ---
    // Requires: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: trimmedName });

      // 2. INITIALIZE USER DATA
      // Logic: Every new user gets 20 credits. 
      // Expiry is null (credits valid until they hit 0).
      
      await setDoc(doc(db, "users", user.uid), {
        name: trimmedName,
        email: trimmedEmail,
        createdAt: Timestamp.now(),

        // --- CREDIT SYSTEM ---
        credits: 20,       // Fixed amount for everyone
        expiryDate: null,  // null = No time limit on these credits

        // --- HANDWRITING RULES ---
        currentHandwriting: "default",
        lastStyleChange: null,

        // Metadata
        isNewUser: true,
      });

      localStorage.setItem("authToken", user.uid);

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

    } catch (err: any) {
      console.error(err);
      
      // --- EXHAUSTIVE FIREBASE ERROR HANDLING ---
      let errorMessage = "An unexpected error occurred. Please try again later.";
      
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered. Please sign in instead.";
          break;
        case "auth/invalid-email":
          errorMessage = "The email address provided is invalid.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Signups are currently disabled. Please contact support.";
          break;
        case "auth/weak-password":
          errorMessage = "Firebase rejected this password for being too weak.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please wait a few minutes and try again.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection.";
          break;
        case "auth/internal-error":
          errorMessage = "Our servers encountered an error. Please try again.";
          break;
      }
      
      setError(errorMessage);
    } finally {
      // Always stop loading on error so the user can try again
      if (error || !localStorage.getItem("authToken")) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="page">
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
      <div className="aurora-overlay" />
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
          Sign up for <span className="highlight">Handwrite</span>
        </motion.h1>

        <motion.form
          className="form-box"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* ACCESSIBILITY: ARIA live region for screen readers */}
          {error && (
            <div className="error-pill" role="alert" aria-live="assertive">
              {error}
            </div>
          )}
          
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading} // INPUT DISABLING
            required
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading} // INPUT DISABLING
            required
          />

          {/* PASSWORD INPUT WITH TOGGLE */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading} // INPUT DISABLING
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading} // INPUT DISABLING
            >
              {showPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>

          {/* CONFIRM PASSWORD INPUT WITH TOGGLE */}
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading} // INPUT DISABLING
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              disabled={loading} // INPUT DISABLING
            >
              {showConfirmPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>

          <button disabled={loading} type="submit">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </motion.form>
        <motion.p
          className="footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            style={{ color: "#ffcc00", textDecoration: "underline" }}
          >
            Sign in
          </a>
        </motion.p>
      </div>
    </div>
  );
}