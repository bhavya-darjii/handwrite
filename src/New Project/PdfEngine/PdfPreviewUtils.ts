import { TextSegment, TextBlock, PageData } from "./PdfPreviewTypes";
import { 
  FIXED_LINE_HEIGHT, 
  PREVIEW_WIDTH, 
  MEASUREMENT_WIDTH_FACTOR, 
  PADDING_LEFT 
} from "./PdfPreviewConfig";

// --- SNAP HEIGHT TO GRID ---
export const snapToGrid = (rawHeight: number) => {
  const lines = Math.round(rawHeight / FIXED_LINE_HEIGHT);
  const adjustedLines = lines === 0 && rawHeight > 0 ? 1 : lines;
  return adjustedLines * FIXED_LINE_HEIGHT;
};

// --- SEGMENT PARSER (SMART PRESERVE) ---
const parseSegments = (input: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  const regex = /<large>([\s\S]*?)<\/large>/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    // 1. Handle text BEFORE the tag
    if (match.index > lastIndex) {
      let normalText = input.substring(lastIndex, match.index);
      
      // 👇 SMARTER FIX: 
      // Only remove the trailing newline if it is a SINGLE newline.
      // If the user hit Enter twice (\n\n), we keep it to preserve the blank line.
      if (normalText.endsWith("\n") && !normalText.endsWith("\n\n")) {
        normalText = normalText.slice(0, -1);
      }
      
      if (normalText.length > 0) {
        segments.push({ text: normalText, isLarge: false });
      }
    }

    // 2. Handle the LARGE text
    // Remove newlines INSIDE the tag so the word doesn't break
    const largeText = match[1].replace(/(\r\n|\n|\r)/gm, ""); 
    
    if (largeText.length > 0) {
      segments.push({ text: largeText, isLarge: true });
    }
    
    lastIndex = regex.lastIndex;
  }

  // 3. Handle text AFTER the last tag
  if (lastIndex < input.length) {
    let normalText = input.substring(lastIndex);
    
    // 👇 SAFETY CHECK: Only strip leading newline if we actually found a tag before this.
    // If lastIndex is 0, it means the whole text has no tags, so we shouldn't touch it.
    if (lastIndex > 0) {
      // Only remove single newline (glitch), preserve double newlines (paragraphs)
      if (normalText.startsWith("\n") && !normalText.startsWith("\n\n")) {
        normalText = normalText.substring(1);
      }
    }

    if (normalText.length > 0) {
      segments.push({ text: normalText, isLarge: false });
    }
  }
  
  return segments;
};

// --- BLOCK PARSER ---
export const parseContentToBlocks = (rawContent: string): TextBlock[] => {
  if (!rawContent) return [];
  const regex = /<(center|right)>([\s\S]*?)<\/\1>/gi;
  const blocks: TextBlock[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(rawContent)) !== null) {
    if (match.index > lastIndex) {
      let textBefore = rawContent.substring(lastIndex, match.index);
      
      // 👇 Apply same SMART logic to blocks
      if (textBefore.endsWith("\n") && !textBefore.endsWith("\n\n")) {
        textBefore = textBefore.slice(0, -1);
      }

      const segments = parseSegments(textBefore);
      if (segments.length > 0) {
        blocks.push({
          segments,
          align: "left",
          id: Math.random().toString(36).substr(2, 9)
        });
      }
    }
    const alignType = match[1].toLowerCase() as "center" | "right";
    const innerText = match[2];
    const segments = parseSegments(innerText);
    if (segments.length > 0) {
      blocks.push({
        segments,
        align: alignType,
        id: Math.random().toString(36).substr(2, 9)
      });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < rawContent.length) {
    let textAfter = rawContent.substring(lastIndex);
    
    // 👇 Apply same SMART logic to end of blocks
    if (lastIndex > 0) {
       if (textAfter.startsWith("\n") && !textAfter.startsWith("\n\n")) {
         textAfter = textAfter.substring(1);
       }
    }
    
    const segments = parseSegments(textAfter);
    if (segments.length > 0) {
      blocks.push({
        segments,
        align: "left",
        id: Math.random().toString(36).substr(2, 9)
      });
    }
  }
  return blocks;
};

