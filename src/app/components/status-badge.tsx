import { Badge } from "./ui/badge";

export type StatusType = "success" | "late" | "distracted" | "in-progress";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    success: {
      label: label || "Success",
      className: "bg-[#00FF41] text-[#121212] border-[#00FF41]",
    },
    late: {
      label: label || "Late",
      className: "bg-[#FF5F1F] text-white border-[#FF5F1F]",
    },
    distracted: {
      label: label || "Distracted",
      className: "bg-[#FF5F1F]/20 text-[#FF5F1F] border-[#FF5F1F]",
    },
    "in-progress": {
      label: label || "In Progress",
      className: "bg-[#00F2FF]/20 text-[#00F2FF] border-[#00F2FF]",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={`${config.className} font-mono uppercase tracking-wider`}>
      {config.label}
    </Badge>
  );
}
