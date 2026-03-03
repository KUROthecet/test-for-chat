import React from 'react';
import { FileEdit } from 'lucide-react';
import { useDocument } from '../stores/DocumentContext';
import { ChunkBlock } from './ChunkBlock';
export function ChunkEditor() {
  const { chunks } = useDocument();
  const modifiedCount = chunks.filter((c) => c.isModified).length;
  return (
    <div className="flex flex-col h-full bg-gray-50 flex-1 min-w-[400px]">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FileEdit className="w-5 h-5 mr-2 text-blue-600" />
          Document Editor
        </h2>
        <div className="flex space-x-4 text-sm">
          <span className="text-gray-500">{chunks.length} chunks</span>
          {modifiedCount > 0 &&
          <span className="text-amber-600 font-medium">
              {modifiedCount} unsaved
            </span>
          }
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {chunks.map((chunk) =>
          <ChunkBlock key={chunk.id} chunk={chunk} />
          )}
        </div>
      </div>
    </div>);

}