import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  MousePointer2,
  ChevronLeft,
  ChevronRight,
  AlertCircle } from
'lucide-react';
import { useDocument } from '../stores/DocumentContext';
import { mockPages } from '../data/mockData';
import { HighlightOverlay } from './HighlightOverlay';
export function PdfViewer() {
  const {
    activePdfPage,
    goToPage,
    pdfZoom,
    setPdfZoom,
    highlightSpans,
    isManualBinding,
    setManualBinding,
    saveManualBinding,
    selectedChunkId
  } = useDocument();
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({
    x: 0,
    y: 0
  });
  const [currentRect, setCurrentRect] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const pageData = mockPages[activePdfPage];
  const totalPages = Object.keys(mockPages).length;
  // Base A4 dimensions
  const baseWidth = 595;
  const baseHeight = 842;
  const handleZoomIn = () => setPdfZoom(Math.min(pdfZoom + 0.25, 3));
  const handleZoomOut = () => setPdfZoom(Math.max(pdfZoom - 0.25, 0.5));
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isManualBinding || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / pdfZoom;
    const y = (e.clientY - rect.top) / pdfZoom;
    setIsDrawing(true);
    setDrawStart({
      x,
      y
    });
    setCurrentRect({
      x,
      y,
      w: 0,
      h: 0
    });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / pdfZoom;
    const currentY = (e.clientY - rect.top) / pdfZoom;
    setCurrentRect({
      x: Math.min(drawStart.x, currentX),
      y: Math.min(drawStart.y, currentY),
      w: Math.abs(currentX - drawStart.x),
      h: Math.abs(currentY - drawStart.y)
    });
  };
  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentRect.w > 10 && currentRect.h > 10 && selectedChunkId) {
      saveManualBinding(selectedChunkId, [currentRect]);
    } else {
      setCurrentRect({
        x: 0,
        y: 0,
        w: 0,
        h: 0
      });
    }
  };
  return (
    <div className="flex flex-col h-full bg-[#e4e4e4] w-[45%] flex-shrink-0 border-l border-gray-300">
      {/* Toolbar */}
      <div className="h-14 px-4 bg-white border-b border-gray-300 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(Math.max(1, activePdfPage - 1))}
            disabled={activePdfPage <= 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-600">

            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-700 w-20 text-center">
            Page {activePdfPage} / {totalPages}
          </span>
          <button
            onClick={() => goToPage(Math.min(totalPages, activePdfPage + 1))}
            disabled={activePdfPage >= totalPages}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-600">

            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-white text-gray-600 shadow-sm">

              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium w-12 text-center text-gray-700">
              {Math.round(pdfZoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-white text-gray-600 shadow-sm">

              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setManualBinding(!isManualBinding)}
            className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${isManualBinding ? 'bg-blue-600 text-white shadow-inner' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>

            <MousePointer2 className="w-4 h-4 mr-2" />
            {isManualBinding ? 'Binding Mode Active' : 'Manual Bind'}
          </button>
        </div>
      </div>

      {/* Manual Binding Banner */}
      {isManualBinding &&
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center text-sm text-blue-800">
          <AlertCircle className="w-4 h-4 mr-2 text-blue-600" />
          Draw a rectangle on the document to manually bind the selected chunk.
          <button
          onClick={() => setManualBinding(false)}
          className="ml-auto text-blue-600 hover:text-blue-800 font-medium underline">

            Cancel
          </button>
        </div>
      }

      {/* PDF Canvas Area */}
      <div className="flex-1 overflow-auto p-8 flex justify-center custom-scrollbar relative">
        <div
          ref={containerRef}
          className={`relative bg-white shadow-2xl transition-transform origin-top ${isManualBinding ? 'cursor-crosshair' : ''}`}
          style={{
            width: `${baseWidth * pdfZoom}px`,
            height: `${baseHeight * pdfZoom}px`
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}>

          {/* Simulated Text Layer */}
          {pageData &&
          pageData.items.map((item, idx) =>
          <span
            key={idx}
            className="absolute text-gray-800 whitespace-nowrap select-text"
            style={{
              left: `${item.x * pdfZoom}px`,
              top: `${item.y * pdfZoom}px`,
              fontSize: `${12 * pdfZoom}px`,
              fontFamily: 'serif',
              transformOrigin: 'left top'
            }}>

                {item.str}
              </span>
          )}

          {/* Highlights */}
          <HighlightOverlay
            spans={highlightSpans.filter((s) => s.pageIndex === activePdfPage)}
            zoom={pdfZoom} />


          {/* Active Drawing Rectangle */}
          {isDrawing &&
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
            style={{
              left: `${currentRect.x * pdfZoom}px`,
              top: `${currentRect.y * pdfZoom}px`,
              width: `${currentRect.w * pdfZoom}px`,
              height: `${currentRect.h * pdfZoom}px`
            }} />

          }
        </div>
      </div>
    </div>);

}