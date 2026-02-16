// PdfPreview.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./PdfPreview.css";

// Modules
import { PdfPreviewProps } from "./PdfPreviewTypes";
import { 
  COLLEGE_CONFIG, 
  CollegeId, 
  FULL_PAGE_HEIGHT,
  VISUAL_PREVIEW_HEIGHT, 
  PREVIEW_WIDTH, 
  PADDING_LEFT, 
  FIXED_LINE_HEIGHT,
  CREDITS_PER_PAGE,
  STORAGE_KEY_TIPS,
  MAX_TIPS_COUNT 
} from "./PdfPreviewConfig";
import { parseContentToBlocks, calculatePages, calculateMarginPages } from "./PdfPreviewUtils";
import { generateAndSavePdf } from "./PdfExportHelper";
import { PrintModal } from "./PrintModal";

export default function PdfPreview({
  content,
  marginContent,
  activeFontFamily,
  isFontLoading,
  userCredits,
}: PdfPreviewProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [collegeMode, setCollegeMode] = useState<CollegeId>("none");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // 1. Get Config
  const activeConfig = COLLEGE_CONFIG[collegeMode] || COLLEGE_CONFIG["none"];
  const writableHeightLimit = FULL_PAGE_HEIGHT - activeConfig.paddingBottom;

  // 2. Parse Blocks
  const rawBlocks = useMemo(() => {
     return parseContentToBlocks(content);
  }, [content]);

  // 3. Paginate
  const pages = useMemo(() => {
    if (isFontLoading) return [{ blocks: [], isEmpty: true }];
    return calculatePages(rawBlocks, activeFontFamily, activeConfig.paddingTop, writableHeightLimit);
  }, [rawBlocks, activeFontFamily, isFontLoading, activeConfig.paddingTop, writableHeightLimit]);

  // 4. Margin Pagination
  const marginPages = useMemo(() => {
     return calculateMarginPages(marginContent, pages.length, writableHeightLimit);
  }, [marginContent, pages.length, writableHeightLimit]);

  useEffect(() => {
    if (pages.length === 0) setCurrentPage(1);
  }, [pages.length]);

  const totalCost = pages.length * CREDITS_PER_PAGE;
  const hasEnoughCredits = userCredits >= totalCost;

  // --- Handlers ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const approxPageHeight = FULL_PAGE_HEIGHT + 32; 
    const middleOfViewport = element.scrollTop + element.clientHeight / 2;
    const calculatedPage = Math.floor(middleOfViewport / approxPageHeight) + 1;
    setCurrentPage(Math.min(Math.max(calculatedPage, 1), pages.length));
  };

  const handleButtonMove = (e: any) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    btn.style.setProperty("--x", `${x}px`);
    btn.style.setProperty("--y", `${y}px`);
  };

  const handleDownloadClick = () => {
    const storedCount = localStorage.getItem(STORAGE_KEY_TIPS);
    let count = storedCount ? parseInt(storedCount) : 0;
    if (count >= MAX_TIPS_COUNT) { executePDFExport(); return; }
    
    if (count === 0 || Math.random() < 0.4) {
      setShowPrintModal(true);
      localStorage.setItem(STORAGE_KEY_TIPS, (count + 1).toString());
    } else {
      executePDFExport();
    }
  };

  const executePDFExport = async () => {
    setShowPrintModal(false);
    if (!hasEnoughCredits) { navigate("/payment-wall"); return; }
    
    setLoading(true);
    try {
      await generateAndSavePdf(totalCost);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---
  const renderedPages = pages.map((page, index) => (
    <div
      key={index}
      className="handwrite-preview-paper"
      style={{
        width: `${PREVIEW_WIDTH}px`,
        height: `${VISUAL_PREVIEW_HEIGHT}px`, 
        overflow: "hidden", 
        marginBottom: "0px",
        backgroundColor: "#fff",
        position: "relative" 
      }}
    >
      <activeConfig.Template />

      <div 
        className="handwrite-margin-column"
        style={{
            position: "absolute",
            left: "0",
            top: "0",
            bottom: "0",
            width: `70px`, 
            paddingTop: `${activeConfig.paddingTop}px`, 
            textAlign: "center",
            fontFamily: activeFontFamily,
            fontSize: "1.40rem",
            lineHeight: `25px`, 
            color: "#001299", 
            whiteSpace: "pre",
            overflow: "hidden",
            zIndex: 10
        }}
      >
        {marginPages[index] || ""} 
      </div>
      <div
        className="handwrite-paper-content"
        style={{ 
          fontFamily: activeFontFamily,
          paddingTop: `${activeConfig.paddingTop - 2}px`, 
          paddingLeft: `${PADDING_LEFT}px`,
          paddingRight: "0px",
          paddingBottom: `${activeConfig.paddingBottom}px`, 
          textAlign: "left", 
          display: "flex",
          flexDirection: "column",
          lineHeight: `${FIXED_LINE_HEIGHT}px`, 
          zIndex: 5,
          position: "relative"
        }}
      >
        {page.isEmpty && index === 0 ? (
              <div>Your notes will appear here in your own handwriting...</div>
        ) : (
            page.blocks.map((block, bIdx) => (
                <div 
                    key={bIdx} 
                    className="handwrite-text-block"
                    style={{ 
                        textAlign: block.align as any, 
                        whiteSpace: "pre-wrap", 
                        width: "100%",
                        lineHeight: `${FIXED_LINE_HEIGHT}px` 
                    }}
                >
                    {block.segments.map((seg, sIdx) => (
                      <span
                        key={sIdx}
                        style={seg.isLarge ? { 
                            fontSize: "1.25em",
                            lineHeight: `${FIXED_LINE_HEIGHT}px`,
                            display: "inline-block", 
                            verticalAlign: "bottom" 
                        } : {}}
                      >
                        {seg.text}
                      </span>
                    ))}
                </div>
            ))
        )}
      </div>
    </div>
  ));

  return (
    <>
      <motion.div
        className="handwrite-preview-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        {isFontLoading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
            Loading your personal handwriting...
          </div>
        ) : (
          <>
            {renderedPages}
            <AnimatePresence>
              {pages.length > 0 && (
                <motion.div
                  className="handwrite-page-pill-container"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <div className="handwrite-page-pill">
                    Page {currentPage} / {pages.length}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
      
      {/* EXPORT SECTION */}
      <motion.div
        className="handwrite-export-section"
        style={{ flexDirection: "column", alignItems: "center" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
{/* DROPDOWN SELECTOR - EXACT PROMPT BOX MATCH */}
<div style={{ 
    marginBottom: "35px", 
    width: "100%", 
    maxWidth: "350px", // Matches a typical prompt width
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center" // Align label to left like a form input
}}>
    <label style={{ 
        fontSize: "0.85rem", 
        color: "rgba(255, 255, 255, 0.5)", // Matches your footer/placeholder text
        marginBottom: "8px", 
        fontWeight: "500",
        marginLeft: "2px"
    }}>
      Select Paper Template
    </label>
    
    <div style={{ position: "relative", width: "100%" }}>
        <select 
          value={collegeMode}
          onChange={(e) => setCollegeMode(e.target.value as CollegeId)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            // --- EXACT MATCH FROM .handwrite-prompt-box ---
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "0.95rem",
            color: "#fff",
            fontFamily: '"Inter", sans-serif',
            // ----------------------------------------------
            cursor: "pointer",
            outline: "none",
            appearance: "none", // Hides default arrow
            fontWeight: "400",
            transition: "border 0.2s",
          }}
        >
          {Object.entries(COLLEGE_CONFIG).map(([key, config]) => (
            <option key={key} value={key} style={{ backgroundColor: "#111", color: "#fff", padding: "10px" }}>
              {config.name}
            </option>
          ))}
        </select>
        
        {/* Subtle Arrow to match the clean aesthetic */}
        <div style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "rgba(255, 255, 255, 0.4)", 
            fontSize: "0.7rem",
        }}>
            ▼
        </div>
    </div>
</div>

        <button
          className="handwrite-export-button handwrite-pdf"
          onMouseMove={handleButtonMove}
          onClick={handleDownloadClick}
          disabled={loading || isFontLoading || !content.trim()}
        >
          <span className="handwrite-btn-text">
            {loading ? "Generating..." : "Download as PDF"}
          </span>
        </button>
        <p className={`handwrite-credits-text ${!hasEnoughCredits ? "low-credits" : ""}`}>
          Page Credits Required: {totalCost} / {userCredits}
        </p>

        <button
          className="handwrite-report-btn"
          onClick={() => navigate("/contact-us")}
        >
          Report a Problem
        </button>
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {showPrintModal && (
          <PrintModal 
            onClose={() => setShowPrintModal(false)}
            onConfirm={() => executePDFExport()} 
          />
        )}
      </AnimatePresence>
    </>
  );
}