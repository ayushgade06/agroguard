export default function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}) {
  const styles = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    outline:
      "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        w-full
        py-3.5
        rounded-xl
        font-semibold
        transition
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : styles[variant]
        }
      `}
    >
      {children}
    </button>
  );
}
