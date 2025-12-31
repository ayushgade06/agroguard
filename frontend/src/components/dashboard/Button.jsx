export default function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}) {
  const styles = {
    primary: "bg-green-600 text-white",
    outline: "bg-white border border-gray-300",
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-full py-4 rounded-xl font-bold ${
        styles[variant]
      } ${disabled ? "opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}
