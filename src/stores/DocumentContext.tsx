import { useCallback, useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { TOCNode, Chunk, DocumentState } from '../types/document';
export interface CharRange {
  start: number;
  end: number;
}

interface DocumentContextType {
  documents: Record<string, DocumentState>;
  activeDocumentId: string | null;
  activeDocument: DocumentState | null;

  selectedChunkId: string | null;
  selectedTocNodeId: string | null;
  activeCharRange: CharRange | null;
  searchQuery: string;

  addDocument: (doc: DocumentState) => void;
  switchDocument: (id: string) => void;

  selectTocNode: (nodeId: string) => void;
  selectChunk: (chunkId: string) => void;
  toggleTocNode: (nodeId: string) => void;
  editChunk: (chunkId: string, content: string) => void;
  saveChunk: (chunkId: string) => void;
  revertChunk: (chunkId: string) => void;
  verifyChunk: (chunkId: string) => void;
  toggleEditing: (chunkId: string) => void;
  setSearchQuery: (query: string) => void;
  updateSectionBoundary: (chunkId: string, newStartChar: number) => void;
  updateMarkdown: (newMarkdown: string, editStartChar: number, delta: number) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Record<string, DocumentState>>({});
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null);
  const [selectedTocNodeId, setSelectedTocNodeId] = useState<string | null>(null);
  const [activeCharRange, setActiveCharRange] = useState<CharRange | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeDocument = activeDocumentId ? documents[activeDocumentId] : null;

  useEffect(() => {
    setSelectedChunkId(null);
    setSelectedTocNodeId(null);
    setActiveCharRange(null);
    setSearchQuery('');
  }, [activeDocumentId]);

  const addDocument = useCallback((doc: DocumentState) => {
    setDocuments((prev) => ({ ...prev, [doc.id]: doc }));
    setActiveDocumentId(doc.id);
  }, []);

  const switchDocument = useCallback((id: string) => {
    if (documents[id]) {
      setActiveDocumentId(id);
    }
  }, [documents]);

  const updateActiveDocumentChunks = useCallback((updater: (chunks: Chunk[]) => Chunk[]) => {
    if (!activeDocumentId) return;
    setDocuments(prev => {
      const doc = prev[activeDocumentId];
      return {
        ...prev,
        [activeDocumentId]: {
          ...doc,
          chunks: updater(doc.chunks)
        }
      }
    });
  }, [activeDocumentId]);

  const updateActiveDocumentTocNodes = useCallback((updater: (nodes: Record<string, TOCNode>) => Record<string, TOCNode>) => {
    if (!activeDocumentId) return;
    setDocuments(prev => {
      const doc = prev[activeDocumentId];
      return {
        ...prev,
        [activeDocumentId]: {
          ...doc,
          tocNodes: updater(doc.tocNodes)
        }
      }
    });
  }, [activeDocumentId]);

  const selectTocNode = useCallback(
    (nodeId: string) => {
      if (!activeDocument) return;
      setSelectedTocNodeId(nodeId);
      const node = activeDocument.tocNodes[nodeId];
      if (node && node.chunkIds.length > 0) {
        const firstChunkId = node.chunkIds[0];
        setSelectedChunkId(firstChunkId);
        const chunk = activeDocument.chunks.find((c) => c.id === firstChunkId);
        if (chunk && chunk.startChar != null && chunk.endChar != null) {
          setActiveCharRange({ start: chunk.startChar, end: chunk.endChar });
        }
      }
    },
    [activeDocument]
  );

  const selectChunk = useCallback(
    (chunkId: string) => {
      if (!activeDocument) return;
      setSelectedChunkId(chunkId);
      const chunk = activeDocument.chunks.find((c) => c.id === chunkId);
      if (chunk) {
        if (chunk.startChar != null && chunk.endChar != null) {
          setActiveCharRange({ start: chunk.startChar, end: chunk.endChar });
        } else {
          setActiveCharRange(null);
        }

        const parentNode = Object.values(activeDocument.tocNodes).find((n) =>
          n.chunkIds.includes(chunkId)
        );
        if (parentNode) {
          setSelectedTocNodeId(parentNode.id);
          updateActiveDocumentTocNodes((prev) => ({
            ...prev,
            [parentNode.id]: {
              ...prev[parentNode.id],
              expanded: true,
            },
          }));
        }
      }
    },
    [activeDocument, updateActiveDocumentTocNodes]
  );

  const toggleTocNode = useCallback((nodeId: string) => {
    updateActiveDocumentTocNodes((prev) => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        expanded: !prev[nodeId].expanded,
      },
    }));
  }, [updateActiveDocumentTocNodes]);

  const editChunk = useCallback((chunkId: string, content: string) => {
    updateActiveDocumentChunks((prev) =>
      prev.map((c) =>
        c.id === chunkId ? { ...c, correctedContent: content, isModified: true } : c
      )
    );
  }, [updateActiveDocumentChunks]);

  const saveChunk = useCallback((chunkId: string) => {
    updateActiveDocumentChunks((prev) =>
      prev.map((c) =>
        c.id === chunkId
          ? { ...c, isEditing: false, isModified: false, content: c.correctedContent || c.content }
          : c
      )
    );
  }, [updateActiveDocumentChunks]);

  const revertChunk = useCallback((chunkId: string) => {
    updateActiveDocumentChunks((prev) =>
      prev.map((c) =>
        c.id === chunkId ? { ...c, correctedContent: c.content, isModified: false } : c
      )
    );
  }, [updateActiveDocumentChunks]);

  const verifyChunk = useCallback((chunkId: string) => {
    updateActiveDocumentChunks((prev) =>
      prev.map((c) => (c.id === chunkId ? { ...c, isVerified: !c.isVerified } : c))
    );
  }, [updateActiveDocumentChunks]);

  const toggleEditing = useCallback((chunkId: string) => {
    updateActiveDocumentChunks((prev) =>
      prev.map((c) => {
        if (c.id === chunkId) {
          return {
            ...c,
            isEditing: !c.isEditing,
            correctedContent:
              !c.isEditing && !c.correctedContent ? c.content : c.correctedContent,
          };
        }
        return c;
      })
    );
  }, [updateActiveDocumentChunks]);

  const updateSectionBoundary = useCallback((chunkId: string, newStartChar: number) => {
    if (!activeDocument) return;

    setDocuments((prevDocs) => {
      const doc = prevDocs[activeDocument.id];
      const prevChunks = doc.chunks;

      const idx = prevChunks.findIndex((c) => c.id === chunkId);
      if (idx === -1) return prevDocs;

      const newChunks = prevChunks.map(c => ({ ...c }));
      newChunks[idx].startChar = newStartChar;
      newChunks[idx].isModified = true;
      newChunks[idx].mappingStatus = 'user_bound';

      // Update previous chunk's endChar to match the new startChar
      if (idx > 0 && newChunks[idx - 1].startChar !== null) {
        newChunks[idx - 1].endChar = newStartChar;
        newChunks[idx - 1].content = doc.markdown.substring(
          newChunks[idx - 1].startChar!,
          newStartChar
        );
        newChunks[idx - 1].isModified = true;
      }

      // Re-evaluate content for all chunks from current index onwards
      // because the new bound might overlap differently with their existing bounds
      for (let i = idx; i < newChunks.length; i++) {
        if (newChunks[i].startChar !== null) {
          const start = newChunks[i].startChar!;
          // For the current chunk being dragged, its endChar shouldn't change,
          // only its startChar (and previous chunk's endChar)
          // However, for generic robust logic, we map content correctly.
          const end = newChunks[i].endChar !== null ? newChunks[i].endChar! : doc.markdown.length;
          if (start <= end) {
            newChunks[i].content = doc.markdown.substring(start, end);
          } else {
            newChunks[i].content = ""; // Fallback if dragged past end
          }
        }
      }

      return {
        ...prevDocs,
        [activeDocument.id]: {
          ...doc,
          chunks: newChunks
        }
      };
    });

  }, [activeDocument]);

  const updateMarkdown = useCallback((newMarkdown: string, editStartChar: number, delta: number) => {
    if (!activeDocument) return;

    setDocuments(prevDocs => {
      const doc = prevDocs[activeDocument.id];
      const newChunks = doc.chunks.map(chunk => {
        const newChunk = { ...chunk };
        let contentChanged = false;

        // If the chunk starts AFTER the edit, shift its start and end
        if (newChunk.startChar !== null && newChunk.startChar > editStartChar) {
          newChunk.startChar += delta;
        }
        if (newChunk.endChar !== null && newChunk.endChar > editStartChar) {
          newChunk.endChar += delta;
        }

        // Update the content extraction for ALL chunks just in case the edit
        // fell inside their bounds, altering their lengths.
        if (newChunk.startChar !== null) {
          const end = newChunk.endChar !== null ? newChunk.endChar : newMarkdown.length;
          const newContent = newMarkdown.substring(newChunk.startChar, end);
          if (newContent !== newChunk.content) {
            newChunk.content = newContent;
            contentChanged = true;
          }
        }

        if (contentChanged) {
          newChunk.isModified = true;
        }

        return newChunk;
      });

      return {
        ...prevDocs,
        [activeDocument.id]: {
          ...doc,
          markdown: newMarkdown,
          chunks: newChunks
        }
      };
    });
  }, [activeDocument]);

  return (
    <DocumentContext.Provider
      value={{
        documents,
        activeDocument,
        activeDocumentId,
        selectedChunkId,
        selectedTocNodeId,
        activeCharRange,
        searchQuery,
        addDocument,
        switchDocument,
        selectTocNode,
        selectChunk,
        toggleTocNode,
        editChunk,
        saveChunk,
        revertChunk,
        verifyChunk,
        toggleEditing,
        setSearchQuery,
        updateSectionBoundary,
        updateMarkdown,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}