import { CheckCircle2, AlertTriangle, Link, AlertCircle } from 'lucide-react';
import { MappingStatus } from '../types/document';
interface StatusBadgeProps {
  status: MappingStatus;
  confidence?: number;
}
export function StatusBadge({ status, confidence }: StatusBadgeProps) {
  const config = {
    auto_mapped: {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      label: 'Auto'
    },
    fuzzy_mapped: {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertCircle,
      label: `Fuzzy ${confidence ? `(${Math.round(confidence * 100)}%)` : ''}`
    },
    needs_manual_review: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertTriangle,
      label: 'Review'
    },
    user_bound: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Link,
      label: 'Bound'
    }
  };
  const { color, icon: Icon, label } = config[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>

      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>);

}