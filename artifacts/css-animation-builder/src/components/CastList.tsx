import React from 'react';
import { Actor } from '../types';
import { Trash2 } from 'lucide-react';

interface CastListProps {
  actors: Actor[];
  selectedId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CastList({ actors, selectedId, onSelect, onDelete }: CastListProps) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3 min-h-[360px]">
      <h2 className="text-lg font-display font-semibold text-foreground border-b-2 border-border pb-2">
        Cast List
      </h2>
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 no-scrollbar">
        {actors.map((actor, i) => {
          const isSelected = actor.id === selectedId;
          return (
            <div
              key={actor.id}
              onClick={() => onSelect(actor.id)}
              className={`flex items-center justify-between p-2 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-primary/10 border-primary shadow-sm' 
                  : 'bg-background border-transparent hover:border-primary/30 hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{actor.emoji}</span>
                <span className="text-sm font-semibold text-foreground">
                  Actor {i + 1}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(actor.id);
                }}
                disabled={actors.length <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                title="Remove actor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}