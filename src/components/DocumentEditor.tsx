import { useMemo, useRef, useEffect, useState } from 'react';
import { useDocument } from '../stores/DocumentContext';
import { FileEdit, GripHorizontal } from 'lucide-react';

interface TextLine {
    text: string;
    startOffset: number;
    endOffset: number;
    index: number;
}

export function DocumentEditor() {
    const { activeDocument, selectedChunkId, activeCharRange, updateSectionBoundary, selectChunk, updateMarkdown } = useDocument();

    const [draggedChunkId, setDraggedChunkId] = useState<string | null>(null);
    const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLDivElement>(null);

    const fullText = activeDocument?.markdown || '';
    const chunks = activeDocument?.chunks || [];

    const lines = useMemo(() => {
        if (!fullText) return [];
        const result: TextLine[] = [];
        let currentOffset = 0;
        const splitLines = fullText.split('\n');
        for (let i = 0; i < splitLines.length; i++) {
            const lineLen = splitLines[i].length;
            result.push({
                text: splitLines[i],
                startOffset: currentOffset,
                endOffset: currentOffset + lineLen,
                index: i,
            });
            currentOffset += lineLen + 1;
        }
        return result;
    }, [fullText]);

    const chunksStartsByLine = useMemo(() => {
        const map = new Map<number, typeof chunks[0][]>();
        if (!lines.length) return map;

        chunks.forEach((chunk) => {
            if (chunk.startChar != null) {
                const targetLine = lines.find(l => l.startOffset <= chunk.startChar! && l.endOffset >= chunk.startChar!);
                const lineIndex = targetLine ? targetLine.index : (() => {
                    let closest = lines[0];
                    let minDist = Math.abs(chunk.startChar! - lines[0].startOffset);
                    for (let i = 1; i < lines.length; i++) {
                        const dist = Math.abs(chunk.startChar! - lines[i].startOffset);
                        if (dist < minDist) {
                            minDist = dist;
                            closest = lines[i];
                        }
                    }
                    return closest.index;
                })();

                const existing = map.get(lineIndex) || [];
                existing.push(chunk);
                map.set(lineIndex, existing);
            }
        });
        return map;
    }, [chunks, lines]);

    useEffect(() => {
        if (activeLineRef.current && containerRef.current) {
            activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedChunkId, activeCharRange]);

    const handleDragStart = (e: React.DragEvent, chunkId: string) => {
        setDraggedChunkId(chunkId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, line: TextLine) => {
        e.preventDefault();
        if (draggedChunkId) {
            updateSectionBoundary(draggedChunkId, line.startOffset);
            setDraggedChunkId(null);
        }
    };

    const handleLineClick = (line: TextLine) => {
        setEditingLineIndex(line.index);
        setEditValue(line.text);
    };

    const handleEditSave = (originalLine: TextLine) => {
        if (editValue !== originalLine.text) {
            const oldLength = originalLine.text.length;
            const newLength = editValue.length;
            const delta = newLength - oldLength;

            // Reconstruct the full markdown text
            const before = fullText.substring(0, originalLine.startOffset);
            const after = fullText.substring(originalLine.endOffset);
            const newFullText = before + editValue + after;

            updateMarkdown(newFullText, originalLine.startOffset, delta);
        }
        setEditingLineIndex(null);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent, originalLine: TextLine) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEditSave(originalLine);
        } else if (e.key === 'Escape') {
            setEditingLineIndex(null);
        }
    };

    if (!activeDocument) {
        return (
            <div className="flex flex-col h-full bg-white w-full min-w-[400px] items-center justify-center text-gray-400">
                <FileEdit className="w-12 h-12 mb-4 text-gray-300" />
                <p>No document selected</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white w-full min-w-[400px]">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-700 to-blue-600 flex items-center justify-between shadow-sm z-10">
                <h2 className="text-lg font-semibold text-white flex items-center">
                    <FileEdit className="w-5 h-5 mr-2 text-blue-200" />
                    Chỉnh sửa văn bản
                </h2>
                <div className="flex space-x-4 text-sm text-blue-100">
                    <span>{chunks.length} sections</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-sm" ref={containerRef}>
                <div className="max-w-4xl mx-auto font-mono text-gray-800 pb-64">
                    <p className="text-xs text-gray-400 mb-6 italic">
                        * Drag the visual section boundaries (blue bars) up or down to adjust start/end scopes.
                    </p>
                    {lines.map((line) => {
                        const chunksHere = chunksStartsByLine.get(line.index) || [];
                        const isActiveLine = chunksHere.some(c => c.id === selectedChunkId);

                        const isLineInActiveRange = activeCharRange &&
                            line.startOffset >= activeCharRange.start &&
                            line.endOffset <= activeCharRange.end;

                        // Determine if this is the FIRST line of the active range
                        const isFirstLineInActiveRange = activeCharRange &&
                            line.startOffset <= activeCharRange.start && line.endOffset >= activeCharRange.start;

                        return (
                            <div
                                key={line.index}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, line)}
                                className={`relative border-t-2 ${draggedChunkId ? 'border-dashed border-transparent hover:border-blue-300' : 'border-transparent'} group`}
                            >
                                {chunksHere.length > 0 && (
                                    <div className="absolute -top-3 left-0 right-0 flex flex-col items-start z-10">
                                        {chunksHere.map((chunkHere, idx) => {
                                            const isActiveChunk = chunkHere.id === selectedChunkId;
                                            return (
                                                <div
                                                    key={chunkHere.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, chunkHere.id)}
                                                    className={`h-6 flex items-center cursor-ns-resize opacity-70 hover:opacity-100 transition-opacity ${isActiveChunk ? 'opacity-100' : ''} mb-1`}
                                                    style={{ width: '100%', top: `${idx * -24}px`, position: idx > 0 ? 'absolute' : 'relative' }}
                                                >
                                                    <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded shadow flex items-center ml-2 border border-blue-600 max-w-[80%] truncate">
                                                        <GripHorizontal className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        {chunkHere.title}
                                                    </div>
                                                    <div className="flex-1 h-px bg-blue-500"></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div
                                    ref={isActiveLine ? activeLineRef : (isFirstLineInActiveRange ? activeLineRef : null)}
                                    onClick={() => {
                                        // Still select chunk for sync
                                        const clickedChunk = chunks.slice().reverse().find(c => c.startChar != null && c.startChar <= line.startOffset);
                                        if (clickedChunk) {
                                            selectChunk(clickedChunk.id);
                                        }
                                        if (editingLineIndex !== line.index) {
                                            handleLineClick(line);
                                        }
                                    }}
                                    className={`px-2 py-0.5 whitespace-pre-wrap ${chunksHere.length > 0 ? 'mt-' + (chunksHere.length * 4) : ''} ${isLineInActiveRange ? 'bg-yellow-100/50' : 'hover:bg-gray-50'} cursor-text min-h-[1.5rem]`}
                                >
                                    {editingLineIndex === line.index ? (
                                        <input
                                            type="text"
                                            autoFocus
                                            className="w-full bg-blue-50 border border-blue-300 rounded px-1 outline-none text-gray-800"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => handleEditSave(line)}
                                            onKeyDown={(e) => handleEditKeyDown(e, line)}
                                        />
                                    ) : (
                                        line.text || ' '
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
