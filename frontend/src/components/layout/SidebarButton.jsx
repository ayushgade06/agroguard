export default function SidebarButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors
        ${
          active
            ? "bg-green-100 text-green-700"
            : "text-slate-700 hover:bg-slate-100"
        }
      `}
    >
      {label}
    </button>
  );
}
