import React from "react";
import { motion } from "framer-motion";
import { RequestData } from "./types";

interface RequestsModuleProps {
  requests: RequestData[];
  uploadingId: string | null;
  onInitiateDelete: (id: string, name: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, req: RequestData) => void;
}

const RequestsModule: React.FC<RequestsModuleProps> = ({
  requests,
  uploadingId,
  onInitiateDelete,
  onFileUpload,
}) => {
  if (requests.length === 0) {
    return (
      <div className="admin-empty-state">
        <p style={{ color: "#888", margin: 0 }}>All caught up! No pending requests.</p>
      </div>
    );
  }

  return (
    <div className="admin-grid">
      {requests.map((req) => (
        <motion.div
          key={req.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="admin-card"
        >
          <div>
            <div className="admin-card-header">
              <h3 className="admin-card-name">{req.name}</h3>
              <span
                className="admin-status-pill delete-hover"
                onClick={() => onInitiateDelete(req.id, req.name)}
                title="Click to delete this request"
              >
                PENDING
              </span>
            </div>

            <div className="admin-card-details">
              <div className="admin-detail-row">
                {/* Email Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {req.email}
              </div>
              <div className="admin-detail-row">
                {/* Phone Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                {req.phone}
              </div>
              <div className="admin-detail-row">
                {/* Date Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {req.createdAt?.toDate().toLocaleDateString("en-GB") || "Just now"}
              </div>
            </div>
          </div>

          {uploadingId === req.id ? (
            <div className="admin-processing-box">
              <div className="admin-spinner" style={{ width: 15, height: 15, border: "2px solid #00ff88", borderTopColor: "transparent" }}></div>
              <p className="admin-processing-text">Processing Font...</p>
            </div>
          ) : (
            <motion.label
              className="admin-upload-label"
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.08)", borderColor: "rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="admin-upload-text">Upload Font File (.ttf)</span>
              <input type="file" accept=".ttf, .otf" onChange={(e) => onFileUpload(e, req)} style={{ display: "none" }} />
            </motion.label>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default RequestsModule;