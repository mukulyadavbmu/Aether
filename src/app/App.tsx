import { useState, useEffect } from "react";
import { Dashboard } from "./components/dashboard";
import { AIArchitect } from "./components/ai-architect";
import { WellnessTracker } from "./components/wellness-tracker";
import { GPSTracker } from "./components/gps-tracker";
import { BottomNav } from "./components/bottom-nav";
import { UnlockModal, AggressiveAlarm } from "./components/intrusive-overlays";
import { Button } from "./components/ui/button";
import { Bell, Moon } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [disciplineScore] = useState(7.8);

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard disciplineScore={disciplineScore} />;
      case "ai":
        return <AIArchitect />;
      case "wellness":
        return <WellnessTracker />;
      case "gps":
        return <GPSTracker />;
      default:
        return <Dashboard disciplineScore={disciplineScore} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-foreground relative overflow-hidden">
      {/* Cybernetic Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00F2FF] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00FF41] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#1E1E1E]/80 border-b border-[#2A2A2A] backdrop-blur">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div>
            <h1 className="font-orbitron uppercase tracking-wider">
              <span className="text-[#00F2FF]">AETHER</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              AI Life-Architect
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUnlockModal(true)}
              className="text-[#00F2FF] hover:bg-[#00F2FF]/10"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAlarm(true)}
              className="text-[#FF5F1F] hover:bg-[#FF5F1F]/10"
            >
              <Moon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-4">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Intrusive Overlays */}
      <UnlockModal
        open={showUnlockModal}
        onCommit={() => setShowUnlockModal(false)}
        onSnooze={() => setShowUnlockModal(false)}
      />

      <AggressiveAlarm
        active={showAlarm}
        targetLocation="Kitchen Counter"
        onDisable={() => setShowAlarm(false)}
      />
    </div>
  );
}