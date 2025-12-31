export default function Card({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 shadow-sm ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {children}
    </div>
  );
}
