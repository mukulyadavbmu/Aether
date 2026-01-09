import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Brain, TrendingUp, Target, Calendar, MessageSquare, Sparkles } from 'lucide-react';

export function AIArchitect() {
  const journalEntries = [
    { date: '2025-12-20', rating: 8.5, summary: 'Implemented aggressive alarm features, meal tracking service' },
    { date: '2025-12-19', rating: 7.2, summary: 'Created GPS pacing coach, completed usage tracking' },
    { date: '2025-12-18', rating: 9.1, summary: 'Built phone unlock overlay, ghost mode functionality' },
  ];

  const goals = [
    { title: 'Complete Aether aggressive features', progress: 85, deadline: '2025-12-22' },
    { title: 'Document all implementations', progress: 60, deadline: '2025-12-23' },
    { title: 'Test on physical device', progress: 20, deadline: '2025-12-25' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-[#00F2FF]/10 to-[#00FF41]/10 border-[#00F2FF]">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#00F2FF]" />
          <div>
            <h2 className="font-orbitron text-[#00F2FF] uppercase tracking-wider">
              AI Architect
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              Gemini-powered life coaching & insights
            </p>
          </div>
        </div>
      </Card>

      {/* Journal Entries */}
      <Card className="p-6 bg-[#1E1E1E]">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-[#00F2FF]" />
          <h3 className="font-orbitron uppercase tracking-wider">Recent Journal Entries</h3>
        </div>
        <div className="space-y-4">
          {journalEntries.map((entry, idx) => (
            <div key={idx} className="p-4 bg-[#2A2A2A] rounded-lg border border-[#00F2FF]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-muted-foreground">{entry.date}</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00FF41]" />
                  <span className="text-[#00FF41] font-orbitron text-lg">{entry.rating}/10</span>
                </div>
              </div>
              <p className="text-sm">{entry.summary}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Active Goals */}
      <Card className="p-6 bg-[#1E1E1E]">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-[#00F2FF]" />
          <h3 className="font-orbitron uppercase tracking-wider">Active Goals</h3>
        </div>
        <div className="space-y-4">
          {goals.map((goal, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{goal.title}</span>
                <span className="font-mono text-sm text-[#00F2FF]">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2 bg-[#2A2A2A]" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Calendar className="w-3 h-3" />
                <span>Due: {goal.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insights */}
      <Card className="p-6 bg-[#1E1E1E] border-[#00FF41]/30">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-[#00FF41]" />
          <h3 className="font-orbitron text-[#00FF41] uppercase tracking-wider">
            AI Insights
          </h3>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            ✨ Your productivity has increased 12% this week
          </p>
          <p className="text-muted-foreground">
            🎯 On track to complete 3/3 weekly goals
          </p>
          <p className="text-muted-foreground">
            💪 Focus time improved by 25 minutes/day average
          </p>
        </div>
      </Card>
    </div>
  );
}
