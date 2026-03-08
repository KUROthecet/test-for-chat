import { useState } from 'react';
import { Plus, ChevronDown, FileText } from 'lucide-react';
import { useDocument } from '../stores/DocumentContext';
import { UploadModal } from '../ui/UploadModal';

export function Header() {
    const { documents, activeDocumentId, switchDocument, addDocument } = useDocument();
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const activeDoc = activeDocumentId ? documents[activeDocumentId] : null;

    return (
        <>
            <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shadow-sm flex-shrink-0 z-30 relative">
                <div className="flex items-center space-x-4">
                    <h1 className="text-lg font-bold text-white tracking-wide">OCR REVIEW</h1>

                    <div className="h-6 w-px bg-slate-700 mx-2"></div>

                    {/* Switch Document Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md transition-colors border border-slate-700">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium w-48 text-left truncate">
                                {activeDoc ? activeDoc.name : 'Chưa chọn văn bản'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden hidden group-hover:block z-50">
                            <div className="py-1">
                                {Object.values(documents).length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-slate-500 italic">
                                        Chưa có văn bản nào
                                    </div>
                                ) : (
                                    Object.values(documents).map(doc => (
                                        <button
                                            key={doc.id}
                                            onClick={() => switchDocument(doc.id)}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center
                                                ${doc.id === activeDocumentId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-100'}
                                            `}
                                        >
                                            <FileText className={`w-4 h-4 mr-2 ${doc.id === activeDocumentId ? 'text-blue-500' : 'text-slate-400'}`} />
                                            <span className="truncate">{doc.name}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        id="dev-load-btn"
                        onClick={async () => {
                            const { processUploadedFiles } = await import('../core/fileProcessor');
                            const [pdfBlob, mdBlob, jsonBlob, chunksBlob] = await Promise.all([
                                fetch('/HD_chan_doan_tram_y_te_xa_20121220.pdf').then(r => r.blob()),
                                fetch('/HD_chan_doan_tram_y_te_xa_20121220.extraction_clean.md').then(r => r.blob()),
                                fetch('/HD_chan_doan_tram_y_te_xa_20121220_toc_structure.json').then(r => r.blob()),
                                fetch('/HD_chan_doan_tram_y_te_xa_20121220_chunks.json').then(r => r.blob())
                            ]);
                            const pdfFile = new File([pdfBlob], 'HD_chan_doan_tram_y_te_xa_20121220.pdf', { type: 'application/pdf' });
                            const mdFile = new File([mdBlob], 'HD_chan_doan_tram_y_te_xa_20121220.extraction_clean.md', { type: 'text/markdown' });
                            const jsonFile = new File([jsonBlob], 'HD_chan_doan_tram_y_te_xa_20121220_toc_structure.json', { type: 'application/json' });
                            const chunksFile = new File([chunksBlob], 'HD_chan_doan_tram_y_te_xa_20121220_chunks.json', { type: 'application/json' });
                            const docState = await processUploadedFiles(pdfFile, mdFile, jsonFile, chunksFile);
                            addDocument(docState);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md px-4 py-2 text-sm font-medium shadow-sm cursor-pointer"
                        title="Load local dev test files"
                    >
                        DEV LOAD
                    </button>
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors shadow-sm cursor-pointer"
                        title="Thêm văn bản gốc mới"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
            />
        </>
    );
}
