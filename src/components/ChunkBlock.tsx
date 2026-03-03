import React, { useEffect, useRef } from 'react';
import { Search, Edit2, CheckCircle, Save, Undo, FileText } from 'lucide-react';
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
    verifyChunk
  } = useDocument();
  const isSelected = selectedChunkId === chunk.id;
  const blockRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isSelected && blockRef.current) {
      blockRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
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
      className={`mb-4 border rounded-lg transition-all duration-200 ${isSelected ? 'border-blue-400 shadow-md ring-1 ring-blue-400/50 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
      onClick={() => !isSelected && selectChunk(chunk.id)}>

      {/* Header Bar */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b rounded-t-lg ${isSelected ? 'bg-blue-50/80 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>

        <div className="flex items-center space-x-3 overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectChunk(chunk.id);
            }}
            className="flex items-center text-sm font-semibold text-gray-800 hover:text-blue-600 truncate transition-colors"
            title="Jump to PDF">

            <FileText className="w-4 h-4 mr-1.5 text-gray-400" />
            <span className="truncate">{chunk.title}</span>
          </button>

          <StatusBadge
            status={chunk.mappingStatus}
            confidence={chunk.matchSpans[0]?.confidence} />


          {chunk.isModified &&
          <span
            className="w-2 h-2 rounded-full bg-amber-500"
            title="Unsaved changes">
          </span>
          }
        </div>

        <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectChunk(chunk.id);
            }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Jump to PDF">

            <Search className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-1"></div>

          {chunk.isModified ?
          <>
              <button
              onClick={(e) => {
                e.stopPropagation();
                saveChunk(chunk.id);
              }}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
              title="Save changes">

                <Save className="w-4 h-4" />
              </button>
              <button
              onClick={(e) => {
                e.stopPropagation();
                revertChunk(chunk.id);
              }}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
              title="Revert changes">

                <Undo className="w-4 h-4" />
              </button>
            </> :

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleEditing(chunk.id);
            }}
            className={`p-1.5 rounded transition-colors ${chunk.isEditing ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            title={chunk.isEditing ? 'Close editor' : 'Edit chunk'}>

              <Edit2 className="w-4 h-4" />
            </button>
          }

          <button
            onClick={(e) => {
              e.stopPropagation();
              verifyChunk(chunk.id);
            }}
            className={`p-1.5 rounded transition-colors ${chunk.isVerified ? 'text-emerald-500 bg-emerald-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
            title={chunk.isVerified ? 'Mark as unverified' : 'Mark as verified'}>

            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {chunk.isEditing ?
        <textarea
          value={chunk.correctedContent ?? chunk.content}
          onChange={handleContentChange}
          className="w-full min-h-[120px] p-3 text-sm font-mono text-gray-800 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          placeholder="Enter chunk content..."
          onClick={(e) => e.stopPropagation()} /> :


        <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
            {chunk.correctedContent ?? chunk.content}
          </div>
        }
      </div>
    </div>);

}