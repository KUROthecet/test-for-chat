import React from 'react';
import { ListTree, Expand, Shrink } from 'lucide-react';
import { useDocument } from '../stores/DocumentContext';
import { SearchBar } from './SearchBar';
import { TOCNode } from './TOCNode';
export function TOCTree() {
  const { tocRootIds, searchQuery, setSearchQuery, chunks } = useDocument();
  const verifiedCount = chunks.filter((c) => c.isVerified).length;
  const reviewCount = chunks.filter(
    (c) => c.mappingStatus === 'needs_manual_review'
  ).length;
  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-72 flex-shrink-0">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center uppercase tracking-wider">
            <ListTree className="w-4 h-4 mr-2 text-slate-400" />
            Table of Contents
          </h2>
          <div className="flex space-x-1">
            <button
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
              title="Expand All">

              <Expand className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
              title="Collapse All">

              <Shrink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter nodes..." />

      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {tocRootIds.map((rootId) =>
        <TOCNode key={rootId} nodeId={rootId} depth={0} />
        )}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-900/50 text-xs text-slate-400 flex justify-between items-center">
        <span>{chunks.length} chunks</span>
        <div className="flex space-x-3">
          <span className="flex items-center text-emerald-500" title="Verified">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
            {verifiedCount}
          </span>
          <span className="flex items-center text-red-400" title="Needs Review">
            <span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span>
            {reviewCount}
          </span>
        </div>
      </div>
    </div>);

}