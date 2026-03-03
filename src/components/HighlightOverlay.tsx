import React from 'react';
import { MatchSpan } from '../types/document';
interface HighlightOverlayProps {
  spans: MatchSpan[];
  zoom: number;
}
export function HighlightOverlay({ spans, zoom }: HighlightOverlayProps) {
  if (!spans || spans.length === 0) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {spans.map((span, spanIdx) => {
        // Determine color based on confidence
        let colorClass = 'bg-emerald-400/30 border-emerald-500';
        if (span.confidence < 0.7) {
          colorClass = 'bg-red-400/30 border-red-500';
        } else if (span.confidence < 0.9) {
          colorClass = 'bg-amber-400/30 border-amber-500';
        }
        return span.bboxes.map((bbox, bboxIdx) =>
        <div
          key={`${spanIdx}-${bboxIdx}`}
          className={`absolute border-2 rounded-sm ${colorClass} animate-pulse-once`}
          style={{
            left: `${bbox.x * zoom}px`,
            top: `${bbox.y * zoom}px`,
            width: `${bbox.w * zoom}px`,
            height: `${bbox.h * zoom}px`,
            transition: 'all 0.3s ease-in-out'
          }}>

            {/* Confidence Chip for the first bbox of a span */}
            {bboxIdx === 0 &&
          <div className="absolute -top-6 left-0 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                {Math.round(span.confidence * 100)}% Match
              </div>
          }
          </div>
        );
      })}
    </div>);

}