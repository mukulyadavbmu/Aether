import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { 
  Clock, Target, TrendingUp, Zap, Activity, 
  Brain, Heart, MapPin, Timer, ArrowRight 
} from 'lucide-react';

interface DashboardProps {
  disciplineScore: number;
}

export function Dashboard({ disciplineScore }: DashboardProps) {
  const scorePercentage = (disciplineScore / 10) * 100;
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#00FF41';
    if (score >= 6) return '#00F2FF';
    return '#FF5F1F';
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Discipline Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Discipline Gauge */}
        <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-[#1E1E1E] to-[#121212] border-[#00F2FF] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F2FF] rounded-full blur-[120px] opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-[#00F2FF]" />
              <h2 className="font-orbitron text-[#00F2FF] uppercase tracking-wider">
                Discipline Index
              </h2>
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-baseline gap-3">
                  <span 
                    className="text-7xl font-orbitron font-bold"
                    style={{ color: getScoreColor(disciplineScore) }}
                  >
                    {disciplineScore.toFixed(1)}
                  </span>
                  <span className="text-3xl text-muted-foreground">/10</span>
                </div>
                <p className="text-sm text-muted-foreground font-mono mt-2">
                  Today's Performance Rating
                </p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 text-[#00FF41]">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-2xl font-orbitron">+12%</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">vs. yesterday</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm font-mono">
                <span className="text-muted-foreground">Weekly Average</span>
                <span className="text-[#00F2FF]">7.2/10</span>
              </div>
              <Progress 
                value={72} 
                className="h-2 bg-[#2A2A2A]"
                style={{ 
                  '--progress-bg': getScoreColor(disciplineScore) 
                } as any}
              />
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="p-6 bg-[#1E1E1E] border-[#00FF41]/30">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-6 h-6 text-[#00FF41]" />
              <span className="text-xs font-mono text-muted-foreground uppercase">Streak</span>
            </div>
            <p className="text-4xl font-orbitron text-[#00FF41]">7</p>
            <p className="text-sm text-muted-foreground">consecutive days</p>
          </Card>

          <Card className="p-6 bg-[#1E1E1E] border-[#00F2FF]/30">
            <div className="flex items-center justify-between mb-3">
              <Timer className="w-6 h-6 text-[#00F2FF]" />
              <span className="text-xs font-mono text-muted-foreground uppercase">Focus</span>
            </div>
            <p className="text-4xl font-orbitron text-[#00F2FF]">4.5</p>
            <p className="text-sm text-muted-foreground">hours today</p>
          </Card>
        </div>
      </div>

      {/* Active Goals */}
      <Card className="p-6 border-[#00F2FF] bg-[#1E1E1E] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00F2FF] glow-cyan" />
        <div className="pl-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00F2FF]" />
              <h3 className="font-orbitron text-[#00F2FF] uppercase tracking-wider">
                Active Focus Session
              </h3>
            </div>
            <span className="px-3 py-1 bg-[#00F2FF]/10 text-[#00F2FF] text-xs font-mono uppercase rounded">
              In Progress
            </span>
          </div>
          
          <h2 className="text-xl mb-2">Complete Aether aggressive features documentation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Deep work session: 45 minutes remaining
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-[#00F2FF]">45/90 min</span>
            </div>
            <Progress value={50} className="h-2 bg-[#2A2A2A]" />
          </div>
        </div>
      </Card>

      {/* Today's Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-[#1E1E1E] hover:border-[#00F2FF] transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#00F2FF]/10 rounded">
              <Brain className="w-5 h-5 text-[#00F2FF]" />
            </div>
            <span className="text-xs font-mono text-muted-foreground uppercase">Journal</span>
          </div>
          <p className="text-3xl font-orbitron text-[#00F2FF] mb-1">3</p>
          <p className="text-sm text-muted-foreground">entries today</p>
        </Card>

        <Card className="p-6 bg-[#1E1E1E] hover:border-[#00FF41] transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#00FF41]/10 rounded">
              <Heart className="w-5 h-5 text-[#00FF41]" />
            </div>
            <span className="text-xs font-mono text-muted-foreground uppercase">Wellness</span>
          </div>
          <p className="text-3xl font-orbitron text-[#00FF41] mb-1">2,450</p>
          <p className="text-sm text-muted-foreground">calories logged</p>
        </Card>

        <Card className="p-6 bg-[#1E1E1E] hover:border-[#00F2FF] transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#00F2FF]/10 rounded">
              <MapPin className="w-5 h-5 text-[#00F2FF]" />
            </div>
            <span className="text-xs font-mono text-muted-foreground uppercase">GPS</span>
          </div>
          <p className="text-3xl font-orbitron text-[#00F2FF] mb-1">5.2</p>
          <p className="text-sm text-muted-foreground">km tracked</p>
        </Card>

        <Card className="p-6 bg-[#1E1E1E] hover:border-[#FF5F1F] transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#FF5F1F]/10 rounded">
              <Clock className="w-5 h-5 text-[#FF5F1F]" />
            </div>
            <span className="text-xs font-mono text-muted-foreground uppercase">Apps</span>
          </div>
          <p className="text-3xl font-orbitron text-[#FF5F1F] mb-1">2.5</p>
          <p className="text-sm text-muted-foreground">hours limited</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-[#1E1E1E]">
        <h3 className="font-orbitron uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button className="bg-[#00F2FF] text-[#121212] hover:bg-[#00F2FF]/90 font-mono">
            <Brain className="w-4 h-4 mr-2" />
            New Journal
          </Button>
          <Button variant="outline" className="border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/10 font-mono">
            <Heart className="w-4 h-4 mr-2" />
            Log Meal
          </Button>
          <Button variant="outline" className="border-[#00F2FF] text-[#00F2FF] hover:bg-[#00F2FF]/10 font-mono">
            <Activity className="w-4 h-4 mr-2" />
            Start Activity
          </Button>
          <Button variant="outline" className="border-[#FF5F1F] text-[#FF5F1F] hover:bg-[#FF5F1F]/10 font-mono">
            <Target className="w-4 h-4 mr-2" />
            Set Goal
          </Button>
        </div>
      </Card>
    </div>
  );
}
