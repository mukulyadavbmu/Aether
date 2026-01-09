import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { StatusBadge } from "./status-badge";
import { Brain, Send, Calendar } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ScheduleTask {
  time: string;
  task: string;
  type: "deep" | "noise";
  status: "success" | "late" | "distracted" | "in-progress";
}

export function AIArchitect() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "AETHER AI initialized. Ready to architect your day. What are your primary objectives for the next 7 days?",
    },
    {
      role: "user",
      content: "I need to complete the product launch, maintain my fitness routine, and learn React advanced patterns.",
    },
    {
      role: "ai",
      content: "Excellent objectives. I've analyzed your goals and created an optimized daily schedule below. Notice the 'Deep Work' blocks - these are protected time slots for maximum productivity. Your schedule balances 6 hours of deep work with necessary maintenance tasks.",
    },
  ]);
  const [input, setInput] = useState("");

  const schedule: ScheduleTask[] = [
    { time: "06:00", task: "Morning Routine + Workout", type: "noise", status: "success" },
    { time: "07:30", task: "Deep Work: Code Review", type: "deep", status: "success" },
    { time: "09:30", task: "Team Standup", type: "noise", status: "success" },
    { time: "10:00", task: "Deep Work: Feature Development", type: "deep", status: "in-progress" },
    { time: "12:30", task: "Lunch + Walk", type: "noise", status: "in-progress" },
    { time: "13:30", task: "Deep Work: UI Design", type: "deep", status: "in-progress" },
    { time: "15:30", task: "Email & Slack Review", type: "noise", status: "in-progress" },
    { time: "16:00", task: "Deep Work: Documentation", type: "deep", status: "in-progress" },
    { time: "18:00", task: "Evening Wind Down", type: "noise", status: "in-progress" },
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      { role: "user", content: input },
      {
        role: "ai",
        content: "Analyzing your input and optimizing your schedule for maximum productivity. I've blocked 6 hours of deep work and allocated 2.5 hours for necessary noise tasks.",
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full pb-24">
      {/* Header */}
      <div className="p-4 border-b border-[#2A2A2A] bg-[#1E1E1E]">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-[#00F2FF]" />
          <h2 className="font-orbitron text-[#00F2FF] uppercase tracking-wider">
            AI Goal Architect
          </h2>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          Terminal Interface v2.0
        </p>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg font-mono text-sm ${
                  msg.role === "user"
                    ? "bg-[#00F2FF] text-[#121212]"
                    : "bg-[#2A2A2A] text-foreground border border-[#00F2FF]/30"
                }`}
              >
                {msg.role === "ai" && (
                  <span className="text-[#00F2FF] mr-2">&gt;</span>
                )}
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Daily Schedule Table */}
        <Card className="bg-[#1E1E1E] border-[#2A2A2A] mt-6">
          <div className="p-4 border-b border-[#2A2A2A] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00F2FF]" />
            <h3 className="font-orbitron text-[#00F2FF] uppercase tracking-wider text-sm">
              Today's Architecture
            </h3>
          </div>
          <div className="divide-y divide-[#2A2A2A]">
            {schedule.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 flex items-center justify-between ${
                  item.type === "deep" ? "bg-[#00F2FF]/5" : ""
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="font-mono text-sm text-[#00F2FF] w-16">
                    {item.time}
                  </span>
                  <span className="text-sm flex-1">{item.task}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.type === "deep" && (
                    <span className="text-xs font-mono text-[#00F2FF] uppercase px-2 py-1 bg-[#00F2FF]/10 rounded">
                      Deep
                    </span>
                  )}
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Roadmap Preview */}
        <Card className="bg-[#1E1E1E] border-[#2A2A2A] mt-4 p-4">
          <h3 className="font-orbitron text-[#00FF41] uppercase tracking-wider text-sm mb-4">
            7-Day Milestone Progress
          </h3>
          <div className="space-y-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
              <div key={day} className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground w-8">
                  {day}
                </span>
                <div className="flex-1 h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00F2FF] to-[#00FF41]"
                    style={{
                      width: `${idx < 2 ? 100 : idx === 2 ? 50 : 0}%`,
                      boxShadow: idx <= 2 ? "0 0 10px #00F2FF" : "none",
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                  {idx < 2 ? "100%" : idx === 2 ? "50%" : "0%"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-[#2A2A2A] bg-[#1E1E1E]">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your command..."
            className="bg-[#2A2A2A] border-[#00F2FF]/30 font-mono text-sm focus-visible:ring-[#00F2FF]"
          />
          <Button
            onClick={handleSend}
            className="bg-[#00F2FF] text-[#121212] hover:bg-[#00F2FF]/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}