// PdfPreviewUtils.ts
import { TextSegment, TextBlock, PageData } from "./PdfPreviewTypes";
import {
  FIXED_LINE_HEIGHT,
  PREVIEW_WIDTH,
  PADDING_LEFT,
  PADDING_RIGHT,
  PDF_WORD_SPACING
} from "./PdfPreviewConfig";

// --- SNAP HEIGHT TO GRID ---
export const snapToGrid = (rawHeight: number) => {
  const lines = Math.round(rawHeight / FIXED_LINE_HEIGHT);
  const adjustedLines = lines === 0 && rawHeight > 0 ? 1 : lines;
  return adjustedLines * FIXED_LINE_HEIGHT;
};

// --- HELPER: Extract Margin Number ---
const extractMarginInfo = (htmlContent: string) => {
  const regex = /^(\s*(?:<[^>]+>)?\s*)(Q?\d+[\.\)])(?:\s+|$)/i;

  const match = htmlContent.match(regex);
  if (match) {
    return {
      marker: match[2],
      cleanContent: htmlContent.substring(match[0].length)
    };
  }
  return { marker: undefined, cleanContent: htmlContent };
};

// --- SEGMENT PARSER ---
const parseSegments = (input: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  const regex = /<large>([\s\S]*?)<\/large>/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      let normalText = input.substring(lastIndex, match.index);
      if (normalText.endsWith("\n") && !normalText.endsWith("\n\n")) {
        normalText = normalText.slice(0, -1);
      }
      if (normalText.length > 0) segments.push({ text: normalText, isLarge: false });
    }
    const largeText = match[1].replace(/(\r\n|\n|\r)/gm, "");
    if (largeText.length > 0) segments.push({ text: largeText, isLarge: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    let normalText = input.substring(lastIndex);
    if (lastIndex > 0 && normalText.startsWith("\n") && !normalText.startsWith("\n\n")) {
      normalText = normalText.substring(1);
    }
    if (normalText.length > 0) segments.push({ text: normalText, isLarge: false });
  }

  return segments;
};

// --- BLOCK PARSER ---
export const parseContentToBlocks = (rawContent: string): TextBlock[] => {
  if (!rawContent) return [];

  const lines = rawContent.split(/\r\n|\n|\r/);
  const blocks: TextBlock[] = [];

  lines.forEach((line) => {
    if (!line.trim()) {
      blocks.push({
        segments: [],
        align: "left",
        id: Math.random().toString(36).substr(2, 9),
        marginMarker: undefined
      });
      return;
    }

    let align: "left" | "center" | "right" = "left";
    let processedLine = line;

    if (line.includes("<center>")) {
      align = "center";
      processedLine = processedLine.replace(/<\/?center>/gi, "");
    } else if (line.includes("<right>")) {
      align = "right";
      processedLine = processedLine.replace(/<\/?right>/gi, "");
    }

    let marginMarker: string | undefined = undefined;
    if (align === "left") {
      const result = extractMarginInfo(processedLine);
      if (result.marker) {
        marginMarker = result.marker;
        processedLine = result.cleanContent;
      }
    }

    const segments = parseSegments(processedLine);

    if (segments.length > 0 || marginMarker) {
      blocks.push({
        segments,
        align,
        id: Math.random().toString(36).substr(2, 9),
        marginMarker
      });
    }
  });

  return blocks;
};

