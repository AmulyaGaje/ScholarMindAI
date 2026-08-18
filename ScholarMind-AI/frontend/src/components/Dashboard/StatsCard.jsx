import React from "react";

const COLORS = {
  indigo: {
    icon: "text-indigo-500",
    bg: "bg-indigo-500/20",
  },
  purple: {
    icon: "text-purple-500",
    bg: "bg-purple-500/20",
  },
  emerald: {
    icon: "text-emerald-500",
    bg: "bg-emerald-500/20",
  },
  amber: {
    icon: "text-amber-500",
    bg: "bg-amber-500/20",
  },
};

export default function StatsCard({
  title,
  value = 0,
  icon: Icon,
  color = "indigo",
}) {
  const theme = COLORS[color] || COLORS.indigo;

  return (
    <div className="bg-card p-5 rounded-lg border border-[#2a3347] flex items-center gap-4">
      <div className={`p-3 rounded-lg ${theme.bg}`}>
        {Icon && <Icon className={theme.icon} size={24} />}
      </div>

      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}