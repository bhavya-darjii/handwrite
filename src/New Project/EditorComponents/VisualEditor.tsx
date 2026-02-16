import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import "../New-Project.css"; 

export interface VisualEditorHandle {
  applyAlignment: (align: "left" | "center" | "right") => void;
  applyFontSize: (size: "normal" | "large") => void;
}

interface VisualEditorProps {
  initialContent: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const VisualEditor = forwardRef<VisualEditorHandle, VisualEditorProps>(
  ({ initialContent, onChange, placeholder }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [, setIsFocused] = useState(false);

    // 1. INITIALIZE
    useEffect(() => {
      if (editorRef.current) {
        let html = initialContent
          .replace(/<center>/g, '<div style="text-align: center;">')
          .replace(/<\/center>/g, "</div>")
          .replace(/<right>/g, '<div style="text-align: right;">')
          .replace(/<\/right>/g, "</div>")
          .replace(/<large>/g, '<font size="4">') 
          .replace(/<\/large>/g, "</font>");
          // REMOVED: .replace(/\n/g, "<br>"); 

        if (!html) html = ""; 
        if (editorRef.current.innerHTML !== html) {
            editorRef.current.innerHTML = html;
        }
      }
    }, []); 

    // 2. PARSER
    const handleInput = () => {
      if (!editorRef.current) return;

      const nodes = editorRef.current.childNodes;
      let processedString = "";

      nodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          processedString += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const align = el.style.textAlign;
          
          // REMOVED: Specific BR tag check block

          // --- FIX: DETECT INNER FONT TAGS ---
          let content = el.innerHTML;

          // A. Map Large Tags to <large>
          content = content
            .replace(/<font[^>]+size="4"[^>]*>/gi, "<large>")
            .replace(/<span[^>]+style="[^"]*font-size:\s*(large|18px)[^"]*"[^>]*>/gi, "<large>")
            .replace(/<\/font>/gi, "</large>")
            .replace(/<\/span>/gi, "</large>");

          // B. Remove Normal Tags (Size 3)
          content = content
            .replace(/<font[^>]+size="3"[^>]*>/gi, "")
            .replace(/<span[^>]+style="[^"]*font-size:\s*(medium|16px)[^"]*"[^>]*>/gi, "");

          // C. Clean up "Stray" closing tags
          content = content.replace(/<large>([\s\S]*?)<\/large>/g, "%%%OPEN%%%$1%%%CLOSE%%%");
          content = content.replace(/<\/large>/g, ""); 
          content = content.replace(/%%%OPEN%%%/g, "<large>").replace(/%%%CLOSE%%%/g, "</large>");

          // D. Strip other tags 
          // REMOVED: 'br' from the exclusion list below. 
          // Old regex: /<(?!large|\/large|br)[^>]+>/gi
          content = content.replace(/<(?!large|\/large)[^>]+>/gi, "");
          
          // E. Check if Wrapper itself was large (for single lines)
          let isWrapperLarge = false;
          if (el.tagName === "FONT" && el.getAttribute("size") === "4") isWrapperLarge = true;
          if (el.style.fontSize === "large" || el.style.fontSize === "18px") isWrapperLarge = true;

          if (isWrapperLarge && !content.startsWith("<large>")) {
             content = `<large>${content}</large>`;
          }

          if (processedString.length > 0 && !processedString.endsWith("\n")) {
             processedString += "\n";
          }

          if (align === "center") {
            processedString += `<center>${content}</center>`;
          } else if (align === "right") {
            processedString += `<right>${content}</right>`;
          } else {
            processedString += content;
          }
          
          processedString += "\n";
        }
      });

      processedString = processedString.replace(/\n\n\n+/g, "\n\n").trim();
      onChange(processedString);
    };

    // 3. HANDLE ENTER KEY
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        setTimeout(() => {
          document.execCommand("fontSize", false, "3");
        }, 0);
      }
    };

    // 4. EXPOSE FUNCTIONS
    useImperativeHandle(ref, () => ({
      applyAlignment: (align: "left" | "center" | "right") => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        if (align === "left") document.execCommand("justifyLeft", false);
        else if (align === "center") document.execCommand("justifyCenter", false);
        else if (align === "right") document.execCommand("justifyRight", false);
        handleInput();
      },
      applyFontSize: (size: "normal" | "large") => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        
        const selection = window.getSelection();
        let wasCollapsed = false;

        if (selection && selection.isCollapsed && selection.anchorNode) {
          if (selection.anchorNode.nodeType === Node.TEXT_NODE && selection.anchorNode.textContent?.trim().length) {
            wasCollapsed = true;
            const range = document.createRange();
            range.selectNodeContents(selection.anchorNode);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
        
        document.execCommand("styleWithCSS", false, "false");
        
        if (size === "large") {
          document.execCommand("fontSize", false, "4");
        } else {
          document.execCommand("fontSize", false, "3");
        }

        if (wasCollapsed && selection) {
          selection.collapseToEnd();
        }

        handleInput();
      }
    }));

    return (
      <>
        <style>{`
          .visual-editor:empty:before {
            content: attr(data-placeholder);
            color: rgba(255, 255, 255, 0.4);
            pointer-events: none;
            display: block;
          }
          font[size="4"] { font-size: 1.25em; }
        `}</style>

        <div
          ref={editorRef}
          contentEditable
          className="handwrite-prompt-box visual-editor"
          data-placeholder={placeholder}
          onInput={handleInput}
          onKeyDown={handleKeyDown} 
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            overflowY: "auto",
            whiteSpace: "pre-wrap", 
            height: "200px",
            resize: "none",
            overflow: "auto",
            position: "relative",
            zIndex: 5,
            caretColor: "#fff",
            textAlign: "left",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeft: "none"
          }}
        />
      </>
    );
  }
);

export default VisualEditor;