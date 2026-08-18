import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from '../../components/Search/SearchBar';
import SearchFilters from '../../components/Search/SearchFilters';
import searchService from '../../services/searchService';
import { Loader2, Search, FileText, FolderKanban, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Papers'); // Papers, Projects, History
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (searchQuery, activeFilter) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // Map filter to API type
      let apiType = 'papers';
      if (activeFilter === 'Projects') apiType = 'projects';
      if (activeFilter === 'History') apiType = 'history';
      if (activeFilter === 'All') apiType = 'papers';

      const res = await searchService.search(searchQuery, apiType);
      setResults(res.items || []);
    } catch (err) {
      toast.error('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(query, filter);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, filter, handleSearch]);

  const handleResultClick = (item) => {
    if (filter === 'Projects') {
      navigate(`/projects/${item.id}`);
    } else if (filter === 'History') {
      navigate('/history');
    } else {
      // Default to library view or open analysis
      navigate('/library');
    }
  };

  const getIcon = () => {
    if (filter === 'Projects') return FolderKanban;
    if (filter === 'History') return Clock;
    return FileText;
  };

  const IconComponent = getIcon();

  return (
    <div className="pt-8 space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Global Search</h1>
        <p className="text-xs text-textSecondary max-w-sm mx-auto">
          Query research papers, projects, and analysis sessions globally.
        </p>
      </div>

      <div className="space-y-4">
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} />
        <SearchFilters activeFilter={filter} setFilter={setFilter} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : query && results.length === 0 ? (
        <div className="text-center py-16 text-xs text-textMuted">
          No results found for "{query}" under {filter}.
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3 max-w-2xl mx-auto">
          {results.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => handleResultClick(item)}
              className="flex items-center justify-between bg-bgCard p-4 rounded-xl border border-border hover:border-accent hover:shadow-glow cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <IconComponent size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-textPrimary">{item.title || item.name || 'Untitled'}</h3>
                  <p className="text-[10px] text-textMuted mt-0.5">
                    {item.authors ? (Array.isArray(item.authors) ? item.authors.join(', ') : item.authors) : (item.description || 'Reference')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <Search size={42} className="text-textMuted mb-2" />
          <p className="text-xs text-textMuted">Type query above to search...</p>
        </div>
      )}
    </div>
  );
}
