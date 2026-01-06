export default function Card({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white
        rounded-xl
        border border-slate-200
        p-5
        shadow-sm
        transition
        ${onClick ? "cursor-pointer hover:shadow-md hover:border-slate-300" : ""}
      `}
    >
      {children}
    </div>
  );
}
