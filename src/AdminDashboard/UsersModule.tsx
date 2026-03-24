import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { UserData } from "./types";

interface UsersModuleProps {
  allUsers: UserData[];
  isLoadingUsers: boolean;
  onBack: () => void;
}

const UsersModule: React.FC<UsersModuleProps> = ({ allUsers, isLoadingUsers, onBack }) => {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  // --- LOGIC ---

  // 1. Cycle Sort Order: Null -> Asc -> Desc -> Null
  const toggleSort = () => {
    if (sortOrder === null) setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder(null);
  };

  // 2. Filter & Sort Logic
  const processedUsers = useMemo(() => {
    // A. Filter first
    let result = allUsers.filter((user) => {
      const lowerTerm = searchTerm.toLowerCase();
      const nameMatch = (user.name || "").toLowerCase().includes(lowerTerm);
      const emailMatch = (user.email || "").toLowerCase().includes(lowerTerm);
      return nameMatch || emailMatch;
    });

    // B. Sort
    if (sortOrder) {
      // Sort by credits if active
      result.sort((a, b) => {
        const creditA = a.credits ?? 0;
        const creditB = b.credits ?? 0;
        return sortOrder === "asc" ? creditA - creditB : creditB - creditA;
      });
    } else {
      // Default: Sort by newest joined (createdAt descending)
      result.sort((a, b) => {
        const dateA = a.createdAt && typeof a.createdAt.toDate === "function" 
          ? a.createdAt.toDate().getTime() 
          : 0;
        const dateB = b.createdAt && typeof b.createdAt.toDate === "function" 
          ? b.createdAt.toDate().getTime() 
          : 0;
        
        return dateB - dateA; // Highest timestamp (newest) comes first
      });
    }

    return result;
  }, [allUsers, searchTerm, sortOrder]);

  return (
    <div>
      {/* HEADER */}
      <div className="admin-section-header">
        <button className="admin-back-btn" onClick={onBack}>
          ← Back to Stats
        </button>
        <h3 className="admin-section-title">
          All Registered Users ({allUsers.length})
        </h3>
      </div>

      {/* --- FILTERS & CONTROLS BAR --- */}
      {!isLoadingUsers && (
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
            flexWrap: "wrap", // Allows items to stack on mobile
            alignItems: "center",
          }}
        >
          {/* Search Input - Responsive Logic Applied */}
          <div 
            style={{ 
              flex: "1 1 280px", // Grow: 1, Shrink: 1, Min-Basis: 280px
              maxWidth: "100%",  // Ensures it never overflows the screen
              position: "relative" 
            }}
          >
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", 
                padding: "14px 15px",
                paddingLeft: "42px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "#fff",
                outline: "none",
                fontSize: "0.9rem",
                boxSizing: "border-box", 
              }}
            />
            {/* Search Icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          {/* Sort Button */}
          <button
            onClick={toggleSort}
            style={{
              flexShrink: 0,
              padding: "14px 20px",
              background: sortOrder ? "rgba(85, 0, 255, 0.2)" : "rgba(255, 255, 255, 0.05)",
              border: sortOrder ? "1px solid #5500ff" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: sortOrder ? "#fff" : "#ccc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
            }}
          >
            <span>Credits</span>
            {sortOrder === "asc" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            )}
            {sortOrder === "desc" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M19 12l-7 7-7-7" />
              </svg>
            )}
            {sortOrder === null && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      )}

      {/* --- USER GRID --- */}
      {isLoadingUsers ? (
        <div className="admin-spinner" style={{ margin: "50px auto", width: 40, height: 40, border: "3px solid #fff", borderTopColor: "transparent" }}></div>
      ) : (
        <>
          {processedUsers.length === 0 ? (
             <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                No users found matching "{searchTerm}"
             </div>
          ) : (
            <div className="admin-grid">
              {processedUsers.map((user) => (
                <motion.div
                  key={user.id}
                  className="admin-card user-card"
                  whileHover={{ scale: 1.01, borderColor: "rgba(255, 255, 255, 0.3)" }}
                  // Add layout prop so framer motion animates the reordering smoothly
                  layout 
                >
                  <div className="user-card-header">
                    <div className="user-avatar-placeholder">
                      {user.name ? user.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <h3 className="admin-card-name" style={{ color: "#ffffff" }}>
                        {user.name || "No Name Set"}
                      </h3>
                      <p className="admin-sub-email">{user.email || "No Email"}</p>
                    </div>
                  </div>

                  <div className="user-card-stats">
                    <div className="user-stat-row">
                      <span className="user-stat-label">Credits:</span>
                      <span className="user-stat-value" style={{ color: sortOrder ? "#00ff88" : "inherit" }}>
                        {user.credits ?? 0}
                      </span>
                    </div>
                    <div className="user-stat-row">
                      <span className="user-stat-label">UID:</span>
                      <span className="user-stat-value" style={{ fontSize: "0.7rem", fontFamily: "monospace" }}>
                        {user.id}
                      </span>
                    </div>
                    <div className="user-stat-row">
                      <span className="user-stat-label">Joined:</span>
                      <span className="user-stat-value">
                        {user.createdAt && typeof user.createdAt.toDate === "function"
                          ? user.createdAt.toDate().toLocaleDateString("en-GB")
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsersModule;