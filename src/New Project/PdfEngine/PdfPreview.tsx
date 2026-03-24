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
  PADDING_RIGHT, // IMPORT ADDED HERE
  FIXED_LINE_HEIGHT, 
  CREDITS_PER_PAGE,
  STORAGE_KEY_TIPS,
  MAX_TIPS_COUNT 
} from "./PdfPreviewConfig";
import { parseContentToBlocks, calculatePages } from "./PdfPreviewUtils";
import { generateAndSavePdf } from "./PdfExportHelper"; 
import { PrintModal } from "./PrintModal";

export default function PdfPreview({
  content,
  activeFontFamily,
  isFontLoading,
  userCredits,
  globalScale = 1,
  expiryDate, 
}: PdfPreviewProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [collegeMode, setCollegeMode] = useState<CollegeId>("none");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const isFreeUser = !expiryDate;

  const activeConfig = COLLEGE_CONFIG[collegeMode] || COLLEGE_CONFIG["none"];
  const writableHeightLimit = FULL_PAGE_HEIGHT - activeConfig.paddingBottom;

  const rawBlocks = useMemo(() => {
      return parseContentToBlocks(content);
  }, [content]);

  const pages = useMemo(() => {
    if (isFontLoading) return [{ blocks: [], isEmpty: true }];
    return calculatePages(rawBlocks, activeFontFamily, activeConfig.paddingTop, writableHeightLimit, globalScale);
  }, [rawBlocks, activeFontFamily, isFontLoading, activeConfig.paddingTop, writableHeightLimit, globalScale]);

  useEffect(() => {
    if (pages.length === 0) setCurrentPage(1);
  }, [pages.length]);

  const totalCost = pages.length * CREDITS_PER_PAGE;
  const hasEnoughCredits = userCredits >= totalCost;

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
      await generateAndSavePdf(totalCost, isFreeUser); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

      {isFreeUser && (
        <div className="handwrite-watermark">
          Created with Handwrite<br />
          <div 
            data-html2canvas-ignore="true" 
            className="handwrite-watermark-promo no-print" 
            onClick={() => navigate("/payment-wall")}
          >
            <span style={{ textDecoration: "underline" }}>Remove Watermark</span> for just ₹29
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div 
        className="handwrite-paper-content"
        style={{ 
          fontFamily: activeFontFamily,
          fontSize: `${24 * globalScale}px`,
          paddingTop: `${activeConfig.paddingTop - 2}px`, 
          paddingLeft: `${PADDING_LEFT}px`,
          paddingRight: `${PADDING_RIGHT}px`, 
          width: "100%", 
          boxSizing: "border-box", 
          textAlign: "left", // Enforce left alignment
          textJustify: "none", // CRITICAL: Stop PDF renderer from stretching spaces
          display: "flex",
          flexDirection: "column",
          lineHeight: `${FIXED_LINE_HEIGHT}px`, 
          zIndex: 5,
          position: "relative",
          wordSpacing: "5px",
          textRendering: "geometricPrecision" // Helps canvas engines calculate font widths better
        }}
      >
        {page.isEmpty && index === 0 ? (
           <div 
             style={{ 
               color: "#001299",
               lineHeight: `${FIXED_LINE_HEIGHT}px`, 
               fontFamily: activeFontFamily,
               whiteSpace: "pre-wrap", 
               paddingTop: "2px",
               textAlign: "left"
             }}
           >
             {`Start typing or paste your questions...\n(e.g., "1. What is React?")`}
           </div>
        ) : (
            page.blocks.map((block, bIdx) => (
                <div 
                    key={bIdx} 
                    className="handwrite-text-block" 
                    style={{ 
                        // Strictly enforce alignment based on the block, default to left
                        textAlign: block.align === "center" ? "center" : block.align === "right" ? "right" : "left", 
                        textJustify: "none", // Prevent phantom justification gaps
                        whiteSpace: "pre-wrap", 
                        wordBreak: "break-word", // Ensures long strings break without messing up spacing
                        width: "100%",
                        minHeight: `${FIXED_LINE_HEIGHT}px`,
                        lineHeight: `${FIXED_LINE_HEIGHT}px`,
                        position: "relative",
                        flexShrink: 0,
                        display: "block"
                    }}
                >
                    {block.marginMarker && (
                        <span 
                            style={{
                                position: "absolute",
                                left: "-70px", 
                                top: 0,        
                                width: "60px",
                                height: `${FIXED_LINE_HEIGHT}px`,
                                textAlign: "center",
                                color: "#001299", 
                                fontWeight: "normal",
                                pointerEvents: "none",
                                display: "flex",       
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            {block.marginMarker}
                        </span>
                    )}

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
      
      <motion.div
        className="handwrite-export-section"
        style={{ flexDirection: "column", alignItems: "center" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div style={{ 
            marginBottom: "35px", 
            width: "100%", 
            maxWidth: "350px", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center"
        }}>
            <label style={{ 
                fontSize: "0.85rem", 
                color: "rgba(255, 255, 255, 0.5)", 
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
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    fontSize: "0.95rem",
                    color: "#fff",
                    fontFamily: '"Inter", sans-serif',
                    cursor: "pointer",
                    outline: "none",
                    appearance: "none",
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