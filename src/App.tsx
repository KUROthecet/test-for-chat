import { useState, useCallback, useRef } from 'react';
import { DocumentProvider } from './stores/DocumentContext';
import { TOCTree } from './components/TOCTree';
import { DocumentEditor } from './components/DocumentEditor';
import { PdfViewer } from './components/PdfViewer';
import { Header } from './components/Header';

export function App() {
  const [pdfWidth, setPdfWidth] = useState(30);
  const isDragging = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const newWidth = ((document.body.clientWidth - e.clientX) / document.body.clientWidth) * 100;
    setPdfWidth(Math.max(20, Math.min(newWidth, 60)));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  return (
    <DocumentProvider>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100 font-sans">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <TOCTree />

          <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <DocumentEditor />
          </div>

          <div
            className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize z-50 transition-colors flex-shrink-0"
            onMouseDown={handleMouseDown}
          />

          <div style={{ width: `${pdfWidth}%`, minWidth: 0, display: 'flex', flexShrink: 0 }}>
            <PdfViewer />
          </div>
        </div>
      </div>
    </DocumentProvider>
  );
}