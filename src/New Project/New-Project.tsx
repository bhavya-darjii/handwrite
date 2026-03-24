import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Aurora from "../Aurora Background/Aurora";
import PdfPreview from "./PdfEngine/PdfPreview";
import VisualEditor, { VisualEditorHandle } from "./EditorComponents/VisualEditor";
import "./New-Project.css";
import "../Aurora Background/Aurora.css";

interface UserContextType {
  credits: number;
  name: string;
}

// 1. UPDATED: Define our available fonts
type FontOption = "caveat" | "kalam" | "shadows" | "indie" | "patrick" | "gochi" | "architects" | "dancing" | "user";

const FONT_MAP: Record<FontOption, string> = {
  caveat: "'Caveat', cursive",
  kalam: "'Kalam', cursive",
  shadows: "'Shadows Into Light', cursive",
  indie: "'Indie Flower', cursive",
  patrick: "'Patrick Hand', cursive",
  gochi: "'Gochi Hand', cursive",
  architects: "'Architects Daughter', cursive",
  dancing: "'Dancing Script', cursive",
  user: "'MyHandwriting', sans-serif"
};

const GOOGLE_FONTS = [
  { id: "caveat" as FontOption, label: "Default Basic" },
  { id: "kalam" as FontOption, label: "Casual Pen" },
  { id: "shadows" as FontOption, label: "Neat Script" },
  { id: "indie" as FontOption, label: "Bubbly Marker" },
  { id: "patrick" as FontOption, label: "Neat Notes" },
  { id: "gochi" as FontOption, label: "Quick Jot" },
  { id: "architects" as FontOption, label: "Block Print" },
  { id: "dancing" as FontOption, label: "Elegant Cursive" },
];

