import React, { useState } from 'react';
import { Upload, X, File, FileText, FileJson, AlertCircle, Loader2 } from 'lucide-react';
import { processUploadedFiles } from '../core/fileProcessor';
import { useDocument } from '../stores/DocumentContext';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const { addDocument } = useDocument();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [mdFile, setMdFile] = useState<File | null>(null);
    const [tocFile, setTocFile] = useState<File | null>(null);
    const [chunksFile, setChunksFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'md' | 'toc' | 'chunks') => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (type === 'pdf') setPdfFile(file);
            if (type === 'md') setMdFile(file);
            if (type === 'toc') setTocFile(file);
            if (type === 'chunks') setChunksFile(file);
        }
    };

    const isReady = pdfFile && mdFile && tocFile && chunksFile;

    const handleSubmit = async () => {
        if (!isReady) return;
        setLoading(true);
        setError(null);

        try {
            const documentState = await processUploadedFiles(pdfFile, mdFile, tocFile, chunksFile);
            addDocument(documentState);
            setPdfFile(null);
            setMdFile(null);
            setTocFile(null);
            setChunksFile(null);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error processing files');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-[500px] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-blue-600" />
                        Thêm văn bản mới
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded flex items-center text-sm">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}
                    <p className="text-sm text-slate-600 mb-6">
                        Vui lòng tải lên đầy đủ 4 tệp tin để hệ thống có thể đồng bộ:
                    </p>

                    <div className="space-y-4">
                        {/* PDF Upload */}
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:border-red-300 transition-colors">
                            <div className="flex items-center space-x-3 flex-1 min-w-0 mr-4">
                                <div className="p-2 bg-red-100 text-red-600 rounded flex-shrink-0">
                                    <File className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-medium text-slate-800">PDF văn bản gốc</h3>
                                    <p className="text-xs text-slate-500 truncate" title={pdfFile ? pdfFile.name : ''}>{pdfFile ? pdfFile.name : 'Chưa chọn tệp (.pdf)'}</p>
                                </div>
                            </div>
                            <label className={`cursor-pointer px-3 py-1.5 rounded text-sm font-medium transition-colors flex-shrink-0 ${pdfFile ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                {pdfFile ? 'Đã chọn' : 'Chọn tệp'}
                                <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileChange(e, 'pdf')} />
                            </label>
                        </div>

                        {/* Markdown Upload */}
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:border-blue-300 transition-colors">
                            <div className="flex items-center space-x-3 flex-1 min-w-0 mr-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded flex-shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-medium text-slate-800">File markdown (Nội dung OCR)</h3>
                                    <p className="text-xs text-slate-500 truncate" title={mdFile ? mdFile.name : ''}>{mdFile ? mdFile.name : 'Chưa chọn tệp (.md)'}</p>
                                </div>
                            </div>
                            <label className={`cursor-pointer px-3 py-1.5 rounded text-sm font-medium transition-colors flex-shrink-0 ${mdFile ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                {mdFile ? 'Đã chọn' : 'Chọn tệp'}
                                <input type="file" accept=".md,.txt" className="hidden" onChange={(e) => handleFileChange(e, 'md')} />
                            </label>
                        </div>

                        {/* TOC Upload */}
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:border-emerald-300 transition-colors">
                            <div className="flex items-center space-x-3 flex-1 min-w-0 mr-4">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded flex-shrink-0">
                                    <FileJson className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-medium text-slate-800">File mục lục (TOC)</h3>
                                    <p className="text-xs text-slate-500 truncate" title={tocFile ? tocFile.name : ''}>{tocFile ? tocFile.name : 'Chưa chọn tệp (.json)'}</p>
                                </div>
                            </div>
                            <label className={`cursor-pointer px-3 py-1.5 rounded text-sm font-medium transition-colors flex-shrink-0 ${tocFile ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                {tocFile ? 'Đã chọn' : 'Chọn tệp'}
                                <input type="file" accept=".json" className="hidden" onChange={(e) => handleFileChange(e, 'toc')} />
                            </label>
                        </div>

                        {/* Chunks Upload */}
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:border-purple-300 transition-colors">
                            <div className="flex items-center space-x-3 flex-1 min-w-0 mr-4">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded flex-shrink-0">
                                    <FileJson className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-medium text-slate-800">File chunks (Chunks JSON)</h3>
                                    <p className="text-xs text-slate-500 truncate" title={chunksFile ? chunksFile.name : ''}>{chunksFile ? chunksFile.name : 'Chưa chọn tệp (_chunks.json)'}</p>
                                </div>
                            </div>
                            <label className={`cursor-pointer px-3 py-1.5 rounded text-sm font-medium transition-colors flex-shrink-0 ${chunksFile ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                {chunksFile ? 'Đã chọn' : 'Chọn tệp'}
                                <input type="file" accept=".json" className="hidden" onChange={(e) => handleFileChange(e, 'chunks')} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-slate-50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isReady || loading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded transition-colors flex items-center
                            ${isReady && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'}
                         `}
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}
