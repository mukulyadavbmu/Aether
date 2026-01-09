import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Camera, Clock, TriangleAlert } from "lucide-react";
import { Card } from "./ui/card";

interface UnlockModalProps {
  open: boolean;
  onCommit: () => void;
  onSnooze: () => void;
}

export function UnlockModal({ open, onCommit, onSnooze }: UnlockModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="bg-[#1E1E1E] border-[#00F2FF] max-w-md">
        <div className="text-center space-y-6">
          <div className="inline-block p-4 bg-[#00F2FF]/10 rounded-full">
            <TriangleAlert className="w-12 h-12 text-[#00F2FF]" />
          </div>
          <div>
            <h2 className="font-orbitron text-[#00F2FF] uppercase tracking-wider mb-2">
              Task Pending
            </h2>
            <p className="text-muted-foreground font-mono text-sm">
              Current priority requires your attention
            </p>
          </div>

          <Card className="p-6 bg-[#2A2A2A] border-[#00F2FF]/30 text-left">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-1 h-full bg-[#00F2FF]" />
              <div>
                <h3 className="mb-2">Complete AETHER UI wireframes</h3>
                <p className="text-sm text-muted-foreground">
                  Deep work session in progress
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Clock className="w-4 h-4 text-[#FF5F1F]" />
                  <span className="text-sm font-mono text-[#FF5F1F]">
                    45 minutes remaining
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={onCommit}
              className="w-full bg-[#00F2FF] text-[#121212] hover:bg-[#00F2FF]/90 font-orbitron uppercase tracking-wider"
            >
              Commit & Focus
            </Button>
            <Button
              onClick={onSnooze}
              variant="outline"
              className="w-full border-[#FF5F1F]/30 text-[#FF5F1F] hover:bg-[#FF5F1F]/10 font-mono"
            >
              Snooze (2 Min)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AggressiveAlarmProps {
  active: boolean;
  targetLocation: string;
  onDisable: () => void;
}

export function AggressiveAlarm({ active, targetLocation, onDisable }: AggressiveAlarmProps) {
  const [cameraActive, setCameraActive] = useState(false);

  if (!active) return null;

  return (
    <div className="fixed inset-0 bg-[#FF5F1F] z-50 flex items-center justify-center">
      <div className="text-center space-y-8 p-8 max-w-md w-full">
        <div className="space-y-2">
          <h1 className="font-orbitron text-6xl text-white uppercase tracking-wider animate-pulse">
            WAKE UP
          </h1>
          <p className="text-white/80 font-mono text-sm uppercase">
            Alarm Active
          </p>
        </div>

        {/* Camera Viewport */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-4 border-white">
          {!cameraActive ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
              <Camera className="w-16 h-16 mb-4" />
              <p className="font-mono text-sm">Camera Inactive</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <p className="font-mono text-sm">Camera Feed</p>
            </div>
          )}
        </div>

        <Card className="p-6 bg-white/10 border-white/30 backdrop-blur">
          <p className="text-white font-mono mb-4">
            <span className="text-white/60">Target:</span>
            <br />
            <span className="text-xl">Take photo of {targetLocation}</span>
          </p>
          <p className="text-white/60 text-sm font-mono">
            to disable sound
          </p>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={() => setCameraActive(true)}
            className="w-full bg-white text-[#FF5F1F] hover:bg-white/90 font-orbitron uppercase tracking-wider py-6"
          >
            <Camera className="w-5 h-5 mr-2" />
            Activate Camera
          </Button>
          {cameraActive && (
            <Button
              onClick={onDisable}
              className="w-full bg-[#00FF41] text-[#121212] hover:bg-[#00FF41]/90 font-orbitron uppercase tracking-wider py-6"
            >
              Verify & Disable
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}