export default function NewProject() {
  const user = useOutletContext<UserContextType>();
  
  // --- NEW STATE FOR MENUS ---
  const [fontType, setFontType] = useState<FontOption>("caveat");
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");
  const [userFontAvailable, setUserFontAvailable] = useState(false);
  const [isFontLoading, setIsFontLoading] = useState(true);
  
  // --- ADDED: State to hold the expiry date ---
  const [expiryDate, setExpiryDate] = useState<any>(null); 

  // Menus
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false); 
  const alignMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<VisualEditorHandle>(null);

  const [content, setContent] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("handwrite_content") || "";
    }
    return "";
  });

  // --- 1. LOAD USER FONT & EXPIRY DATE LOGIC ---
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setIsFontLoading(false);
        return;
      }
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          
          if (data.expiryDate) {
            setExpiryDate(data.expiryDate);
          }

          if (data.customFontUrl) {
            const myFont = new FontFace(
              "MyHandwriting",
              `url(${data.customFontUrl})`
            );
            await myFont.load();
            document.fonts.add(myFont);
            
            setUserFontAvailable(true);
            setFontType("user"); // Auto-select it if found
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsFontLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    localStorage.setItem("handwrite_content", content);
  }, [content]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alignMenuRef.current && !alignMenuRef.current.contains(event.target as Node))
        setShowAlignMenu(false);
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(event.target as Node))
        setShowSizeMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Alignment Logic
  const applyAlignment = (type: "left" | "center" | "right") => {
    editorRef.current?.applyAlignment(type);
    setShowAlignMenu(false);
  };

  // --- 2. CALCULATE FINAL PROPS FOR PDF PREVIEW ---
  // If user selected their custom font but it's not loaded, fallback to caveat
  const activeFontFamily = (fontType === "user" && !userFontAvailable)
    ? FONT_MAP.caveat
    : FONT_MAP[fontType];

  const globalScale = fontSize === "large" ? 1.2 : 1.0; 
  const userCredits = user?.credits || 0;

  return (
    <div className="handwrite-page">
      <div className="handwrite-aurora-wrapper">
        <div className="handwrite-aurora-container">
          <Aurora colorStops={["#ffcc00", "#FFffff", "#2969ff"]} blend={0.5} amplitude={1.0} speed={0.5} />
        </div>
      </div>
      <div className="handwrite-aurora-overlay" />

      <div className="handwrite-center-wrapper">
        <motion.h2 className="handwrite-subtitle-handwrite" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          HANDWRITE
        </motion.h2>

        <motion.div className="handwrite-input-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ position: "relative", display: "flex", flexDirection: "row" }}>
          
          <div style={{ flex: 1, minWidth: "0" }}>
            <VisualEditor
              ref={editorRef}
              initialContent={content}
              onChange={setContent}
              placeholder={isFontLoading ? "Loading font..." : "Start Typing Here..."}
            />
          </div>

          {/* --- TOOLBAR --- */}
          <div className="handwrite-toolbar-container" style={{ position: "absolute", bottom: "15px", right: "15px", display: "flex", gap: "8px", zIndex: 10 }}>
            
            {/* Tt MENU BUTTON */}
            <div style={{ position: "relative" }} ref={sizeMenuRef}>
              <button
                className={`handwrite-align-toggle-btn ${showSizeMenu ? "active" : ""}`}
                onClick={() => setShowSizeMenu(!showSizeMenu)}
                style={{ position: "static", margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}
                title="Font Settings"
              >
                Tt
              </button>

              <AnimatePresence>
                {showSizeMenu && (
                  <motion.div
                    className="handwrite-align-menu"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    style={{ 
                      minWidth: "180px", 
                      bottom: "100%", 
                      right: "0", 
                      marginBottom: "8px",
                      padding: "10px",
                      background: "#1a1a1a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px"
                    }}
                  >
                    {/* SECTION 1: SIZE */}
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "#666", marginBottom: "5px", display: "block" }}>Size</label>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          className="align-option"
                          style={{ justifyContent: "center", background: fontSize === "normal" ? "rgba(255,255,255,0.15)" : "transparent" }}
                          onClick={() => setFontSize("normal")}
                        >
                          Normal
                        </button>
                        <button
                          className="align-option"
                          style={{ justifyContent: "center", background: fontSize === "large" ? "rgba(255,255,255,0.15)" : "transparent" }}
                          onClick={() => setFontSize("large")}
                        >
                          Larger
                        </button>
                      </div>
                    </div>

                    <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "8px 0" }}></div>

                    {/* SECTION 2: FONT TYPE */}
                    <div>
                      <label style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "#666", marginBottom: "5px", display: "block" }}>Font Style</label>
                      
                      {/* User's Font Option */}
                      {userFontAvailable ? (
                         <button
                           className="align-option"
                           onClick={() => setFontType("user")}
                           style={{ 
                             justifyContent: "space-between",
                             fontFamily: FONT_MAP.user,
                             background: fontType === "user" ? "rgba(255,255,255,0.15)" : "transparent"
                           }}
                         >
                           {user?.name || "User"}'s Hand
                           {fontType === "user" && <span>✓</span>}
                         </button>
                      ) : (
                        <div style={{ padding: "8px", fontSize: "0.8rem", color: "#555", fontStyle: "italic" }}>
                           Custom font not found
                        </div>
                      )}

                      {/* Google Fonts Options mapped dynamically */}
                      {GOOGLE_FONTS.map((font) => (
                        <button
                          key={font.id}
                          className="align-option"
                          onClick={() => setFontType(font.id)}
                          style={{ 
                              justifyContent: "space-between", 
                              fontFamily: FONT_MAP[font.id], 
                              fontSize: "1.1rem",
                              background: fontType === font.id ? "rgba(255,255,255,0.15)" : "transparent"
                          }}
                        >
                          {font.label}
                          {fontType === font.id && <span>✓</span>}
                        </button>
                      ))}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ALIGN BUTTON (UNCHANGED) */}
            <div style={{ position: "relative" }} ref={alignMenuRef}>
              <button
                className="handwrite-align-toggle-btn"
                onClick={() => setShowAlignMenu(!showAlignMenu)}
                style={{ position: "static", margin: 0 }}
                title="Alignment"
              >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <AnimatePresence>
                {showAlignMenu && (
                  <motion.div
                    className="handwrite-align-menu"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    style={{ bottom: "100%", right: "0", marginBottom: "8px" }}
                  >
                    <button className="align-option" onClick={() => applyAlignment("left")}>Left</button>
                    <button className="align-option" onClick={() => applyAlignment("center")}>Center</button>
                    <button className="align-option" onClick={() => applyAlignment("right")}>Right</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <PdfPreview
          content={content}
          activeFontFamily={activeFontFamily}
          isFontLoading={isFontLoading}
          userCredits={userCredits}
          globalScale={globalScale} 
          expiryDate={expiryDate} 
        />

        <motion.p className="handwrite-footer-text" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.5 }}>
          Your notes, your way – ready to download anytime.
        </motion.p>
      </div>
    </div>
  );
}