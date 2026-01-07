export default function SidebarButton({
  label,
  active,
  onClick,
  disabled,
  icon,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3
        px-4 py-3 rounded-xl
        text-sm font-semibold
        transition-all duration-200
        ${
          disabled
            ? "text-slate-400 cursor-not-allowed bg-slate-50"
            : active
            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : "text-slate-700 hover:bg-slate-100 border border-transparent"
        }
      `}
    >
      {icon && (
        <span
          className={`w-9 h-9 inline-flex items-center justify-center rounded-xl ${
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </span>
      )}
      <span className="text-left">{label}</span>
    </button>
  );
}
