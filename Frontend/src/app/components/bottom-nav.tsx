import { House, Brain, Dumbbell, TrendingUp } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "home", icon: House, label: "Home" },
    { id: "ai", icon: Brain, label: "AI" },
    { id: "wellness", icon: Dumbbell, label: "Wellness" },
    { id: "gps", icon: TrendingUp, label: "GPS" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E] border-t border-[#2A2A2A] z-40">
      <div className="flex items-center justify-around max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors ${
                isActive ? "text-[#00F2FF]" : "text-muted-foreground"
              }`}
            >
              <Icon
                className="w-6 h-6 mb-1"
                style={
                  isActive
                    ? { filter: "drop-shadow(0 0 8px #00F2FF)" }
                    : undefined
                }
              />
              <span className="text-xs font-mono uppercase tracking-wider">
                {tab.label}
              </span>
              {isActive && (
                <div
                  className="absolute bottom-0 h-0.5 w-12 bg-[#00F2FF]"
                  style={{ boxShadow: "0 0 10px #00F2FF" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}