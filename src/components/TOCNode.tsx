
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { useDocument } from '../stores/DocumentContext';

interface TOCNodeProps {
  nodeId: string;
  depth: number;
}

export function TOCNode({ nodeId, depth }: TOCNodeProps) {
  const {
    activeDocument,
    selectedTocNodeId,
    toggleTocNode,
    selectTocNode,
    searchQuery
  } = useDocument();

  if (!activeDocument) return null;

  const node = activeDocument.tocNodes[nodeId];
  if (!node) return null;

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedTocNodeId === nodeId;
  const isExpanded = node.expanded;

  if (
    searchQuery &&
    !node.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !hasChildren
  ) {
    return null;
  }

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1.5 pr-3 cursor-pointer group transition-colors
          ${isSelected ? 'bg-blue-900/40 border-l-2 border-blue-500 text-blue-100' : 'border-l-2 border-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100'}
        `}
        style={{
          paddingLeft: `${depth * 12 + 8}px`
        }}
        onClick={() => selectTocNode(nodeId)}>

        <div
          className="w-5 h-5 flex items-center justify-center mr-1 text-slate-500 hover:text-slate-300"
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              toggleTocNode(nodeId);
            }
          }}>

          {hasChildren ?
            isExpanded ?
              <ChevronDown className="w-4 h-4" /> :
              <ChevronRight className="w-4 h-4" /> :
            <FileText className="w-3.5 h-3.5 opacity-50" />
          }
        </div>

        <span className="text-sm truncate flex-1" title={node.title}>
          {node.title}
        </span>

      </div>

      {hasChildren && isExpanded &&
        <div className="flex flex-col">
          {node.children.map((childId) =>
            <TOCNode key={childId} nodeId={childId} depth={depth + 1} />
          )}
        </div>
      }
    </div>
  );
}