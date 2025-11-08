// ProtectedRoute.tsx
import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom"; // Added useLocation
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Loading from "./Loading Page/Loading"; // Import the Loading component

interface UserData {
  createdAt: any; // Timestamp or Date
  freeTrial: number;
  purchasedPro: boolean;
  // Add other fields as needed
}

export default function ProtectedRoute() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Added error state for fallback
  const navigate = useNavigate();
  const location = useLocation(); // Get current path
  const token = localStorage.getItem("authToken"); // uid as token

  useEffect(() => {
    const checkAuthAndTrial = async () => {
      console.log("Starting checkAuthAndTrial for path:", location.pathname); // Debug path
      if (!token) {
        console.log("No token, redirecting to login");
        navigate("/login");
        return;
      }

      try {
        console.log("Fetching user doc for token:", token); // Debug fetch
        const userDoc = await getDoc(doc(db, "users", token));
        console.log("User doc fetched, exists:", userDoc.exists()); // Debug exists

        if (!userDoc.exists()) {
          console.log("User doc not found, redirecting to login");
          navigate("/login");
          return;
        }

        const data = userDoc.data() as UserData;
        console.log("User data fetched:", data); // Debug data
        setUserData(data);

        // Skip trial check if current path is payment-wall (to avoid loop)
        if (location.pathname === "/payment-wall") {
          console.log("On payment wall - allowing access");
          setLoading(false);
          return;
        }

        // Handle Timestamp from Firestore
        const createdAtDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        const createdAt = createdAtDate.getTime();
        const now = new Date().getTime();
        const daysElapsed = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
        console.log("Days elapsed:", daysElapsed, "Free trial:", data.freeTrial); // Debug calculation

        const isPro = data.purchasedPro;

        // Logic 1: Immediate block if freeTrial is 0 and not pro
        const immediateBlock = data.freeTrial === 0 && !isPro;

        // Logic 2: Time-based expiration if freeTrial > 0
        const trialExpired = daysElapsed > data.freeTrial;

        console.log("Immediate block:", immediateBlock, "Trial expired:", trialExpired, "Is Pro:", isPro); // Debug logic

        if (immediateBlock || (trialExpired && !isPro)) {
          console.log("Blocked - redirecting to payment wall");
          navigate("/payment-wall");
          return;
        }

        // If neither block triggers, allow allow access
        console.log("Access granted");
        setLoading(false);
        setError(""); // Clear any error
      } catch (err) {
        console.error("Error in checkAuthAndTrial:", err);
        setError("Failed to load user data. Please log in again.");
        setLoading(false);
      }
    };

    checkAuthAndTrial();
  }, [navigate, token, location.pathname]); // Added location.pathname to deps for re-check on path change

  if (loading) {
    return <Loading />; // Use the loading page
  }

  if (error) {
    return (
      <div className="page">
        <div className="center-wrapper">
          <p style={{ color: "#ff6b6b", textAlign: "center" }}>{error}</p>
          <button onClick={() => navigate("/login")} style={{ background: "#ffcc00", color: "#000", border: "none", padding: "10px 20px", borderRadius: "10px" }}>
            Go to Login
          </button>
        </div>
      </div>
    ); // Error fallback with UI
  }

  return userData ? <Outlet /> : null; // Render child routes if valid
}