import React from 'react';
import { DocumentProvider } from './stores/DocumentContext';
import { TOCTree } from './components/TOCTree';
import { ChunkEditor } from './components/ChunkEditor';
import { PdfViewer } from './components/PdfViewer';
export function App() {
  return (
    <DocumentProvider>
      <div className="flex h-screen w-full overflow-hidden bg-gray-100 font-sans">
        {/* Left Pane: Table of Contents */}
        <TOCTree />

        {/* Center Pane: Markdown Chunk Editor */}
        <ChunkEditor />

        {/* Right Pane: Simulated PDF Viewer */}
        <PdfViewer />
      </div>
    </DocumentProvider>);

}