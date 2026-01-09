import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Settings, Clock, Smartphone, AlertTriangle, Ghost, Camera } from 'lucide-react';
import { useState } from 'react';

export function ControlsPanel() {
  const [ghostMode, setGhostMode] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-[#FF5F1F]/10 to-[#00F2FF]/10 border-[#FF5F1F]">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#FF5F1F]" />
          <div>
            <h2 className="font-orbitron text-[#FF5F1F] uppercase tracking-wider">
              Discipline Controls
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              Aggressive enforcement settings
            </p>
          </div>
        </div>
      </Card>

      {/* Ghost Mode */}
      <Card className="p-6 bg-[#1E1E1E] border-[#FF5F1F]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Ghost className="w-5 h-5 text-[#FF5F1F]" />
            <h3 className="font-orbitron text-[#FF5F1F] uppercase tracking-wider">
              Ghost Mode
            </h3>
          </div>
          <Switch 
            checked={ghostMode} 
            onCheckedChange={setGhostMode}
            className="data-[state=checked]:bg-[#FF5F1F]"
          />
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {ghostMode 
            ? '🔥 ACTIVE - All distracting apps HARD BLOCKED with NO grace period'
            : 'Inactive - Grace periods allowed'
          }
        </p>
        {ghostMode && (
          <div className="p-3 bg-[#FF5F1F]/10 border border-[#FF5F1F]/30 rounded">
            <p className="text-xs text-[#FF5F1F] font-mono">
              ⚠️ WARNING: Extreme discipline mode active. Complete weekly goal to unlock.
            </p>
          </div>
        )}
      </Card>

      {/* Alarm Settings */}
      <Card className="p-6 bg-[#1E1E1E]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#00F2FF]" />
            <h3 className="font-orbitron uppercase tracking-wider">Smart Alarm</h3>
          </div>
          <Switch 
            checked={alarmEnabled} 
            onCheckedChange={setAlarmEnabled}
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded">
            <span className="font-mono text-sm">Alarm Time</span>
            <span className="font-orbitron text-[#00F2FF]">6:00 AM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded">
            <span className="font-mono text-sm">Verification</span>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#00F2FF]" />
              <span className="font-mono text-sm text-[#00F2FF]">Outdoor Photo</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded">
            <span className="font-mono text-sm">Volume (min)</span>
            <span className="font-orbitron text-[#FF5F1F]">30%</span>
          </div>
        </div>
      </Card>

      {/* App Limits */}
      <Card className="p-6 bg-[#1E1E1E]">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-5 h-5 text-[#00F2FF]" />
          <h3 className="font-orbitron uppercase tracking-wider">App Limits</h3>
        </div>
        <div className="space-y-3">
          {[
            { app: 'Instagram', limit: 30, used: 25 },
            { app: 'TikTok', limit: 30, used: 32 },
            { app: 'YouTube', limit: 60, used: 45 },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-[#2A2A2A] rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-sm">{item.app}</span>
                <span className={`font-mono text-sm ${item.used > item.limit ? 'text-[#FF5F1F]' : 'text-[#00FF41]'}`}>
                  {item.used}/{item.limit} min
                </span>
              </div>
              {item.used > item.limit && (
                <span className="text-xs text-[#FF5F1F] font-mono">🚫 BLOCKED</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Meal Times */}
      <Card className="p-6 bg-[#1E1E1E]">
        <h3 className="font-orbitron uppercase tracking-wider mb-4">Meal Alarm Schedule</h3>
        <div className="space-y-2">
          {[
            { meal: 'Breakfast', time: '8:00 AM' },
            { meal: 'Lunch', time: '1:00 PM' },
            { meal: 'Snack', time: '5:00 PM' },
            { meal: 'Dinner', time: '8:00 PM' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded">
              <span className="font-mono text-sm">{item.meal}</span>
              <span className="font-orbitron text-[#00F2FF]">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Priority Task */}
      <Card className="p-6 bg-[#1E1E1E] border-[#00F2FF]">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#00F2FF]" />
          <h3 className="font-orbitron text-[#00F2FF] uppercase tracking-wider">
            Priority Task
          </h3>
        </div>
        <p className="text-sm mb-4">Complete Aether aggressive features documentation</p>
        <p className="text-xs text-muted-foreground font-mono mb-4">
          This task will appear EVERY time you unlock your phone
        </p>
        <Button variant="outline" className="w-full border-[#00F2FF] text-[#00F2FF] hover:bg-[#00F2FF]/10 font-mono">
          Update Priority Task
        </Button>
      </Card>
    </div>
  );
}
