import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Aurora from "../Aurora Background/Aurora";
import PdfPreview from "./PdfEngine/PdfPreview";
import VisualEditor, { VisualEditorHandle } from "./EditorComponents/VisualEditor";
import "./New-Project.css";
import MarginInput from "./EditorComponents/MarginInput";
import "../Aurora Background/Aurora.css";

interface UserContextType {
  credits: number;
  name: string;
}

export default function NewProject() {
  const user = useOutletContext<UserContextType>();
  const [activeFontFamily, setActiveFontFamily] = useState("'Caveat', cursive");
  const [isFontLoading, setIsFontLoading] = useState(true);

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

  // 👇 ADD THIS NEW STATE 👇
  const [marginContent, setMarginContent] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("handwrite_margin") || "";
    }
    return "";
  });

  // 👇 ADD THIS EFFECT TO SAVE IT 👇
  useEffect(() => {
    localStorage.setItem("handwrite_margin", marginContent);
  }, [marginContent]);

  useEffect(() => {
    const fetchUserFont = async () => {
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
          if (data.customFontUrl) {
            const myFont = new FontFace(
              "MyHandwriting",
              `url(${data.customFontUrl})`,
            );
            await myFont.load();
            document.fonts.add(myFont);
            setActiveFontFamily("'MyHandwriting', sans-serif");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsFontLoading(false);
      }
    };
    fetchUserFont();
  }, []);

  useEffect(() => {
    localStorage.setItem("handwrite_content", content);
  }, [content]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        alignMenuRef.current &&
        !alignMenuRef.current.contains(event.target as Node)
      )
        setShowAlignMenu(false);
      if (
        sizeMenuRef.current &&
        !sizeMenuRef.current.contains(event.target as Node)
      )
        setShowSizeMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyAlignment = (type: "left" | "center" | "right") => {
    editorRef.current?.applyAlignment(type);
    setShowAlignMenu(false);
  };

  const applyFontSize = (size: "normal" | "large") => {
    editorRef.current?.applyFontSize(size);
    setShowSizeMenu(false);
  };

  const userCredits = user?.credits || 0;

  return (
    <div className="handwrite-page">
      <div className="handwrite-aurora-wrapper">
        <div className="handwrite-aurora-container">
          <Aurora
            colorStops={["#ffcc00", "#FFffff", "#2969ff"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>
      </div>
      <div className="handwrite-aurora-overlay" />

      <div className="handwrite-center-wrapper">
        <motion.h2
          className="handwrite-subtitle-handwrite"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          HANDWRITE
        </motion.h2>

        <motion.div
          className="handwrite-input-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <MarginInput
            value={marginContent}
            onChange={setMarginContent}
            isFontLoading={isFontLoading}
          />
          <div style={{ flex: 1, minWidth: "0" }}>
            <VisualEditor
              ref={editorRef}
              initialContent={content}
              onChange={setContent}
              placeholder={
                isFontLoading ? "Loading font..." : "Start Typing Here..."
              }
            />
          </div>

          {/* --- TOOLBAR: Absolute Positioned Container to Prevent Overlap --- */}
          <div
            className="handwrite-toolbar-container"
            style={{
              position: "absolute",
              bottom: "15px",
              right: "15px",
              display: "flex",
              gap: "8px",
              zIndex: 10,
            }}
          >
            {/* 1. SIZE BUTTON */}
            <div style={{ position: "relative" }} ref={sizeMenuRef}>
              <button
                className="handwrite-align-toggle-btn"
                onClick={() => setShowSizeMenu(!showSizeMenu)}
                style={{
                  position: "static",
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                }} // Override absolute from CSS class if it exists
                title="Font Size"
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
                      minWidth: "120px",
                      bottom: "100%",
                      right: "0",
                      marginBottom: "8px",
                    }}
                  >
                    <button
                      className="align-option"
                      onClick={() => applyFontSize("normal")}
                    >
                      <span style={{ fontSize: "0.9rem", marginRight: "8px" }}>
                        T
                      </span>{" "}
                      Normal
                    </button>
                    <button
                      className="align-option"
                      onClick={() => applyFontSize("large")}
                    >
                      <span
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          marginRight: "8px",
                        }}
                      >
                        T
                      </span>{" "}
                      Larger
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. ALIGN BUTTON */}
            <div style={{ position: "relative" }} ref={alignMenuRef}>
              <button
                className="handwrite-align-toggle-btn"
                onClick={() => setShowAlignMenu(!showAlignMenu)}
                style={{ position: "static", margin: 0 }} // Override absolute from CSS
                title="Alignment"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
                    <button
                      className="align-option"
                      onClick={() => applyAlignment("left")}
                    >
                      Left
                    </button>
                    <button
                      className="align-option"
                      onClick={() => applyAlignment("center")}
                    >
                      Center
                    </button>
                    <button
                      className="align-option"
                      onClick={() => applyAlignment("right")}
                    >
                      Right
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <PdfPreview
          content={content}
          marginContent={marginContent}
          activeFontFamily={activeFontFamily}
          isFontLoading={isFontLoading}
          userCredits={userCredits}
        />

        <motion.p
          className="handwrite-footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          Your notes, your way – ready to download anytime.
        </motion.p>
      </div>
    </div>
  );
}
