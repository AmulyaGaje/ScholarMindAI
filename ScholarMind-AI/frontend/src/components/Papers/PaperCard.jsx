import React, { useState } from 'react';
import { FileText, Sparkles, Trash2, ArrowRight, Bookmark } from 'lucide-react';
import { format } from 'date-fns';

export default function PaperCard({ paper, onOpen, onDelete, onToggleBookmark }) {
  const [bookmarking, setBookmarking] = useState(false);

  const formattedSize = paper?.file_size
    ? `${(paper.file_size / (1024 * 1024)).toFixed(1)} MB`
    : 'PDF';

  const authorsText = Array.isArray(paper?.authors)
    ? paper.authors.join(', ')
    : paper?.authors || 'Academic Author';

  // Extract real analysis status
  const analysisStatus = paper?.analysis?.analysis_status || 'ready';

  const renderStatusBadge = () => {
    switch (analysisStatus) {
      case 'processing':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            Analyzing...
          </span>
        );
      case 'failed':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
            Failed
          </span>
        );
      case 'completed':
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Ready
          </span>
        );
    }
  };

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (!onToggleBookmark) return;
    setBookmarking(true);
    try {
      await onToggleBookmark(paper);
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <div
      onClick={() => onOpen && onOpen(paper)}
      className="glass-card p-4 rounded-xl border border-border hover:border-accent/60 cursor-pointer transition-all flex flex-col justify-between group"
    >
      <div>
        {/* PDF Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          {renderStatusBadge()}
        </div>

        <h3 className="font-bold text-sm text-textPrimary group-hover:text-accent transition-colors line-clamp-2 mb-1">
          {paper?.title || paper?.file_name}
        </h3>

        <p className="text-xs text-textSecondary truncate mb-3">{authorsText}</p>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] text-textMuted pt-3 border-t border-border/40">
          <span>{paper?.created_at ? format(new Date(paper.created_at), 'MMM d, yyyy') : 'Uploaded'}</span>
          <span>{formattedSize}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen && onOpen(paper);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accentHover transition-colors"
          >
            <Sparkles size={13} />
            <span>AI Analysis</span>
            <ArrowRight size={12} />
          </button>

          <div className="flex items-center gap-1">
            {onToggleBookmark && (
              <button
                onClick={handleBookmarkClick}
                disabled={bookmarking}
                className={`p-1.5 rounded transition-colors ${
                  paper.is_bookmarked 
                    ? 'text-amber-400 hover:bg-amber-400/10' 
                    : 'text-textMuted hover:text-amber-400 hover:bg-amber-400/10'
                }`}
                title={paper.is_bookmarked ? 'Remove bookmark' : 'Bookmark paper'}
              >
                <Bookmark size={14} fill={paper.is_bookmarked ? 'currentColor' : 'none'} />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(paper.id);
                }}
                className="p-1.5 rounded text-textMuted hover:text-danger hover:bg-danger/10 transition-colors"
                title="Delete paper"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
