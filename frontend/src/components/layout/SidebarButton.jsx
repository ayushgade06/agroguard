export default function SidebarButton({ label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors
        ${
          disabled
            ? "text-slate-400 cursor-not-allowed bg-slate-50"
            : active
            ? "bg-emerald-100 text-emerald-700"
            : "text-slate-700 hover:bg-slate-100"
        }
      `}
    >
      {label}
    </button>
  );
}
