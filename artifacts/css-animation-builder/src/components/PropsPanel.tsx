import React from 'react';
import { Keyframe } from '../types';
import { Slider } from '@/components/ui/slider';
import { Wand2 } from 'lucide-react';

interface PropsPanelProps {
  currentKf: Keyframe;
  onUpdateProp: (prop: keyof Keyframe, val: number) => void;
  emoji: string;
  actorId: string;
  mode: 'playground' | 'scene';
}

const PropSlider = ({
  id, label, min, max, step, val, unit, hintText, onUpdateProp
}: { id: keyof Keyframe; label: string; min: number; max: number; step: number; val: number; unit: string; hintText: string; onUpdateProp: (prop: keyof Keyframe, val: number) => void; }) => (
  <div className="flex flex-col gap-2 mb-4">
    <div className="flex justify-between items-center text-xs">
      <span className="font-semibold">{label} <span className="font-mono text-[10px] text-muted-foreground ml-1">{id}</span></span>
      <span className="text-muted-foreground italic text-[10px]">{hintText}</span>
    </div>
    <div className="flex items-center gap-4">
      <Slider
        min={min} max={max} step={step}
        value={[val]}
        onValueChange={(v) => onUpdateProp(id, v[0])}
        className="flex-1 cursor-ew-resize"
      />
      <span className="text-xs font-mono font-medium min-w-[50px] text-right text-foreground">
        {val}{unit}
      </span>
    </div>
  </div>
);

export default function PropsPanel({ currentKf, onUpdateProp, emoji, actorId, mode }: PropsPanelProps) {
  if (!currentKf) return null;

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-display font-semibold text-primary flex items-center gap-2">
          <Wand2 className="w-6 h-6" />
          Edit Move at {currentKf.pct}%
        </h2>
        {mode === 'scene' && (
          <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-1 rounded-md">
            Editing: {emoji} {actorId.slice(0,4)}
          </span>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
        <div className="space-y-4">
          <PropSlider 
            id="tx" label="Slide left/right" min={-200} max={200} step={5} val={currentKf.tx} unit="px"
            hintText={currentKf.tx < 0 ? "Left" : currentKf.tx > 0 ? "Right" : "Center"}
            onUpdateProp={onUpdateProp}
          />
          <PropSlider 
            id="ty" label="Move up/down" min={-200} max={200} step={5} val={currentKf.ty} unit="px"
            hintText={currentKf.ty < 0 ? "Up" : currentKf.ty > 0 ? "Down" : "Middle"}
            onUpdateProp={onUpdateProp}
          />
          <PropSlider 
            id="rot" label="Spin angle" min={-360} max={360} step={5} val={currentKf.rot} unit="°"
            hintText={currentKf.rot < 0 ? "Counter-clockwise" : currentKf.rot > 0 ? "Clockwise" : "Straight"}
            onUpdateProp={onUpdateProp}
          />
        </div>
        <div className="space-y-4">
          <PropSlider 
            id="sc" label="Size" min={0} max={3} step={0.05} val={currentKf.sc} unit=""
            hintText={currentKf.sc < 1 ? "Smaller" : currentKf.sc > 1 ? "Larger" : "Normal"}
            onUpdateProp={onUpdateProp}
          />
          <PropSlider 
            id="op" label="Visibility" min={0} max={1} step={0.05} val={currentKf.op} unit=""
            hintText={currentKf.op < 1 ? "Transparent" : "Opaque"}
            onUpdateProp={onUpdateProp}
          />
        </div>
      </div>
    </div>
  );
}