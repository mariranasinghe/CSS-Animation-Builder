import React, { useRef, useState, useCallback, useEffect } from "react";
import { Actor, AppMode } from "../types";
import { CHARACTERS } from "../data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface StageProps {
  mode: AppMode;
  actors: Actor[];
  selectedId: string;
  onSelectActor: (id: string) => void;
  onUpdateActor: (id: string, patch: Partial<Actor>) => void;
  onAddActor: (emoji: string) => void;
  setActorRef: (id: string, el: HTMLElement | null) => void;
  stageFlash: boolean;
  charPop: boolean;
  triggerCharPop: () => void;
}

export default function Stage({
  mode,
  actors,
  selectedId,
  onSelectActor,
  onUpdateActor,
  onAddActor,
  setActorRef,
  stageFlash,
  charPop,
  triggerCharPop
}: StageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingId = useRef<string | null>(null);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent, actor: Actor) => {
    if (mode === 'playground') return;
    e.stopPropagation();
    onSelectActor(actor.id);
    draggingId.current = actor.id;

    if (!stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const actorLeft = stageRect.left + (actor.x / 100) * stageRect.width;
    const actorTop = stageRect.top + (actor.y / 100) * stageRect.height;

    dragOffset.current = {
      dx: clientX - actorLeft,
      dy: clientY - actorTop
    };
  };

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingId.current || !stageRef.current || mode === 'playground') return;
    e.preventDefault();

    const stageRect = stageRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const targetX = clientX - dragOffset.current.dx;
    const targetY = clientY - dragOffset.current.dy;

    const newXPct = Math.max(0, Math.min(100, ((targetX - stageRect.left) / stageRect.width) * 100));
    const newYPct = Math.max(0, Math.min(100, ((targetY - stageRect.top) / stageRect.height) * 100));

    onUpdateActor(draggingId.current, { x: newXPct, y: newYPct });
  }, [mode, onUpdateActor]);

  const handlePointerUp = useCallback(() => {
    draggingId.current = null;
  }, []);

  useEffect(() => {
    if (mode === 'scene') {
      window.addEventListener("mousemove", handlePointerMove, { passive: false });
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchmove", handlePointerMove, { passive: false });
      window.addEventListener("touchend", handlePointerUp);
      return () => {
        window.removeEventListener("mousemove", handlePointerMove);
        window.removeEventListener("mouseup", handlePointerUp);
        window.removeEventListener("touchmove", handlePointerMove);
        window.removeEventListener("touchend", handlePointerUp);
      };
    }
  }, [mode, handlePointerMove, handlePointerUp]);

  return (
    <div 
      className={`relative bg-card border-2 border-border rounded-2xl overflow-hidden flex flex-col transition-shadow duration-300 ${mode === 'scene' ? 'min-h-[360px]' : 'min-h-[320px]'} ${stageFlash ? 'animate-stage-flash shadow-[0_0_20px_5px_rgba(255,107,138,0.5)] border-primary' : 'shadow-lg'}`}
    >
      <div 
        ref={stageRef}
        className="flex-1 relative overflow-hidden" 
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #c9e8ff 80%, #4CAF50 80%, #388E3C 100%)' }}
      >
        {actors.map(actor => {
          const isSelected = actor.id === selectedId;
          return (
            <div
              key={actor.id}
              className="absolute flex items-center justify-center cursor-move"
              style={{
                left: `${actor.x}%`,
                top: `${actor.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 20 : 10,
              }}
              onMouseDown={(e) => handlePointerDown(e, actor)}
              onTouchStart={(e) => handlePointerDown(e, actor)}
            >
              {mode === 'scene' && isSelected && (
                <div className="absolute inset-[-10px] rounded-full border-2 border-primary/50 shadow-[0_0_15px_rgba(255,107,138,0.5)] pointer-events-none" />
              )}
              <span
                ref={(el) => setActorRef(actor.id, el)}
                className={`text-[48px] leading-none select-none z-10 filter drop-shadow-md ${charPop && isSelected ? 'animate-char-pop' : ''}`}
              >
                {actor.emoji}
              </span>
            </div>
          );
        })}
        <span className="absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-wider text-black/40 z-0">
          Stage
        </span>

        {mode === 'scene' && (
          <div className="absolute bottom-3 right-3 z-30">
            <Popover>
              <PopoverTrigger asChild>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-3 py-1.5 rounded-full shadow-md transition-transform hover:scale-105">
                  ＋ Add character
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 bg-card/95 backdrop-blur z-50">
                <div className="flex flex-wrap gap-2 justify-center">
                  {CHARACTERS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => onAddActor(c.emoji)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-muted transition-transform hover:scale-110"
                    >
                      {c.emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      
      {mode === 'playground' && (
        <div className="h-[60px] bg-card/95 backdrop-blur flex items-center px-4 overflow-x-auto gap-2 border-t-2 border-border no-scrollbar shrink-0 relative z-30">
          {CHARACTERS.map(c => {
            const isSel = actors[0].emoji === c.emoji;
            return (
              <button
                key={c.id}
                data-testid={`btn-char-${c.id}`}
                onClick={() => {
                  onUpdateActor(actors[0].id, { emoji: c.emoji });
                  triggerCharPop();
                }}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-110 ${isSel ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'hover:bg-muted'}`}
                title={`Select ${c.id}`}
              >
                {c.emoji}
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
}