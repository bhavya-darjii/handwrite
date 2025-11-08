// Signup.tsx
import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Import auth from your Firebase config
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { 
  doc, 
  collection,
  setDoc, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore"; // Added query and where for waitlist lookup
import { db } from "../firebase";
import Aurora from "../Aurora Background/Aurora";
import "../Aurora Background/Aurora.css";
import "./Onboarding.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with name
      await updateProfile(user, { displayName: name });

      // Query waitlist for this email to get number
      let freeTrialDays = 7; // Default
      const waitlistQuery = query(collection(db, "waitlist"), where("email", "==", email));
      const waitlistSnapshot = await getDocs(waitlistQuery);
      if (!waitlistSnapshot.empty) {
        const waitlistDoc = waitlistSnapshot.docs[0];
        const waitlistData = waitlistDoc.data();
        const userNumber = waitlistData.number || 101; // Default >100 if no number
        freeTrialDays = userNumber <= 100 ? 30 : 7;
      }

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        purchasedPro: false, // Default to false
        freeTrial: freeTrialDays, // Set based on waitlist number
        createdAt: new Date(),
      });

      // Set localStorage token for persistence (in production, use Firebase's auth state)
      localStorage.setItem("authToken", user.uid);

      setTimeout(() => {
        navigate("/dashboard"); // Redirect to protected route
      }, 500);
    } catch (err: any) {
      console.error(err);
      // User-friendly error mapping
      let errorMessage = "Signup failed. Please try again.";
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email is already registered.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection and try again.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again again later.";
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
          Sign up for <span className="highlight">Handwrite</span>
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
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button disabled={loading} type="submit">
            {loading ? "Getting you in..." : "Sign Up"}
          </button>
        </motion.form>

        <motion.p
          className="footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          Already have an account? <a href="/login" style={{ color: "#ffcc00", textDecoration: "underline" }}>Sign in</a>
        </motion.p>
      </div>
    </div>
  );
}