import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom"; 
// Firebase Imports
import { db, auth } from "./firebase"; // Import auth here
import { doc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore"; // Added updateDoc
import { onAuthStateChanged } from "firebase/auth"; // Import Auth Listener
import Loading from "./Loading Page/Loading"; 

interface UserData {
  name: string;
  email: string;
  credits: number;           
  expiryDate: Timestamp | null; 
  currentHandwriting: string;
  lastStyleChange: Timestamp | null;
  isAdmin?: boolean; // Added optional type for admin checks
}

export default function ProtectedRoute() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    // 1. Listen to Firebase Auth State Changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      
      if (!user) {
        // --- USER IS LOGGED OUT ---
        console.log("User not authenticated. Redirecting to login...");
        localStorage.removeItem("authToken"); // Clean up storage
        setUserData(null);
        setLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      // --- USER IS LOGGED IN ---
      // 2. Set up Real-time Listener for User Data
      const userDocRef = doc(db, "users", user.uid);

      unsubscribeSnapshot = onSnapshot(userDocRef, 
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as UserData;
            
            // --- UPDATED EXPIRY LOGIC ---
            if (data.expiryDate) {
               const now = new Date();
               const expiry = data.expiryDate.toDate();
               if (now > expiry && data.credits > 0) {
                   console.log("Plan expired.");
                   // Set credits to 0 in the database
                   const userRef = doc(db, "users", user.uid);
                   updateDoc(userRef, { credits: 0 })
                    .catch(err => console.error("Auto-wipe failed:", err));
                   
                   // Update local view immediately
                   data.credits = 0;
               }
            }
            
            setUserData(data);
            setLoading(false);
          } else {
            console.error("User document not found");
            setError("Account not found.");
            setLoading(false);
            // Safety logout if doc doesn't exist
            auth.signOut(); 
            navigate("/login", { replace: true });
          }
        }, 
        (err) => {
          console.error("Error fetching user data:", err);
          setError("Failed to load account. Please log in again.");
          setLoading(false);
        }
      );
    });

    // Cleanup both listeners when component unmounts
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };

  }, [navigate]); 

  if (loading) {
    return <Loading />; 
  }

  if (error) {
    return (
      <div className="page">
        <div className="center-wrapper">
          <p style={{ color: "#ff6b6b", textAlign: "center" }}>{error}</p>
          <button 
            onClick={() => {
              auth.signOut();
              navigate("/login", { replace: true });
            }} 
            style={{ background: "#ffcc00", color: "#000", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: 'pointer' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    ); 
  }

  return userData ? <Outlet context={userData} /> : null; 
}