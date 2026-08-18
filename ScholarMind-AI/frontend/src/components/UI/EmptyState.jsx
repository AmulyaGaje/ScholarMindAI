import React from 'react';
import { FileSearch } from 'lucide-react';

export default function EmptyState({ title, description, icon: Icon = FileSearch, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-card rounded-2xl border border-border min-h-[280px]">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-accent" />
      </div>
      <h3 className="text-lg font-bold text-textPrimary mb-2">{title}</h3>
      <p className="text-sm text-textSecondary max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-5 py-2.5 bg-accent hover:bg-accentHover text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
