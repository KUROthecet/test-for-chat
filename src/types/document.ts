export type MappingStatus =
'auto_mapped' |
'fuzzy_mapped' |
'needs_manual_review' |
'user_bound';

export interface TOCNode {
  id: string;
  title: string;
  level: number;
  children: string[]; // Array of child node IDs
  chunkIds: string[]; // Chunks associated with this node
  expanded?: boolean;
}

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MatchSpan {
  pageIndex: number;
  startItemIndex: number;
  endItemIndex: number;
  confidence: number;
  bboxes: BBox[];
}

export interface Chunk {
  id: string;
  title: string;
  startChar: number;
  endChar: number;
  pageIndex: number;
  relativeCharInPage: number;
  content: string;
  correctedContent?: string;
  mappingStatus: MappingStatus;
  matchSpans: MatchSpan[];
  isEditing?: boolean;
  isModified?: boolean;
  isVerified?: boolean;
}

export interface TextItem {
  itemIndex: number;
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  charStart: number;
  charEnd: number;
}

export interface PageTextItem {
  pageIndex: number;
  items: TextItem[];
  pageText: string;
}