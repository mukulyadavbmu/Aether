import { Card } from '../ui/card';
import { MapPin, Activity, TrendingUp, Timer, Target } from 'lucide-react';

export function GPSTracker() {
  const activities = [
    { type: 'Run', distance: 5.2, duration: 28, speed: 11.1, date: '2025-12-20 07:00' },
    { type: 'Walk', distance: 2.1, duration: 25, speed: 5.0, date: '2025-12-19 18:30' },
    { type: 'Cycle', distance: 12.5, duration: 45, speed: 16.7, date: '2025-12-18 15:00' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-[#00F2FF]/10 to-[#00FF41]/10 border-[#00F2FF]">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-[#00F2FF]" />
          <div>
            <h2 className="font-orbitron text-[#00F2FF] uppercase tracking-wider">
              GPS Tracker
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              Live pacing & activity monitoring
            </p>
          </div>
        </div>
      </Card>

      {/* Today's Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 bg-[#1E1E1E]">
          <Target className="w-5 h-5 text-[#00F2FF] mb-3" />
          <p className="text-3xl font-orbitron text-[#00F2FF]">5.2</p>
          <p className="text-sm text-muted-foreground">km today</p>
        </Card>
        <Card className="p-6 bg-[#1E1E1E]">
          <Timer className="w-5 h-5 text-[#00FF41] mb-3" />
          <p className="text-3xl font-orbitron text-[#00FF41]">28</p>
          <p className="text-sm text-muted-foreground">minutes</p>
        </Card>
        <Card className="p-6 bg-[#1E1E1E]">
          <TrendingUp className="w-5 h-5 text-[#00F2FF] mb-3" />
          <p className="text-3xl font-orbitron text-[#00F2FF]">11.1</p>
          <p className="text-sm text-muted-foreground">km/h avg</p>
        </Card>
      </div>

      {/* Live Coach Status */}
      <Card className="p-6 bg-[#1E1E1E] border-[#00FF41]">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-[#00FF41]" />
          <h3 className="font-orbitron text-[#00FF41] uppercase tracking-wider">
            Live GPS Coach
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-2">Current Status: Inactive</p>
        <p className="text-xs font-mono text-muted-foreground">
          Start tracking from mobile app to see live pacing feedback
        </p>
      </Card>

      {/* Activity History */}
      <Card className="p-6 bg-[#1E1E1E]">
        <h3 className="font-orbitron uppercase tracking-wider mb-4">Activity History</h3>
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <div key={idx} className="p-4 bg-[#2A2A2A] rounded-lg border border-[#00F2FF]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-orbitron text-[#00F2FF]">{activity.type}</span>
                <span className="font-mono text-xs text-muted-foreground">{activity.date}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground font-mono">Distance:</span>
                  <span className="ml-2 font-orbitron">{activity.distance} km</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono">Duration:</span>
                  <span className="ml-2 font-orbitron">{activity.duration} min</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono">Speed:</span>
                  <span className="ml-2 font-orbitron">{activity.speed} km/h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
