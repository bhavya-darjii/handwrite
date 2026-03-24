// ================= CONSTANTS =================
export const PREVIEW_WIDTH = 660;
export const FULL_PAGE_HEIGHT = 1000;
export const VISUAL_PREVIEW_HEIGHT = 1000;
export const PADDING_LEFT = 78;
export const PADDING_RIGHT = 40; // NEW: Standardized right margin for exact syncing
export const PDF_WORD_SPACING = "5px";
export const FIXED_LINE_HEIGHT = 25;
export const CREDITS_PER_PAGE = 5;
export const STORAGE_KEY_TIPS = "handwrite_print_tips_count";
export const MAX_TIPS_COUNT = 6;

// ================= TEMPLATES =================

// --- K.J. Somaiya Template ---
const KJSomaiyaTemplate = () => (
  <div style={{ 
      fontFamily: "Arial, Helvetica, sans-serif", 
      color: "black", 
      pointerEvents: "none", 
      position: "absolute", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      zIndex: 10 
  }}>
    
    {/* --- WHITE MASK --- */}
    <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "50px", 
        backgroundColor: "white",
        zIndex: -1 
    }}></div>

    {/* --- HEADER CONTENT --- */}
    <div style={{ 
        position: "absolute", 
        top: "35px", 
        left: "0", 
        right: "0", 
        textAlign: "center",
        padding: "0 20px"
    }}>
      <h2 style={{ 
          margin: "0", 
          fontSize: "0.65rem", 
          fontWeight: "500", 
          textTransform: "none",
          letterSpacing: "0px", 
          whiteSpace: "nowrap" 
      }}>
        K. J. Somaiya Institute of Engineering and Information Technology, Sion (E), Mumbai - 400 022.
      </h2>
    </div>

    {/* --- MARGINS --- */}
    {/* Line 1 */}
    <div style={{ 
        position: "absolute", 
        top: "0", 
        bottom: "0", 
        left: "70px", 
        width: "1px", 
        background: "#000" 
    }}></div>
    {/* Line 2 */}
    <div style={{ 
        position: "absolute", 
        top: "0", 
        bottom: "0", 
        left: "74px", 
        width: "1px", 
        background: "#000" 
    }}></div>

    {/* --- FOOTER --- */}
    <div style={{ 
        position: "absolute", 
        bottom: "14px", 
        left: "85px", 
        right: "60px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        fontSize: "0.7rem", 
        fontWeight: "500",
        fontFamily: "Arial, Helvetica, sans-serif"
    }}>
      <span>Department of</span>
      <div style={{ display: "flex", gap: "25px" }}> 
        <span>/ Class-</span>
        <span>/ Sem-</span>
        <span>/ Sub</span>
      </div>
      <span>/ Academic Year-</span>
    </div>
  </div>
);

// --- Config Map ---
export const COLLEGE_CONFIG = {
  "none": {
    name: "Plain Paper (Default)",
    paddingTop: 74,
    paddingBottom: 40, 
    Template: () => <></> 
  },
  "somaiya": {
    name: "K.J. Somaiya",
    paddingTop: 74, 
    paddingBottom: 70, 
    Template: KJSomaiyaTemplate
  },
};

export type CollegeId = keyof typeof COLLEGE_CONFIG;