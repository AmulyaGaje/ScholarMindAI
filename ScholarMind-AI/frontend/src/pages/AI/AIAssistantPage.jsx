import React from 'react';
import { Bot, Sparkles, ChevronRight, BookOpen, Layers, Network } from 'lucide-react';

const STAGE2_FEATURES = [
  {
    icon: Layers,
    title: 'Vector Database & Embeddings',
    description: 'Semantic similarity search across your research library using dense vector representations.',
  },
  {
    icon: Network,
    title: 'Knowledge Graph',
    description: 'Build a citation and concept knowledge graph connecting papers, authors, and concepts.',
  },
  {
    icon: BookOpen,
    title: 'RAG-Powered Q&A',
    description: 'Ask deep questions about your research papers using Retrieval-Augmented Generation.',
  },
  {
    icon: Sparkles,
    title: 'Academic Recommendations',
    description: 'AI-powered paper recommendations based on your research interests and history.',
  },
];

export default function AIAssistantPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center pt-8">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow mb-5">
          <Bot size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-textPrimary mb-2">AI Assistant</h1>
        <p className="text-textSecondary max-w-lg mx-auto">
          Advanced conversational AI assistant for deep research paper analysis, semantic Q&A, and knowledge graph reasoning.
        </p>
      </div>

      {/* Stage 2 Banner */}
      <div className="glass-card rounded-2xl p-6 border border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-4">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-300">Planned for Stage 2</span>
        </div>
        <h2 className="text-xl font-bold text-textPrimary mb-2">Coming in Stage 2</h2>
        <p className="text-sm text-textSecondary max-w-md mx-auto">
          The AI Assistant with full RAG capabilities, knowledge graphs, and semantic search is being implemented in Stage 2 of this B.Tech Major Project.
        </p>
        <div className="mt-4 text-xs text-textMuted">
          Stage 1 provides: Basic AI Paper Analysis · PDF extraction · LLM summaries
        </div>
      </div>

      {/* What's coming */}
      <div>
        <h3 className="text-sm font-bold text-textMuted uppercase tracking-widest mb-4">What's Coming in Stage 2</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STAGE2_FEATURES.map((f) => (
            <div key={f.title} className="glass-card p-5 rounded-xl border border-border hover:border-accent/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <f.icon size={18} className="text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-textPrimary mb-1">{f.title}</h4>
                  <p className="text-xs text-textSecondary">{f.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available now */}
      <div className="glass-card rounded-2xl p-5 border border-emerald-500/20">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Available Now in Stage 1</h3>
        <ul className="space-y-2 text-sm text-textSecondary">
          {[
            'AI-powered PDF paper analysis (summary, findings, methodology, objectives)',
            'Paper text extraction via PyMuPDF / pypdf',
            'Structured JSON analysis results stored in PostgreSQL',
            'Status tracking: processing → completed / failed',
            'Manual analysis retry from paper view',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <ChevronRight size={14} className="text-emerald-400 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
