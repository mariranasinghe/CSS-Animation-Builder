import React from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { Settings } from "../types";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

export default function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      <h2 className="text-lg font-display font-semibold flex items-center gap-2 mb-2 text-foreground">
        <Clock className="w-5 h-5 text-secondary" />
        Timing & Behavior
      </h2>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Duration</span>
        <div className="flex items-center gap-3">
          <Slider
            min={0.2} max={5} step={0.1}
            value={[settings.dur]}
            onValueChange={(v) => onChange({ ...settings, dur: v[0] })}
            className="flex-1 cursor-ew-resize"
          />
          <span className="text-xs font-mono font-bold min-w-[40px] text-right">{settings.dur.toFixed(1)}s</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Easing</span>
        <Select value={settings.ease} onValueChange={(v) => onChange({ ...settings, ease: v })}>
          <SelectTrigger className="h-9 text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ease">Smooth (ease)</SelectItem>
            <SelectItem value="ease-in">Accelerate (ease-in)</SelectItem>
            <SelectItem value="ease-out">Decelerate (ease-out)</SelectItem>
            <SelectItem value="ease-in-out">Smooth in/out</SelectItem>
            <SelectItem value="linear">Robotic (linear)</SelectItem>
            <SelectItem value="cubic-bezier(0.68,-0.55,0.265,1.55)">Bouncy (spring)</SelectItem>
            <SelectItem value="steps(6)">Choppy (steps)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Repeat</span>
        <Select value={settings.iter} onValueChange={(v) => onChange({ ...settings, iter: v })}>
          <SelectTrigger className="h-9 text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="infinite">Forever</SelectItem>
            <SelectItem value="1">Once</SelectItem>
            <SelectItem value="2">Twice</SelectItem>
            <SelectItem value="3">3 Times</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Direction</span>
        <Select value={settings.dir} onValueChange={(v) => onChange({ ...settings, dir: v })}>
          <SelectTrigger className="h-9 text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="alternate">Yo-yo (alternate)</SelectItem>
            <SelectItem value="reverse">Reverse</SelectItem>
            <SelectItem value="alternate-reverse">Reverse yo-yo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}