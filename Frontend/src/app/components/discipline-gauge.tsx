import { motion } from "motion/react";

interface DisciplineGaugeProps {
  score: number; // 0-10
}

export function DisciplineGauge({ score }: DisciplineGaugeProps) {
  const percentage = (score / 10) * 100;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on score
  const getColor = () => {
    if (score >= 8) return "#00FF41"; // Green
    if (score >= 5) return "#00F2FF"; // Cyan
    return "#FF5F1F"; // Orange
  };

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r="80"
          stroke="#2A2A2A"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="96"
          cy="96"
          r="80"
          stroke={getColor()}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 8px ${getColor()})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-6xl font-orbitron" style={{ color: getColor() }}>
          {score.toFixed(1)}
        </div>
        <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">
          Discipline
        </div>
      </div>
    </div>
  );
}
