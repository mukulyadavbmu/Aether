import { DisciplineGauge } from "./discipline-gauge";
import { StatusBadge } from "./status-badge";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Clock, Target, TrendingUp, Zap, Info } from "lucide-react";

interface DashboardProps {
  disciplineScore: number;
}

export function Dashboard({ disciplineScore }: DashboardProps) {
  return (
    <div className="space-y-6 pb-24">
      {/* Demo Info */}
      <Card className="p-4 bg-gradient-to-r from-[#00F2FF]/10 to-[#00FF41]/10 border border-[#00F2FF]/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#00F2FF] flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-[#00F2FF] font-mono mb-2">
              <strong>Demo Features:</strong>
            </p>
            <p className="text-muted-foreground text-xs">
              • Click <strong>Bell icon</strong> (top right) for Intrusive Unlock Modal<br />
              • Click <strong>Moon icon</strong> (top right) for Aggressive Alarm Screen<br />
              • Navigate tabs below to explore AI Architect, Wellness, and GPS tracking
            </p>
          </div>
        </div>
      </Card>

      {/* Discipline Score */}
      <div className="flex justify-center pt-8">
        <DisciplineGauge score={disciplineScore} />
      </div>

      {/* Active Focus Card */}
      <Card className="p-6 border-[#00F2FF] bg-[#1E1E1E] relative overflow-hidden animate-pulse-slow">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00F2FF] animate-pulse" style={{
          boxShadow: "0 0 20px #00F2FF"
        }} />
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00F2FF]" />
            <h3 className="font-orbitron text-[#00F2FF] uppercase tracking-wider">
              Active Focus
            </h3>
          </div>
          <StatusBadge status="in-progress" />
        </div>
        <h2 className="mb-2">Complete AETHER UI wireframes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Deep work session: 90 minutes remaining
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-[#00F2FF]">45/90 min</span>
          </div>
          <Progress value={50} className="h-2 bg-[#2A2A2A]" />
        </div>
      </Card>

      {/* GPS Status Widget */}
      <Card className="p-6 bg-[#1E1E1E]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00FF41]" />
            <h3 className="font-orbitron text-[#00FF41] uppercase tracking-wider">
              GPS Status
            </h3>
          </div>
          <StatusBadge status="success" label="On Track" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-mono uppercase">
              Current Pace
            </p>
            <p className="text-2xl font-orbitron text-[#00FF41]">8.5</p>
            <p className="text-xs text-muted-foreground">tasks/day</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-mono uppercase">
              Required Pace
            </p>
            <p className="text-2xl font-orbitron">7.2</p>
            <p className="text-xs text-muted-foreground">tasks/day</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-mono">7-Day Goal</span>
            <span className="text-[#00FF41] font-orbitron">
              68% Complete
            </span>
          </div>
          <Progress value={68} className="h-2 mt-2 bg-[#2A2A2A]" />
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 bg-[#1E1E1E] text-center">
          <Clock className="w-5 h-5 text-[#00F2FF] mx-auto mb-2" />
          <p className="text-2xl font-orbitron text-[#00F2FF]">6.5</p>
          <p className="text-xs text-muted-foreground font-mono">Deep Hours</p>
        </Card>
        <Card className="p-4 bg-[#1E1E1E] text-center">
          <TrendingUp className="w-5 h-5 text-[#00FF41] mx-auto mb-2" />
          <p className="text-2xl font-orbitron text-[#00FF41]">12</p>
          <p className="text-xs text-muted-foreground font-mono">Tasks Done</p>
        </Card>
        <Card className="p-4 bg-[#1E1E1E] text-center">
          <Zap className="w-5 h-5 text-[#FF5F1F] mx-auto mb-2" />
          <p className="text-2xl font-orbitron text-[#FF5F1F]">3</p>
          <p className="text-xs text-muted-foreground font-mono">Distractions</p>
        </Card>
      </div>
    </div>
  );
}