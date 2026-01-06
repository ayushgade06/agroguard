export default function SidebarButton({ label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full
        flex items-center
        px-4 py-3
        rounded-xl
        text-sm font-semibold
        transition
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