// --- PAGINATION CALCULATOR ---
export const calculatePages = (
  blocks: TextBlock[],
  fontFamily: string,
  paddingTop: number,
  writableLimit: number,
  globalScale: number = 1
): PageData[] => {
  if (blocks.length === 0) return [{ blocks: [], isEmpty: true }];

  const tempDiv = document.createElement("div");

  // CRITICAL FIX: Ensure the calculation canvas has the EXACT same dimensions 
  // and border-box attributes as the visual UI to prevent phantom line gaps.
  Object.assign(tempDiv.style, {
    position: "absolute",
    visibility: "hidden",
    width: `${PREVIEW_WIDTH}px`,
    padding: `0px ${PADDING_RIGHT}px 0px ${PADDING_LEFT}px`, // Unified native margin!
    boxSizing: "border-box",
    fontFamily: fontFamily,
    fontSize: `${24 * globalScale}px`,
    lineHeight: `${FIXED_LINE_HEIGHT}px`,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    wordSpacing: PDF_WORD_SPACING,
    textRendering: "geometricPrecision" // match UI perfectly
  });
  document.body.appendChild(tempDiv);

  const pages: PageData[] = [];
  let currentPageBlocks: TextBlock[] = [];
  let currentHeightUsed = paddingTop;

  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    let remainingSegments = [...block.segments];
    let isFirstChunk = true;

    if (remainingSegments.length === 0 && !block.marginMarker) {
      if (currentHeightUsed + FIXED_LINE_HEIGHT <= writableLimit) {
        currentPageBlocks.push(block);
        currentHeightUsed += FIXED_LINE_HEIGHT;
      } else {
        pages.push({ blocks: currentPageBlocks, isEmpty: false });
        currentPageBlocks = [block];
        currentHeightUsed = paddingTop + FIXED_LINE_HEIGHT;
      }
      continue;
    }

    while (remainingSegments.length > 0 || (isFirstChunk && block.marginMarker)) {
      // If there isn't room for even a single line, push a new page and retry
      if (currentHeightUsed + FIXED_LINE_HEIGHT > writableLimit) {
        pages.push({ blocks: currentPageBlocks, isEmpty: false });
        currentPageBlocks = [];
        currentHeightUsed = paddingTop;
        continue;
      }

      // If it's just a margin marker but no text segments
      if (remainingSegments.length === 0 && block.marginMarker && isFirstChunk) {
        currentPageBlocks.push({
          ...block,
          segments: [],
          marginMarker: block.marginMarker
        });
        currentHeightUsed += FIXED_LINE_HEIGHT;
        break; // done with this block
      }

      tempDiv.style.textAlign = block.align;

      const fullRemainingText = remainingSegments.map((seg) => seg.text).join("");
      let totalLength = fullRemainingText.length;
      let low = 0, high = totalLength, splitCharIndex = 0;

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

        const rawHeight = tempDiv.offsetHeight;
        // Only accept if it fits on ONE line (with a tiny buffer for browser subpixel rendering)
        if (rawHeight <= FIXED_LINE_HEIGHT + 10) {
          splitCharIndex = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (splitCharIndex === 0) splitCharIndex = 1;

      if (splitCharIndex > 0 && splitCharIndex < totalLength) {
        const charAfter = fullRemainingText[splitCharIndex];
        // If we didn't naturally land on a space/newline, backtrack to the nearest one
        if (![" ", "\n"].includes(charAfter)) {
          const lastSpace = fullRemainingText.lastIndexOf(" ", splitCharIndex);
          const lastNewline = fullRemainingText.lastIndexOf("\n", splitCharIndex);
          const bestBreak = Math.max(lastSpace, lastNewline);

          // Only snap back if we found a reasonable break point
          if (bestBreak > splitCharIndex - 100 && bestBreak > 0) {
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
          currentSegments.push({ text: firstPartText, isLarge: splitSeg.isLarge });
        }

        let remText = splitSeg.text.substring(segmentSplitPos);

        // CRITICAL FIX: Eliminate leading spaces on the next line if we cleanly wrapped at a space
        if (remText.startsWith(" ")) {
          remText = remText.substring(1);
        } else if (remText.startsWith("\n")) {
          remText = remText.substring(1);
        }

        let remSegments = remainingSegments.slice(splitSegIndex + 1);
        if (remText.length > 0) {
          remSegments = [{ text: remText, isLarge: splitSeg.isLarge }, ...remSegments];
        }
        remainingSegments = remSegments;
      } else {
        remainingSegments = []; // consumed everything safely
      }

      if (currentSegments.length > 0 || (isFirstChunk && block.marginMarker)) {
        currentPageBlocks.push({
          ...block,
          segments: currentSegments,
          marginMarker: isFirstChunk ? block.marginMarker : undefined
        });
        currentHeightUsed += FIXED_LINE_HEIGHT;
      }

      isFirstChunk = false;
    }
  }

  if (currentPageBlocks.length > 0) {
    pages.push({ blocks: currentPageBlocks, isEmpty: false });
  }

  document.body.removeChild(tempDiv);
  return pages;
};