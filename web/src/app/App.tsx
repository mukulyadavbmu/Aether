import { useState, useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { AIArchitect } from './components/ai-architect/AIArchitect';
import { WellnessTracker } from './components/wellness/WellnessTracker';
import { GPSTracker } from './components/gps/GPSTracker';
import { ControlsPanel } from './components/controls/ControlsPanel';
import { BottomNav } from './components/navigation/BottomNav';
import { Button } from './components/ui/button';
import { Bell, Settings, Activity, Moon, Sun } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [disciplineScore, setDisciplineScore] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Check authentication
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchDisciplineScore();
    }
  }, []);

  const fetchDisciplineScore = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/journal/latest-rating`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDisciplineScore(response.data?.rating || 0);
    } catch (error) {
      console.error('Failed to fetch discipline score:', error);
      setDisciplineScore(7.5); // Demo fallback
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard disciplineScore={disciplineScore} />;
      case 'ai':
        return <AIArchitect />;
      case 'wellness':
        return <WellnessTracker />;
      case 'gps':
        return <GPSTracker />;
      case 'controls':
        return <ControlsPanel />;
      default:
        return <Dashboard disciplineScore={disciplineScore} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md p-8">
          <h1 className="font-orbitron text-6xl uppercase tracking-wider">
            <span className="text-[#00F2FF]">AETHER</span>
          </h1>
          <p className="text-muted-foreground font-mono">
            AI Life-Architect Dashboard
          </p>
          <div className="pt-8">
            <Button
              onClick={() => setIsAuthenticated(true)}
              className="bg-[#00F2FF] text-[#121212] hover:bg-[#00F2FF]/90 font-orbitron uppercase tracking-wider px-8"
            >
              Demo Access
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-foreground relative overflow-hidden">
      {/* Cybernetic Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00F2FF] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00FF41] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#1E1E1E]/80 border-b border-[#2A2A2A] backdrop-blur">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="font-orbitron uppercase tracking-wider text-2xl">
                <span className="text-[#00F2FF]">AETHER</span>
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                AI Life-Architect • Web Dashboard
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00FF41]" />
              <span className="font-mono text-sm text-muted-foreground">
                Synced with mobile
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#00F2FF] hover:bg-[#00F2FF]/10"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground hover:bg-muted"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-6 pb-24">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
