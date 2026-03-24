import { useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import Aurora from "../Aurora Background/Aurora";
import "./Onboarding.css";
import "../Aurora Background/Aurora.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // CHECK IF ALREADY LOGGED IN
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Clear error message when the user starts typing again
  useEffect(() => {
    if (error) setError("");
  }, [email, password]);

  // Handle viewport resize for mobile (Kept exactly as you had it)
  useEffect(() => {
    let ticking = false;
    const updateViewport = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          document.body.style.height = `${window.innerHeight}px`;
          document.documentElement.style.setProperty(
            "--vh",
            `${window.innerHeight * 0.01}px`
          );
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => updateViewport();
    const handleFocus = () => updateViewport();
    const handleBlur = () => updateViewport();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleBlur);
    });

    updateViewport();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      inputs.forEach((input) => {
        input.removeEventListener("focus", handleFocus);
        input.removeEventListener("blur", handleBlur);
      });
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    // Basic frontend validation to save a network request
    if (!trimmedEmail || !password) {
      setError("Please enter both your email and password.");
      setLoading(false);
      return;
    }

    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      const user = userCredential.user;

      // 2. CHECK ROLE: Fetch the User Document
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let isAdmin = false;

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.isAdmin === true) {
            isAdmin = true;
        }
      }

      // Set localStorage token
      localStorage.setItem("authToken", user.uid);

      // 3. Redirect based on role
      setTimeout(() => {
        if (isAdmin) {
            navigate("/admin-dashboard", { replace: true });
        } else {
            navigate("/dashboard", { replace: true });
        }
      }, 500);

    } catch (err: any) {
      console.error("Login Error:", err);
      
      // --- EXHAUSTIVE FIREBASE ERROR HANDLING ---
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      switch (err.code) {
        // Modern Firebase returns this for both wrong password and missing user
        case "auth/invalid-credential": 
        // Legacy codes (kept just in case)
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled. Please contact support.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later or reset your password.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection and try again.";
          break;
      }
      
      setError(errorMessage);
    } finally {
      // Ensure loading state is turned off if there's an error
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
          Sign in to <span className="highlight">Handwrite</span>
        </motion.h1>

        <motion.form
          className="form-box"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* ARIA live region for accessibility screen readers */}
          {error && (
            <div className="error-pill" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
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

          <button disabled={loading} type="submit">
            {loading ? "Getting you in..." : "Sign In"}
          </button>
        </motion.form>

        <motion.p
          className="footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          Don't have an account?{" "}
          <a
            href="/signup"
            style={{ color: "#ffcc00", textDecoration: "underline" }}
          >
            Sign up
          </a>
        </motion.p>

        {/* Optional but recommended: Forgot Password Link */}
        <motion.p
          className="footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: "10px" }}
        >
          {/* <a
            href="/forgot-password"
            style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}
          >
            Forgot your password?
          </a> */}
        </motion.p>
      </div>
    </div>
  );
}