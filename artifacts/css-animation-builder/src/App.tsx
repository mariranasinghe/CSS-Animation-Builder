import React, { useState, useEffect, useRef, useCallback } from "react";
import { AppMode, Actor, Keyframe } from "./types";
import { PRESETS, makeDefaultActor } from "./data";
import { Button } from "@/components/ui/button";

import Stage from "./components/Stage";
import SettingsPanel from "./components/SettingsPanel";
import CastList from "./components/CastList";
import Timeline from "./components/Timeline";
import PropsPanel from "./components/PropsPanel";
import CssOutput from "./components/CssOutput";

export default function App() {
  const [mode, setMode] = useState<AppMode>('playground');
  const [actors, setActors] = useState<Actor[]>([makeDefaultActor()]);
  const [selectedId, setSelectedId] = useState<string>(actors[0].id);
  const [selIdx, setSelIdx] = useState(0);
  
  const [activePreset, setActivePreset] = useState<string | null>('bounce');
  const [stageFlash, setStageFlash] = useState(false);
  const [charPop, setCharPop] = useState(false);
  const [newKeyframeId, setNewKeyframeId] = useState<number | null>(null);

  const styleTagRef = useRef<HTMLStyleElement | null>(null);
  const actorRefs = useRef<Map<string, HTMLElement>>(new Map());

  const selectedActor = actors.find(a => a.id === selectedId) ?? actors[0];
  const currentKf = selectedActor.kf[selIdx];

  const setActorRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) actorRefs.current.set(id, el);
    else actorRefs.current.delete(id);
  }, []);

  const updateActor = useCallback((id: string, patch: Partial<Actor>) => {
    setActors(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }, []);

  const updateAllAnimations = useCallback(() => {
    if (!styleTagRef.current) return;
    let css = '';
    actors.forEach(actor => {
      const animName = `_cab_${actor.id}`;
      const sorted = [...actor.kf].sort((a, b) => a.pct - b.pct);
      const lines = sorted.map(k => {
        const tr = `translate(${k.tx}px, ${k.ty}px) rotate(${k.rot}deg) scale(${k.sc.toFixed(2)})`;
        return `${k.pct}% { transform: ${tr}; opacity: ${k.op.toFixed(2)}; }`;
      }).join(' ');
      css += `@keyframes ${animName} { ${lines} }\n`;
    });
    styleTagRef.current.textContent = css;

    actors.forEach(actor => {
      const el = actorRefs.current.get(actor.id);
      if (!el) return;
      const animName = `_cab_${actor.id}`;
      el.style.animation = 'none';
      void el.offsetHeight; // reflow
      el.style.animation = `${animName} ${actor.settings.dur}s ${actor.settings.ease} ${actor.settings.iter} ${actor.settings.dir}`;
    });
  }, [actors]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    if (!styleTagRef.current) {
      styleTagRef.current = document.createElement("style");
      document.head.appendChild(styleTagRef.current);
    }
    return () => {
      if (styleTagRef.current) {
        document.head.removeChild(styleTagRef.current);
        styleTagRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    updateAllAnimations();
  }, [updateAllAnimations]);

  const toggleMode = (newMode: AppMode) => {
    if (newMode === mode) return;
    if (newMode === 'scene') {
      // Transition from playground to scene: keep the single actor
      setMode('scene');
    } else {
      // Transition from scene to playground: keep only the selected actor
      setActors([selectedActor]);
      setMode('playground');
    }
  };

  const handleAddActor = (emoji: string) => {
    const newActor = makeDefaultActor();
    newActor.emoji = emoji;
    // slightly randomize position around center
    newActor.x = 40 + Math.random() * 20;
    newActor.y = 30 + Math.random() * 20;
    setActors(prev => [...prev, newActor]);
    setSelectedId(newActor.id);
    setSelIdx(0);
  };

  const loadPreset = (name: string) => {
    const p = PRESETS[name];
    updateActor(selectedActor.id, {
      kf: JSON.parse(JSON.stringify(p.kf)),
      settings: JSON.parse(JSON.stringify(p.settings))
    });
    setSelIdx(0);
    setActivePreset(name);
    setStageFlash(true);
    setTimeout(() => setStageFlash(false), 400);
  };

  const handleUpdateProp = (prop: keyof Keyframe, val: number) => {
    const nextKf = [...selectedActor.kf];
    nextKf[selIdx] = { ...nextKf[selIdx], [prop]: val };
    updateActor(selectedActor.id, { kf: nextKf });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 text-foreground font-sans flex flex-col items-center">
      <div className="w-full max-w-[1080px] flex flex-col gap-6">
        
        {/* Header */}
        <header className="mb-2 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary tracking-wide mb-2 drop-shadow-sm">
            Cartoon Stage
          </h1>
          <p className="text-muted-foreground text-lg">
            Pick your character, set the scene, choreograph the moves.
          </p>
        </header>

        {/* Mode Toggle */}
        <div className="flex justify-center md:justify-start">
          <div className="bg-card border-2 border-border p-1 rounded-full flex gap-1 inline-flex shadow-sm">
            <button
              onClick={() => toggleMode('playground')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${mode === 'playground' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              Playground
            </button>
            <button
              onClick={() => toggleMode('scene')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${mode === 'scene' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              Scene Builder
            </button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center md:text-left -mt-4 mb-2">
          {mode === 'playground' ? "One character, quick experiments" : "Build a full animated scene with multiple characters"}
        </div>

        {/* Layout */}
        <div className={`grid gap-6 ${mode === 'scene' ? 'md:grid-cols-[1fr_280px]' : 'md:grid-cols-[1fr_300px]'}`}>
          
          {/* Main Column */}
          <div className="flex flex-col gap-6">
            <Stage 
              mode={mode}
              actors={actors}
              selectedId={selectedActor.id}
              onSelectActor={(id) => { setSelectedId(id); setSelIdx(0); }}
              onUpdateActor={updateActor}
              onAddActor={handleAddActor}
              setActorRef={setActorRef}
              stageFlash={stageFlash}
              charPop={charPop}
              triggerCharPop={() => { setCharPop(true); setTimeout(() => setCharPop(false), 300); }}
            />

            {mode === 'playground' && (
              <SettingsPanel 
                settings={selectedActor.settings} 
                onChange={(s) => updateActor(selectedActor.id, { settings: s })} 
              />
            )}

            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick moves:</span>
              <div className="flex flex-wrap gap-3">
                {Object.entries(PRESETS).map(([id, p]) => {
                  const isActive = activePreset === id;
                  return (
                    <Button
                      key={id}
                      data-testid={`button-preset-${id}`}
                      variant="outline"
                      className={`h-10 rounded-full px-5 text-sm font-bold border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${isActive ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground border-transparent' : 'bg-card text-foreground hover:border-primary/50 hover:text-primary'}`}
                      onClick={() => loadPreset(id)}
                    >
                      <span className="text-lg mr-2">{p.emoji}</span> {p.name}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <Timeline 
                kf={selectedActor.kf}
                selIdx={selIdx}
                setSelIdx={setSelIdx}
                onUpdateKf={(kf) => updateActor(selectedActor.id, { kf })}
                newKeyframeId={newKeyframeId}
                triggerNewKfPop={(id) => { setNewKeyframeId(id); setTimeout(() => setNewKeyframeId(null), 300); }}
              />
              <PropsPanel 
                currentKf={currentKf} 
                onUpdateProp={handleUpdateProp} 
                emoji={selectedActor.emoji} 
                actorId={selectedActor.id} 
                mode={mode} 
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {mode === 'scene' ? (
              <>
                <CastList 
                  actors={actors}
                  selectedId={selectedActor.id}
                  onSelect={(id) => { setSelectedId(id); setSelIdx(0); }}
                  onDelete={(id) => {
                    const nextActors = actors.filter(a => a.id !== id);
                    if (nextActors.length > 0) {
                      setActors(nextActors);
                      if (selectedId === id) {
                        setSelectedId(nextActors[0].id);
                        setSelIdx(0);
                      }
                    }
                  }}
                />
                <SettingsPanel 
                  settings={selectedActor.settings} 
                  onChange={(s) => updateActor(selectedActor.id, { settings: s })} 
                />
              </>
            ) : null}
          </div>
          
        </div>

        {/* Full Width Output */}
        <CssOutput mode={mode} actors={actors} />
      </div>
    </div>
  );
}