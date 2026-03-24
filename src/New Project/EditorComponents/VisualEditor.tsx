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
          .replace(/<\/large>/g, "</font>")
          .replace(/\n/g, "<br>"); // Re-added to ensure loaded content keeps gaps

        if (!html) html = ""; 
        if (editorRef.current.innerHTML !== html) {
            editorRef.current.innerHTML = html;
        }
      }
    }, []); 

    // 2. PARSER - Safely walks the DOM to keep line breaks and bullets
    const handleInput = () => {
      if (!editorRef.current) return;

      let processedString = "";

      const walk = (node: Node, currentAlign: string, isLarge: boolean) => {
        if (node.nodeType === Node.TEXT_NODE) {
          let text = node.textContent || "";
          if (text) {
             if (isLarge) text = `<large>${text}</large>`;
             if (currentAlign === "center") text = `<center>${text}</center>`;
             else if (currentAlign === "right") text = `<right>${text}</right>`;
             processedString += text;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();

          // Check formatting
          let align = currentAlign;
          if (el.style.textAlign) align = el.style.textAlign;

          let large = isLarge;
          if (tag === "font" && el.getAttribute("size") === "4") large = true;
          if (el.style.fontSize === "large" || el.style.fontSize === "18px" || el.style.fontSize === "1.25em") large = true;
          if (tag === "large") large = true;

          // Force breaks for <br>
          if (tag === "br") {
            processedString += "\n";
            return;
          }

          // Force bullet points for lists
          if (tag === "li") {
             processedString += "• ";
          }

          // Check if block element (p, div, ul, etc)
          const isBlock = ["p", "div", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "table", "tr"].includes(tag);
          
          if (isBlock && processedString.length > 0 && !processedString.endsWith("\n")) {
             processedString += "\n";
          }

          // Recurse children
          el.childNodes.forEach(child => walk(child, align, large));

          // Close block element with a gap
          if (isBlock && !processedString.endsWith("\n")) {
             processedString += "\n";
          }
        }
      };

      editorRef.current.childNodes.forEach(child => walk(child, "left", false));

      // Clean up weird invisible spaces
      processedString = processedString.replace(/\u00A0/g, " ");
      onChange(processedString);
    };

    // 3. HANDLE PASTE (CRUCIAL FIX FOR CHATGPT/GEMINI)
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      // Forces plain text paste. Keeps natural spaces/tabs, strips messy HTML tables
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
      handleInput(); // Immediately trigger the parser
    };

    // 4. HANDLE ENTER KEY
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        setTimeout(() => {
          document.execCommand("fontSize", false, "3");
        }, 0);
      }
    };

    // 5. EXPOSE FUNCTIONS
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
          onPaste={handlePaste} // <-- Added paste interceptor here
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
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            borderLeft: "none",
            padding: "20px",
          }}
        />
      </>
    );
  }
);

export default VisualEditor;