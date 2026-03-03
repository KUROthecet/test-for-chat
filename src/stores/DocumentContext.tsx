import React, { useCallback, useState, createContext, useContext } from 'react';
import { TOCNode, Chunk, MatchSpan, BBox } from '../types/document';
import { mockTocNodes, mockTocRootIds, mockChunks } from '../data/mockData';
interface DocumentContextType {
  tocNodes: Record<string, TOCNode>;
  tocRootIds: string[];
  chunks: Chunk[];
  selectedChunkId: string | null;
  selectedTocNodeId: string | null;
  activePdfPage: number;
  highlightSpans: MatchSpan[];
  isManualBinding: boolean;
  searchQuery: string;
  pdfZoom: number;
  selectTocNode: (nodeId: string) => void;
  selectChunk: (chunkId: string) => void;
  toggleTocNode: (nodeId: string) => void;
  editChunk: (chunkId: string, content: string) => void;
  saveChunk: (chunkId: string) => void;
  revertChunk: (chunkId: string) => void;
  verifyChunk: (chunkId: string) => void;
  toggleEditing: (chunkId: string) => void;
  setManualBinding: (active: boolean, chunkId?: string) => void;
  saveManualBinding: (chunkId: string, bboxes: BBox[]) => void;
  setSearchQuery: (query: string) => void;
  setPdfZoom: (zoom: number) => void;
  goToPage: (pageIndex: number) => void;
}
const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined
);
export function DocumentProvider({ children }: {children: ReactNode;}) {
  const [tocNodes, setTocNodes] =
  useState<Record<string, TOCNode>>(mockTocNodes);
  const [chunks, setChunks] = useState<Chunk[]>(mockChunks);
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null);
  const [selectedTocNodeId, setSelectedTocNodeId] = useState<string | null>(
    null
  );
  const [activePdfPage, setActivePdfPage] = useState<number>(1);
  const [highlightSpans, setHighlightSpans] = useState<MatchSpan[]>([]);
  const [isManualBinding, setIsManualBinding] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pdfZoom, setPdfZoom] = useState<number>(1);
  const selectTocNode = useCallback(
    (nodeId: string) => {
      setSelectedTocNodeId(nodeId);
      const node = tocNodes[nodeId];
      if (node && node.chunkIds.length > 0) {
        const firstChunkId = node.chunkIds[0];
        setSelectedChunkId(firstChunkId);
        const chunk = chunks.find((c) => c.id === firstChunkId);
        if (chunk) {
          setActivePdfPage(chunk.pageIndex);
          setHighlightSpans(chunk.matchSpans);
        }
      }
    },
    [tocNodes, chunks]
  );
  const selectChunk = useCallback(
    (chunkId: string) => {
      setSelectedChunkId(chunkId);
      const chunk = chunks.find((c) => c.id === chunkId);
      if (chunk) {
        setActivePdfPage(chunk.pageIndex);
        setHighlightSpans(chunk.matchSpans);
        // Find TOC node containing this chunk
        const parentNode = Object.values(tocNodes).find((n) =>
        n.chunkIds.includes(chunkId)
        );
        if (parentNode) {
          setSelectedTocNodeId(parentNode.id);
          // Ensure parent is expanded
          setTocNodes((prev) => ({
            ...prev,
            [parentNode.id]: {
              ...prev[parentNode.id],
              expanded: true
            }
          }));
        }
      }
    },
    [chunks, tocNodes]
  );
  const toggleTocNode = useCallback((nodeId: string) => {
    setTocNodes((prev) => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        expanded: !prev[nodeId].expanded
      }
    }));
  }, []);
  const editChunk = useCallback((chunkId: string, content: string) => {
    setChunks((prev) =>
    prev.map((c) =>
    c.id === chunkId ?
    {
      ...c,
      correctedContent: content,
      isModified: true
    } :
    c
    )
    );
  }, []);
  const saveChunk = useCallback((chunkId: string) => {
    setChunks((prev) =>
    prev.map((c) =>
    c.id === chunkId ?
    {
      ...c,
      isEditing: false,
      isModified: false,
      content: c.correctedContent || c.content
    } :
    c
    )
    );
  }, []);
  const revertChunk = useCallback((chunkId: string) => {
    setChunks((prev) =>
    prev.map((c) =>
    c.id === chunkId ?
    {
      ...c,
      correctedContent: c.content,
      isModified: false
    } :
    c
    )
    );
  }, []);
  const verifyChunk = useCallback((chunkId: string) => {
    setChunks((prev) =>
    prev.map((c) =>
    c.id === chunkId ?
    {
      ...c,
      isVerified: !c.isVerified
    } :
    c
    )
    );
  }, []);
  const toggleEditing = useCallback((chunkId: string) => {
    setChunks((prev) =>
    prev.map((c) => {
      if (c.id === chunkId) {
        return {
          ...c,
          isEditing: !c.isEditing,
          correctedContent:
          !c.isEditing && !c.correctedContent ?
          c.content :
          c.correctedContent
        };
      }
      return c;
    })
    );
  }, []);
  const setManualBinding = useCallback(
    (active: boolean, chunkId?: string) => {
      setIsManualBinding(active);
      if (chunkId && active) {
        selectChunk(chunkId);
      }
    },
    [selectChunk]
  );
  const saveManualBinding = useCallback(
    (chunkId: string, bboxes: BBox[]) => {
      setChunks((prev) =>
      prev.map((c) => {
        if (c.id === chunkId) {
          const newSpan: MatchSpan = {
            pageIndex: activePdfPage,
            startItemIndex: 0,
            endItemIndex: 0,
            confidence: 1.0,
            bboxes
          };
          return {
            ...c,
            mappingStatus: 'user_bound',
            matchSpans: [newSpan]
          };
        }
        return c;
      })
      );
      setIsManualBinding(false);
      // Update highlights immediately
      setHighlightSpans([
      {
        pageIndex: activePdfPage,
        startItemIndex: 0,
        endItemIndex: 0,
        confidence: 1.0,
        bboxes
      }]
      );
    },
    [activePdfPage]
  );
  const goToPage = useCallback((pageIndex: number) => {
    setActivePdfPage(pageIndex);
  }, []);
  return (
    <DocumentContext.Provider
      value={{
        tocNodes,
        tocRootIds: mockTocRootIds,
        chunks,
        selectedChunkId,
        selectedTocNodeId,
        activePdfPage,
        highlightSpans,
        isManualBinding,
        searchQuery,
        pdfZoom,
        selectTocNode,
        selectChunk,
        toggleTocNode,
        editChunk,
        saveChunk,
        revertChunk,
        verifyChunk,
        toggleEditing,
        setManualBinding,
        saveManualBinding,
        setSearchQuery,
        setPdfZoom,
        goToPage
      }}>

      {children}
    </DocumentContext.Provider>);

}
export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}