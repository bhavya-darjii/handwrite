import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Aurora from "../Aurora Background/Aurora";
import "../Aurora Background/Aurora.css";
import "./AdminDashboard.css";
import "../Onboarding/Login";

// Firebase Imports
import { db, storage, auth } from "../firebase";
import {
  collection, query, where, onSnapshot, doc, getDoc, updateDoc,
  deleteDoc, serverTimestamp, orderBy, getDocs
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";

// Shared Types
import { RequestData, SuggestionData, UserData } from "./types";

// Modules
import RequestsModule from "./RequestsModule";
import SuggestionsModule from "./SuggestionsModule";
import StatsModule from "./StatsModule";
import UsersModule from "./UsersModule";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Data States
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // --- STATS STATE ---
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRequestsCount, setTotalRequestsCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  // --- USERS LIST STATE ---
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // --- GLOBAL CREDIT UPDATE STATE ---
  const [globalCreditAmount, setGlobalCreditAmount] = useState<number | "">("");
  const [isUpdatingCredits, setIsUpdatingCredits] = useState(false);

  // --- DELETE MODAL STATE ---
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    id: string | null;
    name: string | null;
  }>({
    show: false,
    id: null,
    name: null,
  });

  // UI State
  const [activeTab, setActiveTab] = useState<"requests" | "suggestions" | "stats" | "users">("stats");

  // 1. CHECK ADMIN STATUS VIA DATABASE
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists() && userSnap.data().isAdmin === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error verifying admin:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsCheckingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. FETCH REQUESTS
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "handwriting_requests"),
      where("status", "==", "pending"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reqs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RequestData[];
        setRequests(reqs);
      },
      (error) => {
        console.error("Error fetching requests: ", error);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  // 3. FETCH SUGGESTIONS
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(
      collection(db, "app_feedback"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sugs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SuggestionData[];
      setSuggestions(sugs);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  // 4. FETCH STATS DATA
  useEffect(() => {
    if (!isAdmin || activeTab !== "stats") return;

    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnap.size);

        const reqsSnap = await getDocs(collection(db, "handwriting_requests"));
        const allReqs = reqsSnap.docs.map((d) => d.data());

        setTotalRequestsCount(reqsSnap.size);
        const comp = allReqs.filter((r: any) => r.status === "completed").length;
        setCompletedCount(comp);
        const pend = allReqs.filter((r: any) => r.status === "pending").length;

        setStatusData([
          { name: "Completed", value: comp },
          { name: "Pending", value: pend },
        ]);

        const monthMap: Record<string, number> = {};
        allReqs.forEach((r: any) => {
          if (r.createdAt) {
            const date = r.createdAt.toDate();
            const key = date.toLocaleString("default", { month: "short" });
            monthMap[key] = (monthMap[key] || 0) + 1;
          }
        });

        const chartData = Object.keys(monthMap).map((key) => ({
          name: key,
          Requests: monthMap[key],
        }));
        setMonthlyData(chartData);
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    };
    fetchStats();
  }, [isAdmin, activeTab]);

  // --- HANDLERS ---

  const handleFetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserData[];

      setAllUsers(fetchedUsers);
      setActiveTab("users");
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to fetch user list.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const initiateDeleteRequest = (requestId: string, userName: string) => {
    setDeleteModal({ show: true, id: requestId, name: userName });
  };

  const confirmDeleteRequest = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteDoc(doc(db, "handwriting_requests", deleteModal.id));
      setDeleteModal({ show: false, id: null, name: null });
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request. Check console.");
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this suggestion?");
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "app_feedback", id));
    } catch (error) {
      console.error("Error deleting suggestion:", error);
      alert("Failed to delete.");
    }
  };

  const handleGlobalCreditUpdate = async () => {
    if (!isAdmin || globalCreditAmount === "") return;
    const confirmUpdate = window.confirm(
      `CRITICAL WARNING:\n\nAre you sure you want to set ${globalCreditAmount} credits for ALL users?\n\nThis will overwrite everyone's current balance.`
    );
    if (!confirmUpdate) return;
    setIsUpdatingCredits(true);
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const updatePromises = snapshot.docs.map((userDoc) =>
        updateDoc(doc(db, "users", userDoc.id), {
          credits: Number(globalCreditAmount),
        })
      );
      await Promise.all(updatePromises);
      alert(`Success! Updated credits for ${snapshot.size} users.`);
      setGlobalCreditAmount("");
    } catch (error) {
      console.error("Error updating credits:", error);
      alert("Failed to update credits. Check console.");
    } finally {
      setIsUpdatingCredits(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, req: RequestData) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isAdmin) {
      alert("Error: Operation not permitted.");
      return;
    }
    setUploadingId(req.id);
    try {
      const fontRef = ref(storage, `user_fonts/${req.uid}/${file.name}`);
      await uploadBytes(fontRef, file);
      const downloadURL = await getDownloadURL(fontRef);

      const userRef = doc(db, "users", req.uid);
      await updateDoc(userRef, {
        customFontUrl: downloadURL,
        customFontName: file.name,
        hasCustomHandwriting: true,
      });

      const requestRef = doc(db, "handwriting_requests", req.id);
      await updateDoc(requestRef, {
        status: "completed",
        completedAt: serverTimestamp(),
      });
      alert(`Success! Font assigned to ${req.name}`);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Check console.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // --- RENDERING ---

  if (isCheckingAuth) {
    return (
      <div className="admin-page">
        <div className="admin-spinner" style={{ width: 20, height: 20, border: "2px solid #555", borderTopColor: "#fff" }}></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-bg-wrapper">
          <div className="admin-bg-inner">
            <Aurora colorStops={["#ff0000", "#000000", "#440000"]} blend={0.6} />
          </div>
        </div>
        <div className="admin-bg-overlay" />
        <div className="admin-content" style={{ maxWidth: "400px" }}>
          <h1 className="admin-404-title">Error 404</h1>
          <p className="admin-subtitle" style={{ textTransform: "none", color: "#ccc" }}>
            The page you are looking for does not exist.
          </p>
          <button className="admin-404-btn" onClick={() => navigate("/dashboard")}>
            Go Back Home
          </button>
          <button onClick={handleLogout} className="admin-text-btn">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-bg-wrapper">
        <div className="admin-bg-inner">
          <Aurora colorStops={["#ff0055", "#000000", "#5500ff"]} blend={0.6} amplitude={1.2} speed={0.4} />
        </div>
      </div>
      <div className="admin-bg-overlay" />

      <motion.button
        className="admin-logout-btn"
        onClick={handleLogout}
        whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Logout</span>
      </motion.button>

      <div className="admin-content">
        <h2 className="admin-subtitle">ADMIN CONTROL</h2>
        <h1 className="admin-title">
          <span className="admin-highlight">Dashboard</span>
        </h1>

        {/* --- TABS --- */}
        <div className="admin-glass-nav">
          <button className={`admin-tab-btn ${activeTab === "requests" ? "active" : ""}`} onClick={() => setActiveTab("requests")}>
            Requests
            {requests.length > 0 && <span className="admin-badge">{requests.length}</span>}
          </button>

          <button className={`admin-tab-btn ${activeTab === "stats" || activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>
            Stats
          </button>

          <button className={`admin-tab-btn ${activeTab === "suggestions" ? "active" : ""}`} onClick={() => setActiveTab("suggestions")}>
            Suggestions
            {suggestions.length > 0 && <span className="admin-badge" style={{ background: "#ff0055" }}>{suggestions.length}</span>}
          </button>
        </div>

        <div className="admin-tab-content">
          <AnimatePresence mode="wait">
            {/* REQUESTS MODULE */}
            {activeTab === "requests" && (
              <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ width: "100%" }}>
                <RequestsModule
                  requests={requests}
                  uploadingId={uploadingId}
                  onInitiateDelete={initiateDeleteRequest}
                  onFileUpload={handleFileUpload}
                />
              </motion.div>
            )}

            {/* SUGGESTIONS MODULE */}
            {activeTab === "suggestions" && (
              <motion.div key="suggestions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ width: "100%" }}>
                <SuggestionsModule
                  suggestions={suggestions}
                  onDelete={handleDeleteSuggestion}
                />
              </motion.div>
            )}

            {/* STATS MODULE */}
            {activeTab === "stats" && (
              <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ width: "100%" }}>
                <StatsModule
                  totalUsers={totalUsers}
                  totalRequestsCount={totalRequestsCount}
                  completedCount={completedCount}
                  suggestionsCount={suggestions.length}
                  isLoadingUsers={isLoadingUsers}
                  monthlyData={monthlyData}
                  statusData={statusData}
                  onFetchUsers={handleFetchUsers}
                  globalCreditAmount={globalCreditAmount}
                  setGlobalCreditAmount={setGlobalCreditAmount}
                  handleGlobalCreditUpdate={handleGlobalCreditUpdate}
                  isUpdatingCredits={isUpdatingCredits}
                />
              </motion.div>
            )}

            {/* USERS MODULE */}
            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={{ width: "100%" }}>
                <UsersModule
                  allUsers={allUsers}
                  isLoadingUsers={isLoadingUsers}
                  onBack={() => setActiveTab("stats")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- DELETE CONFIRMATION POPUP --- */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModal({ show: false, id: null, name: null })}
          >
            <motion.div
              className="admin-modal-container"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="admin-modal-title">Delete Request?</h3>
              <p className="admin-modal-text">
                Are you sure you want to remove the request from <span className="admin-highlight"> {deleteModal.name}</span>?
                <br /><br />
                This action is permanent and cannot be undone.
              </p>
              <div className="admin-modal-actions">
                <button className="admin-modal-cancel" onClick={() => setDeleteModal({ show: false, id: null, name: null })}>
                  Cancel
                </button>
                <button className="admin-modal-delete" onClick={confirmDeleteRequest}>
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}