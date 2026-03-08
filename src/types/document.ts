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

export interface Chunk {
  id: string;
  title: string;
  startChar: number | null;
  endChar: number | null;
  pageNumber?: number;
  content: string;
  correctedContent?: string;
  mappingStatus: MappingStatus;
  isEditing?: boolean;
  isModified?: boolean;
  isVerified?: boolean;
}

export interface DocumentState {
  id: string;
  name: string;
  pdfUrl: string;
  markdown: string;
  tocNodes: Record<string, TOCNode>;
  tocRootIds: string[];
  chunks: Chunk[];
}