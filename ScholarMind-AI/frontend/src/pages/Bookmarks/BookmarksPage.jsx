import React, { useState, useEffect } from 'react';
import { Bookmark, Loader2, FileText, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import bookmarkService from '../../services/bookmarkService';
import EmptyState from '../../components/UI/EmptyState';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const data = await bookmarkService.list();
      setBookmarks(Array.isArray(data) ? data : data?.items || []);
    } catch {
      toast.error('Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookmarks(); }, []);

  const handleRemove = async (id) => {
    try {
      await bookmarkService.remove(id);
      toast.success('Bookmark removed.');
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error('Failed to remove bookmark.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Bookmark size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-textPrimary">Bookmarks</h1>
          <p className="text-sm text-textSecondary">Your saved research papers</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState
          title="No Bookmarks Yet"
          description="Papers you bookmark from your library will appear here."
          icon={Bookmark}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((b) => (
            <div key={b.id} className="glass-card p-4 rounded-xl border border-border hover:border-amber-500/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-textPrimary line-clamp-2 mb-1">
                    {b.paper?.title || b.project?.name || 'Bookmarked Item'}
                  </p>
                  <p className="text-xs text-textMuted">
                    {format(new Date(b.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(b.id)}
                  className="p-1.5 rounded text-textMuted hover:text-danger transition-colors shrink-0"
                  title="Remove bookmark"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {b.note && (
                <p className="mt-3 text-xs text-textSecondary bg-bgInput p-2 rounded-lg">{b.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
