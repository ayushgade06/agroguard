import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function RiskBadge({ severity }) {
  const map = {
    LOW: { color: "text-green-600", icon: CheckCircle2 },
    MEDIUM: { color: "text-yellow-600", icon: AlertTriangle },
    HIGH: { color: "text-red-600", icon: XCircle },
  };

  const Icon = map[severity].icon;

  return (
    <div className={`flex items-center gap-2 ${map[severity].color}`}>
      <Icon size={18} />
      <span className="font-bold">{severity}</span>
    </div>
  );
}
