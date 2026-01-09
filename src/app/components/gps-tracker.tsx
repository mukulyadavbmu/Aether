import { Card } from "./ui/card";
import { StatusBadge } from "./status-badge";
import { Target, TrendingUp, Calendar, Award } from "lucide-react";
import { Progress } from "./ui/progress";

interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  status: "success" | "late" | "in-progress";
  progress: number;
}

export function GPSTracker() {
  const tasks: TaskItem[] = [
    {
      id: "1",
      title: "Complete AETHER UI wireframes",
      dueDate: "Today, 6:00 PM",
      status: "in-progress",
      progress: 50,
    },
    {
      id: "2",
      title: "Review pull requests",
      dueDate: "Today, 3:00 PM",
      status: "success",
      progress: 100,
    },
    {
      id: "3",
      title: "Team standup meeting",
      dueDate: "Today, 9:30 AM",
      status: "success",
      progress: 100,
    },
    {
      id: "4",
      title: "Write documentation",
      dueDate: "Tomorrow, 2:00 PM",
      status: "in-progress",
      progress: 20,
    },
    {
      id: "5",
      title: "Code refactoring task",
      dueDate: "Dec 18, 5:00 PM",
      status: "late",
      progress: 30,
    },
  ];

  const weeklyStats = {
    tasksCompleted: 34,
    tasksTotal: 50,
    currentPace: 8.5,
    requiredPace: 7.2,
    daysRemaining: 4,
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Stats */}
      <div className="p-6 bg-gradient-to-br from-[#00F2FF]/10 to-[#00FF41]/10 border border-[#00F2FF]/30 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-[#00F2FF]" />
          <h2 className="font-orbitron text-[#00F2FF] uppercase tracking-wider">
            GPS Goal Tracking
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-orbitron text-[#00FF41] mb-1">
              {weeklyStats.tasksCompleted}
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              Tasks Completed
            </p>
          </div>
          <div>
            <p className="text-3xl font-orbitron text-[#00F2FF] mb-1">
              {weeklyStats.currentPace}
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              Current Pace
            </p>
          </div>
        </div>
      </div>

      {/* Pace Analysis */}
      <Card className="p-6 bg-[#1E1E1E]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00FF41]" />
            <h3 className="font-orbitron text-[#00FF41] uppercase tracking-wider">
              Pace Analysis
            </h3>
          </div>
          <StatusBadge status="success" label="Ahead" />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground font-mono">
                Current Pace
              </span>
              <span className="text-[#00FF41] font-orbitron">
                {weeklyStats.currentPace} tasks/day
              </span>
            </div>
            <Progress value={85} className="h-2 bg-[#2A2A2A]" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground font-mono">
                Required Pace
              </span>
              <span className="text-[#00F2FF] font-orbitron">
                {weeklyStats.requiredPace} tasks/day
              </span>
            </div>
            <Progress value={72} className="h-2 bg-[#2A2A2A]" />
          </div>

          <div className="pt-4 border-t border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-mono">
                  Days Remaining
                </span>
              </div>
              <span className="text-xl font-orbitron text-[#00F2FF]">
                {weeklyStats.daysRemaining}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Goal Progress */}
      <Card className="p-6 bg-[#1E1E1E]">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-[#00FF41]" />
          <h3 className="font-orbitron text-[#00FF41] uppercase tracking-wider">
            7-Day Goal
          </h3>
        </div>
        <div className="text-center mb-4">
          <div className="text-5xl font-orbitron text-[#00FF41] mb-2">
            {Math.round((weeklyStats.tasksCompleted / weeklyStats.tasksTotal) * 100)}%
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {weeklyStats.tasksCompleted} of {weeklyStats.tasksTotal} tasks
          </p>
        </div>
        <Progress
          value={(weeklyStats.tasksCompleted / weeklyStats.tasksTotal) * 100}
          className="h-3 bg-[#2A2A2A]"
        />
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        <h3 className="font-orbitron text-[#00F2FF] uppercase tracking-wider px-2">
          Active Tasks
        </h3>
        {tasks.map((task) => (
          <Card
            key={task.id}
            className={`p-4 bg-[#1E1E1E] border-l-4 ${
              task.status === "success"
                ? "border-l-[#00FF41]"
                : task.status === "late"
                ? "border-l-[#FF5F1F]"
                : "border-l-[#00F2FF]"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="flex-1">{task.title}</h4>
              <StatusBadge status={task.status} />
            </div>
            <p className="text-sm text-muted-foreground font-mono mb-3">
              Due: {task.dueDate}
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-mono">Progress</span>
                <span
                  className="font-orbitron"
                  style={{
                    color:
                      task.status === "success"
                        ? "#00FF41"
                        : task.status === "late"
                        ? "#FF5F1F"
                        : "#00F2FF",
                  }}
                >
                  {task.progress}%
                </span>
              </div>
              <Progress value={task.progress} className="h-1.5 bg-[#2A2A2A]" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
