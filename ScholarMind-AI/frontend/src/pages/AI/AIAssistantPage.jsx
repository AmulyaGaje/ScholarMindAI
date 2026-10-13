import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Sparkles, Send, BookOpen, GitCompare, Lightbulb,
  CheckCircle2, ChevronDown, ChevronUp, Trash2, Quote,
  FileText, ArrowRight, Bookmark, Search, Layers, Compass
} from 'lucide-react';
import paperService from '../../services/paperService';
import historyService from '../../services/historyService';
import Spinner from '../../components/UI/Spinner';
import toast from 'react-hot-toast';

const CATEGORY_PROMPTS = [
  { label: "Overview & Summary", query: "What is this paper about? Explain the main idea in simple words." },
  { label: "Methodology", query: "What methodology and architecture did the authors use, and why?" },
  { label: "Key Findings", query: "What are the key findings and main empirical results?" },
  { label: "Limitations & Future Scope", query: "What are the limitations and suggested future work?" },
  { label: "Simple Explanation", query: "Explain the entire methodology in simple terms for a student." },
];

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'compare' | 'gaps' | 'recommendations'

  // Papers state
  const [papers, setPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [selectedPaperId, setSelectedPaperId] = useState('');

  // RAG Chat state
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedChunks, setExpandedChunks] = useState({});
  const messagesEndRef = useRef(null);

  // Compare state
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  // Research Gaps state
  const [gapPaperId, setGapPaperId] = useState('');
  const [analyzingGaps, setAnalyzingGaps] = useState(false);
  const [gapsResult, setGapsResult] = useState(null);

  // Recommendations state
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsResult, setRecsResult] = useState(null);

  // Fetch papers on mount
  useEffect(() => {
    async function loadPapers() {
      try {
        setLoadingPapers(true);
        const res = await paperService.list({ limit: 50 });
        const list = Array.isArray(res) ? res : (res?.items || []);
        setPapers(list);
        if (list.length > 0) {
          setSelectedPaperId(list[0].id);
          setGapPaperId(list[0].id);
          if (list.length >= 2) {
            setSelectedCompareIds([list[0].id, list[1].id]);
          }
        }
      } catch {
        toast.error("Failed to load paper library.");
      } finally {
        setLoadingPapers(false);
      }
    }
    loadPapers();
  }, []);

  // Fetch recommendations when switching to recommendations tab
  useEffect(() => {
    if (activeTab === 'recommendations' && !recsResult) {
      async function loadRecs() {
        setLoadingRecs(true);
        try {
          const res = await paperService.getRecommendations();
          setRecsResult(res);
        } catch {
          toast.error("Failed to load recommendations.");
        } finally {
          setLoadingRecs(false);
        }
      }
      loadRecs();
    }
  }, [activeTab, recsResult]);

  // Scroll to bottom on new chat message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Handle Send RAG Q&A with multi-turn history
  const handleSendQuery = async (queryText) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;
    if (!selectedPaperId) {
      toast.error("Please select a paper from your library first.");
      return;
    }

    const selectedPaper = papers.find(p => p.id === selectedPaperId);
    const userMsg = { role: 'user', content: q, id: Date.now() };

    // Prepare chat history (previous turns) for coreference resolution
    const historyPayload = messages.map(m => ({
      role: m.role,
      content: m.content
    })).slice(-6); // last 6 turns

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setSending(true);

    try {
      const res = await paperService.chat(selectedPaperId, q, historyPayload);

      const aiMsg = {
        role: 'assistant',
        content: res.answer,
        grounded: res.grounded,
        paperTitle: res.paper_title || selectedPaper?.title,
        sources: res.sources || [],
        retrievedChunks: res.retrieved_chunks || [],
        id: Date.now() + 1,
      };

      setMessages(prev => [...prev, aiMsg]);

      // Async history logging
      historyService.createSession({
        paper_id: selectedPaperId,
        title: `Q&A: ${q.slice(0, 40)}...`,
        session_type: 'chat'
      }).catch(() => {});

    } catch (err) {
      const errorMsg = err?.response?.data?.detail || "Failed to process RAG query.";
      toast.error(errorMsg);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error: ${errorMsg}`,
          grounded: false,
          sources: [],
          retrievedChunks: [],
          id: Date.now() + 1,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setExpandedChunks({});
    toast.success("Conversation cleared.");
  };

  const toggleChunkExpand = (msgId) => {
    setExpandedChunks(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Compare Handler
  const handleCompare = async () => {
    if (selectedCompareIds.length < 2) {
      toast.error("Select at least 2 papers for comparison.");
      return;
    }
    setComparing(true);
    setComparisonResult(null);
    try {
      const res = await paperService.compare(selectedCompareIds);
      setComparisonResult(res);
      toast.success(`Compared ${res.compared_count} papers successfully.`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to generate comparison.");
    } finally {
      setComparing(false);
    }
  };

  // Research Gaps Handler
  const handleIdentifyGaps = async () => {
    if (!gapPaperId) {
      toast.error("Please select a paper.");
      return;
    }
    setAnalyzingGaps(true);
    setGapsResult(null);
    try {
      const res = await paperService.getResearchGaps([gapPaperId]);
      setGapsResult(res);
      toast.success("Research gaps identified.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to analyze research gaps.");
    } finally {
      setAnalyzingGaps(false);
    }
  };

  if (loadingPapers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="text-sm text-textMuted mt-4 animate-pulse">Initializing RAG Engine & Research Workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">AI Research Assistant</h1>
            <p className="text-xs text-textSecondary">RAG Context Understanding · Grounded Synthesis · Multi-Paper Reasoning</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-bgInput p-1 rounded-xl border border-border shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-accent text-white shadow-sm'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <BookOpen size={14} />
            <span>Paper Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'compare'
                ? 'bg-accent text-white shadow-sm'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <GitCompare size={14} />
            <span>Compare</span>
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'gaps'
                ? 'bg-accent text-white shadow-sm'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Lightbulb size={14} />
            <span>Gaps</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-accent text-white shadow-sm'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Compass size={14} />
            <span>Recommendations</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: GROUNDED RAG PAPER Q&A ───────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Selector & Category Prompts */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-4 rounded-xl border border-border space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-textMuted block">
                Select Research Paper
              </label>
              {papers.length === 0 ? (
                <p className="text-xs text-textMuted">No papers found in library. Please upload a PDF.</p>
              ) : (
                <select
                  value={selectedPaperId}
                  onChange={(e) => {
                    setSelectedPaperId(e.target.value);
                    setMessages([]);
                  }}
                  className="w-full bg-bgInput border border-border rounded-lg px-3 py-2 text-xs font-medium text-textPrimary focus:outline-none focus:border-accent"
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title.length > 32 ? p.title.slice(0, 32) + '...' : p.title}
                    </option>
                  ))}
                </select>
              )}

              {selectedPaperId && (
                <div className="pt-2 text-[11px] text-textSecondary space-y-1.5 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-textMuted">RAG Pipeline:</span>
                    <span className="text-emerald-400 font-medium">Active (pgvector)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-textMuted">Mode:</span>
                    <span className="text-indigo-400 font-medium">Grounded Synthesis</span>
                  </div>
                </div>
              )}
            </div>

            {/* Category Prompts */}
            <div className="glass-card p-4 rounded-xl border border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-3 flex items-center gap-1.5">
                <Sparkles size={12} className="text-accent" />
                <span>Quick Academic Queries</span>
              </h4>
              <div className="space-y-2">
                {CATEGORY_PROMPTS.map((cp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(cp.query)}
                    disabled={sending || !selectedPaperId}
                    className="w-full text-left p-2.5 rounded-lg bg-bgInput/50 hover:bg-accent/10 border border-border hover:border-accent/40 transition-all text-xs disabled:opacity-50 group"
                  >
                    <span className="font-semibold text-textPrimary group-hover:text-accent block mb-0.5">{cp.label}</span>
                    <span className="text-[10px] text-textMuted line-clamp-1">"{cp.query}"</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div className="lg:col-span-3 flex flex-col h-[680px] glass-card rounded-2xl border border-border overflow-hidden">
            {/* Chat Header Bar */}
            <div className="px-5 py-3 border-b border-border bg-bgSidebar/40 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="text-accent shrink-0" />
                <span className="text-xs font-bold text-textPrimary truncate">
                  {papers.find(p => p.id === selectedPaperId)?.title || "Select a Paper"}
                </span>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="flex items-center gap-1 text-[11px] text-textMuted hover:text-danger font-medium transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Clear Chat</span>
                </button>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-indigo-500/30">
                    <BookOpen size={30} className="text-indigo-400" />
                  </div>
                  <h3 className="text-base font-bold text-textPrimary mb-1">ScholarMind AI Research Assistant</h3>
                  <p className="text-xs text-textSecondary max-w-md">
                    Ask questions naturally about your paper. The RAG pipeline retrieves relevant sections, reasons over the context, and synthesizes clear, human-understandable explanations.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <Bot size={16} className="text-white" />
                      </div>
                    )}

                    <div className="max-w-[88%] space-y-2">
                      <div
                        className={`p-4 rounded-2xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-accent text-white font-medium rounded-tr-none'
                            : 'bg-bgInput/90 text-textPrimary border border-border rounded-tl-none shadow-sm'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {msg.grounded && (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={11} /> Grounded Synthesis
                              </span>
                            )}
                            {msg.sources && msg.sources.map((src, sIdx) => (
                              <span key={sIdx} className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                                📍 {src.section}, Pg {src.page}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Synthesized Response Body */}
                        <div className="whitespace-pre-wrap space-y-2">
                          {msg.content}
                        </div>

                        {/* Source Chunk Citations Toggle */}
                        {msg.role === 'assistant' && msg.retrievedChunks && msg.retrievedChunks.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-border/40">
                            <button
                              onClick={() => toggleChunkExpand(msg.id)}
                              className="flex items-center justify-between w-full text-[11px] text-accent font-semibold hover:underline"
                            >
                              <span className="flex items-center gap-1">
                                <Quote size={12} />
                                View {msg.retrievedChunks.length} Source Excerpts
                              </span>
                              {expandedChunks[msg.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>

                            {expandedChunks[msg.id] && (
                              <div className="mt-2.5 space-y-2 animate-fade-in">
                                {msg.retrievedChunks.map((chunk, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="p-3 rounded-lg bg-bgMain/70 border border-border/60 text-[11px] text-textSecondary space-y-1"
                                  >
                                    <div className="flex items-center justify-between font-bold text-indigo-300 text-[10px]">
                                      <span>Section: {chunk.section || 'General'} (Pg {chunk.page_number || 1})</span>
                                      <span>Score: {chunk.score}</span>
                                    </div>
                                    <p className="italic text-textMuted line-clamp-3">"{chunk.content}"</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {sending && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-indigo-400" />
                  </div>
                  <div className="glass-card px-4 py-3 rounded-2xl flex items-center gap-2 text-xs text-textMuted">
                    <Spinner size="sm" />
                    <span>Retrieving section chunks & reasoning over context...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-border bg-bgSidebar/40">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    selectedPaperId
                      ? "Ask a question about this research paper..."
                      : "Please select a paper first..."
                  }
                  disabled={sending || !selectedPaperId}
                  className="flex-1 bg-bgInput border border-border rounded-xl px-4 py-3 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accent disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || !inputQuery.trim() || !selectedPaperId}
                  className="w-10 h-10 rounded-xl bg-accent hover:bg-accentHover disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-sm"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PAPER COMPARISON ─────────────────────────────────────────── */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
            <div>
              <h3 className="text-base font-bold text-textPrimary mb-1">Multi-Paper Comparative Analysis</h3>
              <p className="text-xs text-textSecondary">Select 2 or more research papers to compare problems, methods, datasets, and experimental findings side-by-side.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {papers.map((p) => {
                const isSelected = selectedCompareIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCompareIds(prev => prev.filter(id => id !== p.id));
                      } else {
                        setSelectedCompareIds(prev => [...prev, p.id]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-accent/15 border-accent text-textPrimary'
                        : 'bg-bgInput/40 border-border text-textSecondary hover:border-accent/40'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-accent border-accent text-white' : 'border-border'
                    }`}>
                      {isSelected && <CheckCircle2 size={12} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold line-clamp-1">{p.title}</h4>
                      <p className="text-[11px] text-textMuted">{p.year ? `Year: ${p.year}` : 'PDF Document'}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCompare}
                disabled={comparing || selectedCompareIds.length < 2}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accentHover disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                {comparing ? <Spinner size="sm" /> : <GitCompare size={14} />}
                <span>{comparing ? 'Comparing Papers...' : 'Generate Comparative Matrix'}</span>
              </button>
            </div>
          </div>

          {comparisonResult && (
            <div className="glass-card p-6 rounded-2xl border border-border space-y-5 animate-fade-in overflow-x-auto">
              <h3 className="text-base font-bold text-textPrimary">Structured Comparison Matrix</h3>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-bgInput/60">
                    <th className="p-3 font-bold text-textMuted uppercase tracking-wider w-44">Dimension</th>
                    {comparisonResult.papers.map((p, idx) => (
                      <th key={idx} className="p-3 font-bold text-indigo-300 max-w-xs">{p.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-textSecondary">
                  <tr>
                    <td className="p-3 font-semibold text-textPrimary">Research Problem</td>
                    {comparisonResult.papers.map((p, idx) => (
                      <td key={idx} className="p-3">{p.research_problem}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-textPrimary">Proposed Approach</td>
                    {comparisonResult.papers.map((p, idx) => (
                      <td key={idx} className="p-3">{p.proposed_approach}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-textPrimary">Methodology</td>
                    {comparisonResult.papers.map((p, idx) => (
                      <td key={idx} className="p-3">{p.methodology}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-textPrimary">Dataset / Experiments</td>
                    {comparisonResult.papers.map((p, idx) => (
                      <td key={idx} className="p-3">{p.dataset}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-textPrimary">Experimental Results</td>
                    {comparisonResult.papers.map((p, idx) => (
                      <td key={idx} className="p-3">{p.results}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: RESEARCH GAPS ────────────────────────────────────────────── */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
            <div>
              <h3 className="text-base font-bold text-textPrimary mb-1">Research Gap Identification</h3>
              <p className="text-xs text-textSecondary">Discover unresolved limitations and potential future research directions for your project.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={gapPaperId}
                onChange={(e) => setGapPaperId(e.target.value)}
                className="flex-1 w-full bg-bgInput border border-border rounded-xl px-4 py-2.5 text-xs text-textPrimary focus:outline-none focus:border-accent"
              >
                {papers.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>

              <button
                onClick={handleIdentifyGaps}
                disabled={analyzingGaps || !gapPaperId}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accentHover disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
              >
                {analyzingGaps ? <Spinner size="sm" /> : <Lightbulb size={14} />}
                <span>{analyzingGaps ? 'Analyzing Gaps...' : 'Identify Gaps'}</span>
              </button>
            </div>
          </div>

          {gapsResult && (
            <div className="space-y-4 animate-fade-in">
              {gapsResult.research_gaps.map((gap, idx) => (
                <div key={idx} className="glass-card p-5 rounded-2xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      Potential Research Gap #{idx + 1}
                    </span>
                    <span className="text-[10px] text-textMuted italic">{gap.disclaimer}</span>
                  </div>

                  <h4 className="text-sm font-bold text-textPrimary">{gap.paper_title}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-bgInput/50 border border-border/60">
                      <span className="text-textMuted font-semibold block mb-1">Existing Limitation:</span>
                      <p className="text-textSecondary">{gap.existing_limitation}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <span className="text-indigo-300 font-semibold block mb-1">Suggested Research Direction:</span>
                      <p className="text-indigo-200">{gap.suggested_direction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: RECOMMENDATIONS ──────────────────────────────────────────── */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6 animate-fade-in">
          {loadingRecs ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Spinner size="lg" />
              <p className="text-xs text-textMuted mt-3">Analyzing project context and recommendations...</p>
            </div>
          ) : recsResult ? (
            <div className="space-y-4">
              <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                <h3 className="text-base font-bold text-textPrimary mb-1">Academic Research Focus: {recsResult.topic_focus}</h3>
                <p className="text-xs text-textSecondary">Personalized recommendations tailored to your paper library and active research projects.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recsResult.recommendations.map((rec, idx) => (
                  <div key={idx} className="glass-card p-5 rounded-2xl border border-border hover:border-accent/40 transition-all space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        {rec.category}
                      </span>
                      <h4 className="text-sm font-bold text-textPrimary mt-2.5 mb-1">{rec.title}</h4>
                      <p className="text-xs text-textSecondary">{rec.description}</p>
                    </div>
                    <div className="pt-2 border-t border-border/40">
                      <span className="text-[11px] font-semibold text-accent flex items-center gap-1">
                        Search: "{rec.search_query}"
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
