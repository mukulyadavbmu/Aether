import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dumbbell, Apple, Camera, Mic, Plus } from "lucide-react";
import { Progress } from "./ui/progress";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export function WellnessTracker() {
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "Bench Press", sets: 3, reps: 8, weight: 185 },
    { name: "Squats", sets: 4, reps: 10, weight: 225 },
    { name: "Deadlift", sets: 3, reps: 6, weight: 275 },
  ]);

  const caloriesIn = 1850;
  const caloriesOut = 2400;
  const calorieGoal = 2200;

  return (
    <div className="space-y-6 pb-24">
      {/* Calorie Rings */}
      <Card className="p-6 bg-[#1E1E1E]">
        <h3 className="font-orbitron text-[#00F2FF] uppercase tracking-wider mb-6">
          Energy Balance
        </h3>
        <div className="flex justify-center mb-6">
          <div className="relative w-56 h-56">
            <svg className="w-full h-full transform -rotate-90">
              {/* Calories Out Ring (Outer) */}
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="#2A2A2A"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="#FF5F1F"
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - caloriesOut / 3000)}
                style={{
                  filter: "drop-shadow(0 0 6px #FF5F1F)",
                }}
              />
              {/* Calories In Ring (Inner) */}
              <circle
                cx="112"
                cy="112"
                r="70"
                stroke="#2A2A2A"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="112"
                cy="112"
                r="70"
                stroke="#00FF41"
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={2 * Math.PI * 70 * (1 - caloriesIn / calorieGoal)}
                style={{
                  filter: "drop-shadow(0 0 6px #00FF41)",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-sm text-muted-foreground font-mono mb-1">
                Deficit
              </div>
              <div className="text-3xl font-orbitron text-[#00F2FF]">
                {caloriesOut - caloriesIn}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                cal
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-orbitron text-[#00FF41]">
              {caloriesIn}
            </div>
            <div className="text-xs text-muted-foreground font-mono uppercase">
              Calories In
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-orbitron text-[#FF5F1F]">
              {caloriesOut}
            </div>
            <div className="text-xs text-muted-foreground font-mono uppercase">
              Energy Out
            </div>
          </div>
        </div>
      </Card>

      {/* Diet Log */}
      <Card className="p-6 bg-[#1E1E1E]">
        <div className="flex items-center gap-2 mb-4">
          <Apple className="w-5 h-5 text-[#00FF41]" />
          <h3 className="font-orbitron text-[#00FF41] uppercase tracking-wider">
            Precision Diet Log
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Type food item or upload image..."
              className="bg-[#2A2A2A] border-[#00FF41]/30 font-mono text-sm flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="border-[#00FF41]/30 hover:bg-[#00FF41]/10"
            >
              <Camera className="w-4 h-4 text-[#00FF41]" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-[#00FF41]/30 hover:bg-[#00FF41]/10"
            >
              <Mic className="w-4 h-4 text-[#00FF41]" />
            </Button>
          </div>

          {/* Recent Meals */}
          <div className="space-y-2 mt-4">
            {[
              { meal: "Chicken Breast, 8oz", cals: 374, time: "12:30 PM" },
              { meal: "Rice, 200g", cals: 260, time: "12:30 PM" },
              { meal: "Broccoli, 150g", cals: 51, time: "12:30 PM" },
              { meal: "Protein Shake", cals: 220, time: "9:00 AM" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded border border-[#00FF41]/10"
              >
                <div className="flex-1">
                  <p className="text-sm">{item.meal}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {item.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-orbitron text-[#00FF41]">
                    {item.cals}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    cal
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Workout Generator */}
      <Card className="p-6 bg-[#1E1E1E]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#00F2FF]" />
            <h3 className="font-orbitron text-[#00F2FF] uppercase tracking-wider">
              Today's Workout
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-[#00F2FF]/30 hover:bg-[#00F2FF]/10"
          >
            <Plus className="w-4 h-4 mr-1 text-[#00F2FF]" />
            <span className="text-[#00F2FF]">Add Exercise</span>
          </Button>
        </div>

        <div className="space-y-3">
          {exercises.map((exercise, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#2A2A2A] rounded border border-[#00F2FF]/10"
            >
              <h4 className="mb-3">{exercise.name}</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-mono uppercase block mb-1">
                    Sets
                  </label>
                  <Input
                    type="number"
                    value={exercise.sets}
                    className="bg-[#1E1E1E] border-[#00F2FF]/20 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-mono uppercase block mb-1">
                    Reps
                  </label>
                  <Input
                    type="number"
                    value={exercise.reps}
                    className="bg-[#1E1E1E] border-[#00F2FF]/20 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-mono uppercase block mb-1">
                    Weight
                  </label>
                  <Input
                    type="number"
                    value={exercise.weight}
                    className="bg-[#1E1E1E] border-[#00F2FF]/20 font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workout Progress */}
        <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground font-mono">
              Workout Progress
            </span>
            <span className="text-[#00F2FF] font-orbitron">2/3 Complete</span>
          </div>
          <Progress value={66} className="h-2 bg-[#2A2A2A]" />
        </div>
      </Card>
    </div>
  );
}
