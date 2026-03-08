import React, { useEffect, useRef } from 'react';
import { Edit2, CheckCircle, Save, Undo, MapPin } from 'lucide-react';
import { Chunk } from '../types/document';
import { StatusBadge } from './StatusBadge';
import { useDocument } from '../stores/DocumentContext';

interface ChunkBlockProps {
  chunk: Chunk;
}

export function ChunkBlock({ chunk }: ChunkBlockProps) {
  const {
    selectedChunkId,
    selectChunk,
    toggleEditing,
    editChunk,
    saveChunk,
    revertChunk,
    verifyChunk,
  } = useDocument();
  const isSelected = selectedChunkId === chunk.id;
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && blockRef.current) {
      blockRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isSelected]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    editChunk(chunk.id, e.target.value);
  };

  return (
    <div
      ref={blockRef}
      data-chunk-id={chunk.id}
      className={`mb-4 border rounded-lg transition-all duration-200 ${isSelected
          ? 'border-blue-400 shadow-md ring-1 ring-blue-400/50 bg-blue-50/30'
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      onClick={() => !isSelected && selectChunk(chunk.id)}
    >
      {/* Header Bar */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b rounded-t-lg ${isSelected ? 'bg-blue-50/80 border-blue-100' : 'bg-gray-50 border-gray-100'
          }`}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          {/* Scroll-to-markdown button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectChunk(chunk.id);
            }}
            className="flex items-center text-sm font-semibold text-gray-800 hover:text-blue-600 truncate transition-colors"
            title={
              chunk.startChar != null
                ? `Scroll đến ký tự ${chunk.startChar}–${chunk.endChar}`
                : 'Không có vị trí trong markdown'
            }
          >
            <MapPin className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{chunk.title}</span>
          </button>

          <StatusBadge status={chunk.mappingStatus} />

          {chunk.isModified && (
            <span
              className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"
              title="Chưa lưu"
            />
          )}
        </div>

        <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
          {chunk.startChar != null && (
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mr-1">
              {chunk.startChar}
            </span>
          )}

          <div className="w-px h-4 bg-gray-300 mx-1" />

          {chunk.isModified ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveChunk(chunk.id);
                }}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                title="Lưu thay đổi"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  revertChunk(chunk.id);
                }}
                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                title="Hoàn tác"
              >
                <Undo className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleEditing(chunk.id);
              }}
              className={`p-1.5 rounded transition-colors ${chunk.isEditing
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              title={chunk.isEditing ? 'Đóng editor' : 'Chỉnh sửa chunk'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              verifyChunk(chunk.id);
            }}
            className={`p-1.5 rounded transition-colors ${chunk.isVerified
                ? 'text-emerald-500 bg-emerald-50'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            title={chunk.isVerified ? 'Bỏ xác nhận' : 'Xác nhận đúng'}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {chunk.isEditing ? (
          <textarea
            value={chunk.correctedContent ?? chunk.content}
            onChange={handleContentChange}
            className="w-full min-h-[120px] p-3 text-sm font-mono text-gray-800 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            placeholder="Nội dung chunk..."
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-hidden relative">
            {(chunk.correctedContent ?? chunk.content).slice(0, 500)}
            {(chunk.correctedContent ?? chunk.content).length > 500 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}