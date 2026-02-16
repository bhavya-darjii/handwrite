import React from "react";
import { motion } from "framer-motion";
import { SuggestionData } from "./types";

interface SuggestionsModuleProps {
  suggestions: SuggestionData[];
  onDelete: (id: string) => void;
}

const renderStars = (rating: number) => {
  return (
    <div className="admin-star-display">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= rating ? "#ffcc00" : "rgba(255,255,255,0.2)"} stroke="none">
          <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
        </svg>
      ))}
    </div>
  );
};

const SuggestionsModule: React.FC<SuggestionsModuleProps> = ({ suggestions, onDelete }) => {
  if (suggestions.length === 0) {
    return (
      <div className="admin-empty-state">
        <p style={{ color: "#888", margin: 0 }}>No feedback received yet.</p>
      </div>
    );
  }

  return (
    <div className="admin-grid">
      {suggestions.map((sug) => (
        <motion.div key={sug.id} whileHover={{ scale: 1.01 }} className="admin-card admin-suggestion-card">
          <div className="admin-suggestion-header">
            <div>
              <h3 className="admin-card-name">{sug.name || "Anonymous"}</h3>
              <p className="admin-sub-email">{sug.email}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {renderStars(sug.rating)}
              <button className="admin-delete-btn" onClick={() => onDelete(sug.id)} title="Delete Feedback">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>
          <div className="admin-suggestion-body">"{sug.suggestion}"</div>
          <div className="admin-suggestion-footer">
            <span>Received: {sug.createdAt?.toDate().toLocaleDateString("en-GB") || "Just now"}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SuggestionsModule;