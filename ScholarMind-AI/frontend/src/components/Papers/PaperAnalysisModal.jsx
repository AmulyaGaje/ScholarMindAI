import React, { useState, useEffect, useRef } from 'react';
import Modal from '../UI/Modal';
import paperService from '../../services/paperService';
import { 
  Sparkles, Loader2, RefreshCw, AlertTriangle, BookOpen, 
  CheckCircle2, FileText, Download, ShieldAlert, List, Info, 
  HelpCircle, Cpu, Clipboard, TrendingUp, Settings, FileWarning
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaperAnalysisModal({ paper, isOpen, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState('pending');
  const pollTimerRef = useRef(null);

  // Function to load the full analysis data
  const loadAnalysisData = async () => {
    try {
      const data = await paperService.getAnalysis(paper.id);
      setAnalysis(data);
      setStatus(data.analysis_status);
      if (data.analysis_status === 'failed') {
        setError(data.error_message || 'AI Analysis failed.');
      } else {
        setError(null);
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to load AI Analysis.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Status polling logic
  const startPolling = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    
    pollTimerRef.current = setInterval(async () => {
      try {
        const statusData = await paperService.getAnalysisStatus(paper.id);
        setStatus(statusData.analysis_status);
        
        if (statusData.analysis_status === 'completed') {
          clearInterval(pollTimerRef.current);
          loadAnalysisData();
        } else if (statusData.analysis_status === 'failed') {
          clearInterval(pollTimerRef.current);
          setError(statusData.error_message || 'Analysis processing failed.');
          setLoading(false);
        }
      } catch (err) {
        clearInterval(pollTimerRef.current);
        logger.error("Polling status failed:", err);
      }
    }, 2500);
  };

  const fetchAnalysis = async () => {
    if (!paper?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await paperService.getAnalysis(paper.id);
      setAnalysis(data);
      setStatus(data.analysis_status);
      
      if (data.analysis_status === 'processing') {
        startPolling();
      } else {
        setLoading(false);
        if (data.analysis_status === 'failed') {
          setError(data.error_message || 'AI Analysis failed.');
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to load AI Analysis.';
      setError(msg);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && paper?.id) {
      fetchAnalysis();
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, paper?.id]);

  const handleTriggerAnalysis = async () => {
    if (!paper?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await paperService.triggerAnalysis(paper.id);
      setStatus('processing');
      startPolling();
      toast.success('AI Analysis requested. Analyzing paper in background...');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to start analysis.');
      setLoading(false);
      toast.error('Failed to trigger AI Analysis.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!paper?.id) return;
    setDownloading(true);
    try {
      const blob = await paperService.downloadAnalysisPdf(paper.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const cleanTitle = paper.title ? paper.title.replace(/[^a-zA-Z0-9]/g, '_') : 'report';
      a.download = `ScholarMind_Analysis_${cleanTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('PDF report downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  const renderSection = (title, content, Icon = FileText) => {
    if (!content) return null;
    return (
      <div className="bg-bgCard p-5 rounded-2xl border border-border shadow-sm space-y-2">
        <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2 border-b border-border pb-2">
          <Icon className="text-accent w-4.5 h-4.5" />
          <span>{title}</span>
        </h3>
        <p className="text-xs text-textSecondary leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    );
  };

  const renderListSection = (title, items, Icon = CheckCircle2) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="bg-bgCard p-5 rounded-2xl border border-border shadow-sm space-y-2">
        <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2 border-b border-border pb-2">
          <Icon className="text-accent w-4.5 h-4.5" />
          <span>{title}</span>
        </h3>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-xs text-textSecondary flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl">
      <div className="flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0 pr-8">
          <div>
            <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles size={14} className="animate-pulse" />
              <span>Academic Paper Analysis</span>
            </div>
            <h2 className="text-lg font-bold text-textPrimary leading-snug line-clamp-1">{paper?.title}</h2>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {status === 'completed' && (
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accentHover text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                <span>Download Report PDF</span>
              </button>
            )}
            
            {status !== 'processing' && (
              <button
                onClick={handleTriggerAnalysis}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-bgCard text-textPrimary text-xs font-bold rounded-lg transition-colors"
              >
                <RefreshCw size={13} />
                <span>Regenerate Analysis</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-5 pr-2 space-y-6 scrollbar-thin">
          {loading || status === 'processing' ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 size={40} className="text-accent animate-spin mb-4" />
              <h3 className="text-base font-bold text-textPrimary animate-pulse">Running ScholarMind AI Analysis...</h3>
              <p className="text-xs text-textMuted max-w-sm mt-2 leading-relaxed">
                We are extracting document sections and executing a proportional LLM analysis. This might take up to a minute depending on the document length.
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
              <AlertTriangle size={48} className="text-danger mb-4" />
              <h3 className="text-base font-bold text-textPrimary mb-1">Analysis Report Failed</h3>
              <p className="text-xs text-textSecondary mb-6 leading-relaxed">{error}</p>
              <button
                onClick={handleTriggerAnalysis}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accentHover text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <RefreshCw size={14} />
                <span>Trigger Analysis Retry</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Left Column: Key Highlights & Summaries */}
              <div className="lg:col-span-1 space-y-5">
                {/* Paper overview metadata card */}
                <div className="bg-bgCard p-5 rounded-2xl border border-border shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">Paper Overview</h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-bgInput rounded-xl">
                      <span className="text-textMuted block mb-0.5">Title</span>
                      <span className="font-semibold text-textPrimary">{paper.title}</span>
                    </div>
                    {paper.authors && (
                      <div className="p-2.5 bg-bgInput rounded-xl">
                        <span className="text-textMuted block mb-0.5">Authors</span>
                        <span className="font-semibold text-textPrimary">
                          {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-bgInput rounded-xl">
                        <span className="text-textMuted block mb-0.5">Journal / Venue</span>
                        <span className="font-semibold text-textPrimary truncate block">{paper.journal || 'Academic Repository'}</span>
                      </div>
                      <div className="p-2.5 bg-bgInput rounded-xl">
                        <span className="text-textMuted block mb-0.5">Publication Year</span>
                        <span className="font-semibold text-textPrimary">{paper.year || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {renderSection("Executive Summary", analysis?.executive_summary, Info)}
                {renderSection("Simple Understanding", analysis?.simple_understanding, BookOpen)}
                {renderListSection("Key Findings", analysis?.key_findings, CheckCircle2)}
                {renderListSection("Important Terminology", analysis?.terminology, HelpCircle)}
              </div>

              {/* Middle and Right Column: Deep Research Analysis */}
              <div className="lg:col-span-2 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {renderSection("Research Problem", analysis?.research_problem, FileWarning)}
                  {renderListSection("Research Objectives", analysis?.objectives, List)}
                </div>

                {renderSection("Background and Context", analysis?.background, Clipboard)}
                {renderSection("Related Work / Literature", analysis?.related_work, Clipboard)}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {renderSection("Proposed Approach", analysis?.proposed_approach, Cpu)}
                  {renderSection("Model Architecture", analysis?.architecture, Cpu)}
                </div>

                {renderSection("Methodology", analysis?.methodology, Clipboard)}
                {renderSection("Experimental Setup", analysis?.experimental_setup, Settings)}
                {renderSection("Results and Findings", analysis?.results, TrendingUp)}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderListSection("Strengths of Approach", analysis?.strengths, CheckCircle2)}
                  {renderListSection("Limitations", analysis?.limitations, AlertTriangle)}
                  {renderListSection("Future Scope", analysis?.future_scope, Sparkles)}
                </div>

                {renderSection("Research Contribution", analysis?.research_contribution, Sparkles)}
                {renderListSection("Practical Applications", analysis?.practical_applications, CheckCircle2)}
                {renderSection("Final Understanding", analysis?.final_understanding, CheckCircle2)}

                {/* Source disclaimer */}
                <div className="p-4 bg-danger/5 border border-danger/10 text-danger rounded-xl flex items-start gap-2.5">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-normal font-medium">
                    <b>Source-Based Disclaimer:</b> This report was generated from the contents of the uploaded research paper. 
                    Statements not explicitly supported by the source paper should not be treated as factual claims.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
