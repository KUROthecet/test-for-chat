import { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDocument } from '../stores/DocumentContext';
import { Loader2, AlertCircle, FileText } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfViewer() {
    const { activeDocument, selectedChunkId } = useDocument();
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const chunks = activeDocument?.chunks || [];

    useEffect(() => {
        if (selectedChunkId && numPages && activeDocument) {
            const chunk = chunks.find(c => c.id === selectedChunkId);
            if (chunk && chunk.pageNumber) {
                const targetPage = Math.max(1, Math.min(chunk.pageNumber, numPages));
                setPageNumber(targetPage);
            }
        }
    }, [selectedChunkId, chunks, numPages, activeDocument]);

    useEffect(() => {
        if (containerRef.current) {
            const pageElement = containerRef.current.querySelector(`[data-page-number="${pageNumber}"]`);
            if (pageElement) {
                pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [pageNumber, numPages]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setError(null);
    }

    function onDocumentLoadError(error: Error) {
        console.error('Error loading PDF:', error);
        setError(error.message);
    }

    if (!activeDocument) {
        return (
            <div className="flex flex-col h-full bg-slate-50 w-full flex-shrink-0 border-l border-gray-200 items-center justify-center text-gray-400">
                <FileText className="w-12 h-12 mb-4 text-gray-300" />
                <p>No document selected</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 w-full flex-shrink-0 border-l border-gray-200">
            <div className="h-14 px-4 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 flex items-center shadow-sm z-20">
                <FileText className="w-5 h-5 mr-2 text-red-400" />
                <h2 className="text-sm font-semibold text-slate-100 truncate">
                    {activeDocument.name}
                </h2>
                {numPages && (
                    <span className="ml-auto text-xs text-slate-400 font-mono bg-slate-900/50 px-2 py-0.5 rounded">
                        Page {pageNumber} of {numPages}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative" ref={containerRef}>
                {error ? (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-700">Failed to load PDF</p>
                            <p className="text-xs text-red-500 mt-0.5">{error}</p>
                        </div>
                    </div>
                ) : (
                    <Document
                        file={activeDocument.pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-3 text-red-400" />
                                <p className="text-sm">Loading PDF document...</p>
                            </div>
                        }
                        className="flex flex-col items-center gap-4"
                    >
                        {Array.from(new Array(numPages || 0), (_, index) => (
                            <div
                                key={`page_${index + 1}`}
                                data-page-number={index + 1}
                                className={`shadow-lg border pb-2 bg-white transition-all duration-300 ${pageNumber === index + 1 ? 'ring-4 ring-blue-400 ring-opacity-50' : 'border-gray-200'
                                    }`}
                            >
                                <Page
                                    pageNumber={index + 1}
                                    width={containerRef.current ? containerRef.current.clientWidth - 40 : 400}
                                    renderAnnotationLayer={false}
                                    renderTextLayer={false}
                                />
                            </div>
                        ))}
                    </Document>
                )}
            </div>
        </div>
    );
}
