import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { auth, db } from "../../firebase"; // Adjust path if needed
import { doc, updateDoc, increment } from "firebase/firestore";
import { FULL_PAGE_HEIGHT, PDF_WORD_SPACING } from "./PdfPreviewConfig";

export const generateAndSavePdf = async (
  totalCost: number,
  _isFreeUser: boolean
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

      // The user specially requested: keep the UI preview paper narrow (660px) so it looks clean,
      // but capture the PDF at a wider resolution (760px) so the bloated font engine text 
      // has absolute runway to expand and never gets cut off.
      const A4_WIDTH = 760;

      clone.style.height = `${FULL_PAGE_HEIGHT}px`;
      clone.style.width = `${A4_WIDTH}px`;
      clone.style.minHeight = "unset";
      clone.style.marginBottom = "0";
      clone.style.boxShadow = "none";


      // Open up the internal right padding area fully to give text maximum safe extension
      // Since the UI visual margin is 80px, removing it here opens up 80px of pure empty
      // runway for the bloated html2canvas text to freely expand into without clipping!
      const contentBox = clone.querySelector(".handwrite-paper-content") as HTMLElement;
      if (contentBox) {
        contentBox.style.paddingRight = "0px";
      }

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
        width: A4_WIDTH, // Capture the full un-squashed A4 width
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
    if (document.body.contains(hiddenContainer)) {
      document.body.removeChild(hiddenContainer);
    }
  }
};