// --- CALCULATOR: Fits Blocks onto A4 Pages ---
export const calculatePages = (
  blocks: TextBlock[], 
  fontFamily: string,
  paddingTop: number,
  writableLimit: number
): PageData[] => {
  if (blocks.length === 0) return [{ blocks: [], isEmpty: true }];

  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.visibility = "hidden";
  tempDiv.style.width = `${PREVIEW_WIDTH * MEASUREMENT_WIDTH_FACTOR}px`;
  tempDiv.style.padding = `0px 20px 0px ${PADDING_LEFT}px`; 
  tempDiv.style.boxSizing = "border-box";
  
  tempDiv.style.fontFamily = fontFamily;
  tempDiv.style.fontSize = "1.50rem";
  tempDiv.style.lineHeight = `${FIXED_LINE_HEIGHT}px`; 
  tempDiv.style.whiteSpace = "pre-wrap"; 
  tempDiv.style.wordBreak = "break-word";
  document.body.appendChild(tempDiv);

  const pages: PageData[] = [];
  let currentPageBlocks: TextBlock[] = [];
  let currentHeightUsed = paddingTop; 

  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    let remainingSegments = [...block.segments];

    while (remainingSegments.length > 0) {
      tempDiv.style.textAlign = block.align;
      tempDiv.innerHTML = "";
      
      remainingSegments.forEach((seg) => {
        const span = document.createElement("span");
        span.textContent = seg.text;
        if (seg.isLarge) {
          span.style.fontSize = "1.25em";
          span.style.display = "inline"; 
          span.style.lineHeight = "inherit"; 
        }
        tempDiv.appendChild(span);
      });

      const rawBlockHeight = tempDiv.offsetHeight;
      const fullBlockHeight = snapToGrid(rawBlockHeight);

      if (currentHeightUsed + fullBlockHeight <= writableLimit) {
        currentPageBlocks.push({ ...block, segments: remainingSegments });
        currentHeightUsed += fullBlockHeight;
        break; 
      }

      // --- SPLITTING LOGIC ---
      const fullRemainingText = remainingSegments.map((seg) => seg.text).join("");
      let totalLength = fullRemainingText.length;
      let low = 0;
      let high = totalLength;
      let splitCharIndex = 0;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        tempDiv.innerHTML = "";
        let accumulated = 0;
        
        for (let seg of remainingSegments) {
          let take = Math.min(seg.text.length, mid - accumulated);
          if (take <= 0) break;
          const span = document.createElement("span");
          span.textContent = seg.text.substring(0, take);
          if (seg.isLarge) {
            span.style.fontSize = "1.25em";
            span.style.display = "inline"; 
          }
          tempDiv.appendChild(span);
          accumulated += take;
          if (accumulated >= mid) break;
        }

        const segmentHeight = snapToGrid(tempDiv.offsetHeight);

        if (currentHeightUsed + segmentHeight <= writableLimit) {
          splitCharIndex = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (splitCharIndex === 0) splitCharIndex = 1; 

      if (splitCharIndex > 0 && splitCharIndex < totalLength) {
        const charAfter = fullRemainingText[splitCharIndex];
        if (![" ", "\n"].includes(charAfter)) {
          const lastSpace = fullRemainingText.lastIndexOf(" ", splitCharIndex);
          const lastNewline = fullRemainingText.lastIndexOf("\n", splitCharIndex);
          const bestBreak = Math.max(lastSpace, lastNewline);
          if (bestBreak > splitCharIndex - 100) {
            splitCharIndex = bestBreak;
          }
        }
      }

      let accumulatedChars = 0;
      let currentSegments: TextSegment[] = [];
      let splitSegIndex = -1;
      let segmentSplitPos = 0;

      for (let j = 0; j < remainingSegments.length; j++) {
        const seg = remainingSegments[j];
        if (accumulatedChars + seg.text.length > splitCharIndex) {
          splitSegIndex = j;
          segmentSplitPos = splitCharIndex - accumulatedChars;
          break;
        }
        currentSegments.push({ ...seg });
        accumulatedChars += seg.text.length;
      }

      if (splitSegIndex >= 0) {
        const splitSeg = remainingSegments[splitSegIndex];
        const firstPartText = splitSeg.text.substring(0, segmentSplitPos);
        if (firstPartText.length > 0) {
          currentSegments.push({
            text: firstPartText,
            isLarge: splitSeg.isLarge,
          });
        }

        let remText = splitSeg.text.substring(segmentSplitPos);
        let remSegments = remainingSegments.slice(splitSegIndex + 1);
        if (remText.length > 0) {
          remSegments = [
            { text: remText, isLarge: splitSeg.isLarge },
            ...remSegments,
          ];
        }
        remainingSegments = remSegments;
      } else {
        remainingSegments = [];
      }

      if (currentSegments.length > 0) {
        currentPageBlocks.push({ ...block, segments: currentSegments });
      }

      pages.push({ blocks: currentPageBlocks, isEmpty: false });
      currentPageBlocks = [];
      currentHeightUsed = paddingTop;
    }
  }

  if (currentPageBlocks.length > 0) {
    pages.push({ blocks: currentPageBlocks, isEmpty: false });
  }

  document.body.removeChild(tempDiv);
  return pages;
};

export const calculateMarginPages = (marginText: string, totalMainPages: number, writableLimit: number): string[] => {
  const LINES_PER_PAGE = Math.floor(writableLimit / FIXED_LINE_HEIGHT);
  const lines = marginText.split("\n");
  const pages: string[] = [];

  for (let i = 0; i < totalMainPages; i++) {
    const start = i * LINES_PER_PAGE;
    const end = start + LINES_PER_PAGE;
    const pageLines = lines.slice(start, end).join("\n");
    pages.push(pageLines);
  }
  return pages;
};