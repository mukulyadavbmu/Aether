import { Button } from '../ui/button';
import { Home, Brain, Heart, MapPin, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home', color: '#00F2FF' },
    { id: 'ai', icon: Brain, label: 'AI Architect', color: '#00F2FF' },
    { id: 'wellness', icon: Heart, label: 'Wellness', color: '#00FF41' },
    { id: 'gps', icon: MapPin, label: 'GPS', color: '#00F2FF' },
    { id: 'controls', icon: Settings, label: 'Controls', color: '#FF5F1F' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E]/95 border-t border-[#2A2A2A] backdrop-blur z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-around p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-[#00F2FF]/10' 
                    : 'hover:bg-muted'
                  }
                `}
              >
                <Icon 
                  className="w-5 h-5"
                  style={{ 
                    color: isActive ? tab.color : '#999999',
                    filter: isActive ? `drop-shadow(0 0 8px ${tab.color})` : 'none'
                  }}
                />
                <span 
                  className={`text-xs font-mono ${
                    isActive ? '' : 'text-muted-foreground'
                  }`}
                  style={{ color: isActive ? tab.color : undefined }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
