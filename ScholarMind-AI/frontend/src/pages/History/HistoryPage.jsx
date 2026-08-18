import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, Search, Trash2, Loader2, BookOpen, FileText, FolderOpen, Bookmark } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import historyService from '../../services/historyService';
import EmptyState from '../../components/UI/EmptyState';
import toast from 'react-hot-toast';

const SESSION_TYPE_ICON = {
  analysis: FileText,
  chat: BookOpen,
  summary: BookOpen,
  review: FolderOpen,
};

function groupByDate(sessions) {
  const groups = { Today: [], Yesterday: [], 'This Week': [], 'This Month': [], Older: [] };
  sessions.forEach((s) => {
    const date = new Date(s.created_at);
    if (isToday(date)) groups.Today.push(s);
    else if (isYesterday(date)) groups.Yesterday.push(s);
    else if (isThisWeek(date)) groups['This Week'].push(s);
    else if (isThisMonth(date)) groups['This Month'].push(s);
    else groups.Older.push(s);
  });
  return groups;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await historyService.list();
        setSessions(Array.isArray(data) ? data : data?.items || []);
      } catch {
        toast.error('Failed to load history.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = sessions.filter((s) =>
    !searchQuery.trim() || s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = groupByDate(filtered);

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-0">
      {/* Sidebar */}
      <div className="w-72 border-r border-border flex flex-col bg-bgCard/30">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-bold text-textPrimary mb-3">Research History</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-9 py-2 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-accent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-textMuted">No history found.</div>
          ) : (
            Object.entries(grouped).map(([label, items]) =>
              items.length > 0 ? (
                <div key={label} className="mb-4">
                  <p className="text-[10px] font-bold uppercase text-textMuted px-2 py-1 tracking-widest">{label}</p>
                  {items.map((s) => {
                    const Icon = SESSION_TYPE_ICON[s.session_type] || Clock;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs mb-0.5 transition-colors ${
                          selected?.id === s.id
                            ? 'bg-accent/15 text-accent border border-accent/30'
                            : 'text-textSecondary hover:bg-bgCard hover:text-textPrimary'
                        }`}
                      >
                        <Icon size={13} className="shrink-0" />
                        <span className="truncate flex-1">{s.title || 'Untitled Session'}</span>
                        <ChevronRight size={12} className="shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ) : null
            )
          )}
        </div>
      </div>

      {/* Detail pane */}
      <div className="flex-1 flex items-center justify-center p-8">
        {selected ? (
          <div className="max-w-lg w-full glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-textPrimary">{selected.title}</h3>
                <p className="text-xs text-textMuted">{format(new Date(selected.created_at), 'PPp')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-bgInput p-3 rounded-lg">
                <p className="text-textMuted mb-0.5">Type</p>
                <p className="font-semibold text-textPrimary capitalize">{selected.session_type}</p>
              </div>
              <div className="bg-bgInput p-3 rounded-lg">
                <p className="text-textMuted mb-0.5">Messages</p>
                <p className="font-semibold text-textPrimary">{selected.message_count}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-textMuted">
            <Clock size={42} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a session to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
