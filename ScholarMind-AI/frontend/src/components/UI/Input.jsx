import React from 'react';
import clsx from 'clsx';

/**
 * Reusable Input Primitive Component
 * Supports light & dark modes with explicit text, caret, background, and focus styling.
 */
export default function Input({ label, error, className, id, name, type = 'text', ...props }) {
  const inputId = id || name;

  return (
    <div className={clsx("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-textSecondary dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        className={clsx(
          "w-full px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 outline-none",
          // Text and caret colors - ensured visible in both light & dark themes
          "text-slate-900 dark:text-slate-100 caret-accent",
          // Background colors
          "bg-slate-100 dark:bg-bgInput",
          // Placeholder styling
          "placeholder-slate-400 dark:placeholder-slate-500",
          // Borders and Focus states
          "border border-slate-300 dark:border-border",
          error
            ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
            : "focus:border-accent focus:ring-2 focus:ring-accent/20 dark:focus:border-accent dark:focus:ring-accent/20"
        )}
        {...props}
      />
      {error && <span className="text-xs font-medium text-danger animate-fade-in">{error}</span>}
    </div>
  );
}
