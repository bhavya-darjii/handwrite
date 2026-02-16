import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { auth, db } from "../../firebase"; // Adjust path if needed
import { doc, updateDoc, increment } from "firebase/firestore";
import { FULL_PAGE_HEIGHT, PREVIEW_WIDTH, PDF_WORD_SPACING } from "./PdfPreviewConfig";

export const generateAndSavePdf = async (
  totalCost: number
): Promise<void> => {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const papers = document.querySelectorAll(".handwrite-preview-paper") as NodeListOf<HTMLElement>;
  const pdf = new jsPDF("p", "mm", "a4"); 
  const pdfWidth = 210;
  const pdfHeight = 297;

  const hiddenContainer = document.createElement("div");
  hiddenContainer.style.position = "fixed";
  hiddenContainer.style.top = "0px";
  hiddenContainer.style.left = "0px";
  hiddenContainer.style.zIndex = "-9999";
  hiddenContainer.style.opacity = "0";
  hiddenContainer.style.pointerEvents = "none";
  document.body.appendChild(hiddenContainer);

  try {
    const renderScale = isAndroid ? 2 : 3;

    for (let i = 0; i < papers.length; i++) {
      const originalPaper = papers[i];
      if (!originalPaper) continue;

      const clone = originalPaper.cloneNode(true) as HTMLElement;

      // 👇 THE MAGIC: We force the clone back to the standard 1000px
      // This trims the extra visual fluff we added for the screen.
      clone.style.height = `${FULL_PAGE_HEIGHT}px`;
      clone.style.minHeight = "unset"; 
      clone.style.marginBottom = "0";
      clone.style.boxShadow = "none";
      
      const blocks = clone.querySelectorAll(".handwrite-text-block");
      blocks.forEach((b) => {
          (b as HTMLElement).style.wordSpacing = PDF_WORD_SPACING;
      });
      
      hiddenContainer.appendChild(clone);
      
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        backgroundColor: "#fff",
        scale: renderScale, 
        useCORS: true,
        logging: false,
        allowTaint: true,
        width: PREVIEW_WIDTH,
        height: FULL_PAGE_HEIGHT,
        imageTimeout: 0,
      });

      hiddenContainer.removeChild(clone);

      const quality = isAndroid ? 0.8 : 0.95;
      const imgData = canvas.toDataURL("image/jpeg", quality);
      
      if (i > 0) pdf.addPage();
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      // @ts-ignore
      canvas.width = 1;
      // @ts-ignore
      canvas.height = 1;
    }
    
    pdf.save("handwrite-note.pdf");
    
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { credits: increment(-totalCost) });
    }
  } catch (err) {
    console.error("PDF export error:", err);
    throw err;
  } finally {
    if(document.body.contains(hiddenContainer)){
      document.body.removeChild(hiddenContainer);
    }
  }
};