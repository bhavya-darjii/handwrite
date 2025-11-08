// Login.tsx
import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Import auth from your Firebase config
import { signInWithEmailAndPassword } from "firebase/auth";
import Aurora from "../Aurora Background/Aurora";
import "./Onboarding.css";
import "../Aurora Background/Aurora.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set localStorage token for persistence (in production, use Firebase's auth state)
      localStorage.setItem("authToken", user.uid);

      setTimeout(() => {
        navigate("/dashboard"); // Redirect to protected route
      }, 500);
    } catch (err: any) {
      console.error(err);
      // User-friendly error mapping
      let errorMessage = "Invalid email or password.";
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Please enter valid credentials.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection and try again.";
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
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
          Sign in to <span className="highlight">Handwrite</span>
        </motion.h1>

        <motion.form
          className="form-box"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {error && (
            <div className="error-pill">
              {error}
            </div>
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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
          Don't have an account? <a href="/signup" style={{ color: "#ffcc00", textDecoration: "underline" }}>Sign up</a>
        </motion.p>
      </div>
    </div>
  );
}