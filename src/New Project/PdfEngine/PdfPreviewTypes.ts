// PdfPreviewTypes.ts

export interface TextSegment {
  text: string;
  isLarge: boolean;
}

export interface TextBlock {
  segments: TextSegment[];
  align: "left" | "center" | "right";
  id: string;
}

export interface PageData {
  blocks: TextBlock[];
  isEmpty: boolean;
}

export interface PdfPreviewProps {
  content: string;
  marginContent: string;
  activeFontFamily: string;
  isFontLoading: boolean;
  userCredits: number;
}