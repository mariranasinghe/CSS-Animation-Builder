import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Keyframe } from '../types';
import { lerp } from '../data';

interface TimelineProps {
  kf: Keyframe[];
  selIdx: number;
  setSelIdx: (idx: number) => void;
  onUpdateKf: (kf: Keyframe[]) => void;
  newKeyframeId: number | null;
  triggerNewKfPop: (pct: number) => void;
}

export default function Timeline({ kf, selIdx, setSelIdx, onUpdateKf, newKeyframeId, triggerNewKfPop }: TimelineProps) {
  const currentKf = kf[selIdx];

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const pct = Math.round(((e.clientX - r.left) / r.width) * 100);
    const clamped = Math.max(1, Math.min(99, pct));
    if (kf.some((k) => Math.abs(k.pct - clamped) < 4)) return;

    const sorted = [...kf].sort((a, b) => a.pct - b.pct);
    let bef = sorted[0];
    let aft = sorted[sorted.length - 1];
    for (const k of sorted) {
      if (k.pct <= clamped) bef = k;
    }
    for (const k of [...sorted].reverse()) {
      if (k.pct >= clamped) aft = k;
    }
    const t = bef.pct === aft.pct ? 0 : (clamped - bef.pct) / (aft.pct - bef.pct);

    const newK = {
      pct: clamped,
      tx: Math.round(lerp(bef.tx, aft.tx, t)),
      ty: Math.round(lerp(bef.ty, aft.ty, t)),
      rot: Math.round(lerp(bef.rot, aft.rot, t)),
      sc: Math.round(lerp(bef.sc, aft.sc, t) * 100) / 100,
      op: Math.round(lerp(bef.op, aft.op, t) * 100) / 100,
    };

    const nextKf = [...kf, newK];
    onUpdateKf(nextKf);
    setSelIdx(nextKf.length - 1);
    triggerNewKfPop(clamped);
  };

  const deleteSelected = () => {
    if (!kf[selIdx] || kf[selIdx].pct === 0 || kf[selIdx].pct === 100) return;
    const nextKf = [...kf];
    nextKf.splice(selIdx, 1);
    onUpdateKf(nextKf);
    setSelIdx(Math.max(0, selIdx - 1));
  };

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Choreography</h2>
          <p className="text-sm text-muted-foreground">Each dot is a keyframe — click the track to add a move</p>
        </div>
        {currentKf && currentKf.pct !== 0 && currentKf.pct !== 100 && (
          <Button 
            data-testid="button-delete-keyframe"
            variant="destructive" 
            size="sm" 
            className="h-9 rounded-full font-bold shadow-sm"
            onClick={deleteSelected}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove move
          </Button>
        )}
      </div>
      
      <div 
        className="relative h-14 bg-gradient-to-r from-background to-muted border-2 border-border rounded-xl cursor-crosshair select-none shadow-inner"
        onClick={handleTimelineClick}
      >
        {[0, 25, 50, 75, 100].map(p => (
          <div 
            key={p} 
            className="absolute top-full mt-2 text-xs font-bold text-muted-foreground pointer-events-none"
            style={{ 
              left: p === 0 ? `0%` : p === 100 ? `calc(100% - 24px)` : `calc(${p}% - 12px)`
            }}
          >
            {p}%
          </div>
        ))}

        {/* Track Line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-border rounded-full pointer-events-none" />

        {kf.map((k, i) => {
          const isSel = i === selIdx;
          const isNew = k.pct === newKeyframeId;
          return (
            <div
              key={i}
              className={`absolute top-1/2 w-6 h-6 rounded-full cursor-pointer z-10 transition-all ${isSel ? 'bg-primary shadow-[0_4px_10px_rgba(255,107,138,0.6)] scale-125 border-2 border-background' : 'bg-secondary border-2 border-background hover:scale-110 hover:shadow-md'} ${isNew ? 'animate-kf-pop' : '-translate-y-1/2'}`}
              style={{ 
                left: `calc(${k.pct}% - 12px)`,
                transform: isNew ? '' : `translateY(-50%) ${isSel ? 'scale(1.25)' : 'scale(1)'}`
              }}
              title={`${k.pct}%`}
              onClick={(e) => { e.stopPropagation(); setSelIdx(i); }}
            />
          );
        })}
      </div>
    </div>
  );
}