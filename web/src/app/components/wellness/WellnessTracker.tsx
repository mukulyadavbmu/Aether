import { Card } from '../ui/card';
import { Heart, Activity, Utensils, TrendingUp } from 'lucide-react';

export function WellnessTracker() {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-[#00FF41]/10 to-[#00F2FF]/10 border-[#00FF41]">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-[#00FF41]" />
          <div>
            <h2 className="font-orbitron text-[#00FF41] uppercase tracking-wider">
              Wellness Tracker
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              Health, nutrition & fitness monitoring
            </p>
          </div>
        </div>
      </Card>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-[#1E1E1E] border-[#00FF41]/30">
          <Utensils className="w-5 h-5 text-[#00FF41] mb-3" />
          <p className="text-3xl font-orbitron text-[#00FF41]">2,450</p>
          <p className="text-sm text-muted-foreground">calories</p>
        </Card>
        <Card className="p-6 bg-[#1E1E1E] border-[#00F2FF]/30">
          <Activity className="w-5 h-5 text-[#00F2FF] mb-3" />
          <p className="text-3xl font-orbitron text-[#00F2FF]">3</p>
          <p className="text-sm text-muted-foreground">workouts</p>
        </Card>
        <Card className="p-6 bg-[#1E1E1E] border-[#00FF41]/30">
          <TrendingUp className="w-5 h-5 text-[#00FF41] mb-3" />
          <p className="text-3xl font-orbitron text-[#00FF41]">85g</p>
          <p className="text-sm text-muted-foreground">protein</p>
        </Card>
        <Card className="p-6 bg-[#1E1E1E] border-[#00F2FF]/30">
          <Heart className="w-5 h-5 text-[#00F2FF] mb-3" />
          <p className="text-3xl font-orbitron text-[#00F2FF]">7.5</p>
          <p className="text-sm text-muted-foreground">wellness score</p>
        </Card>
      </div>

      {/* Recent Meals */}
      <Card className="p-6 bg-[#1E1E1E]">
        <h3 className="font-orbitron uppercase tracking-wider mb-4">Recent Meals</h3>
        <div className="space-y-3">
          {['Breakfast: Oatmeal with berries (450 cal)', 'Lunch: Grilled chicken salad (520 cal)', 'Snack: Protein shake (200 cal)'].map((meal, idx) => (
            <div key={idx} className="p-3 bg-[#2A2A2A] rounded font-mono text-sm">
              {meal}
            </div>
          ))}
        </div>
      </Card>

      {/* Workout Log */}
      <Card className="p-6 bg-[#1E1E1E]">
        <h3 className="font-orbitron uppercase tracking-wider mb-4">Today's Workouts</h3>
        <div className="space-y-3">
          {['Morning run: 5.2km in 28 min', 'Push-ups: 3 sets x 20 reps', 'Plank: 3 x 60 seconds'].map((workout, idx) => (
            <div key={idx} className="p-3 bg-[#2A2A2A] rounded font-mono text-sm text-[#00FF41]">
              {workout}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
