import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function RiskBadge({ severity }) {
  const map = {
    LOW: {
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: CheckCircle2,
      label: "Low Risk",
    },
    MEDIUM: {
      color: "text-yellow-700 bg-yellow-50 border-yellow-200",
      icon: AlertTriangle,
      label: "Medium Risk",
    },
    HIGH: {
      color: "text-red-700 bg-red-50 border-red-200",
      icon: XCircle,
      label: "High Risk",
    },
  };

  if (!map[severity]) return null;

  const Icon = map[severity].icon;

  return (
    <div
      className={`
        inline-flex items-center gap-2
        px-3 py-1.5
        rounded-full
        border
        text-sm font-semibold
        ${map[severity].color}
      `}
    >
      <Icon size={16} />
      <span>{map[severity].label}</span>
    </div>
  );
}
