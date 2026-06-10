import React, { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Check, Trash2, Clock, Wand2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Keyframe = {
  pct: number;
  tx: number;
  ty: number;
  rot: number;
  sc: number;
  op: number;
};

type Settings = {
  dur: number;
  ease: string;
  iter: string;
  dir: string;
};

const PRESETS: Record<string, { kf: Keyframe[]; settings: Settings; emoji: string; name: string }> = {
  bounce: {
    name: "Jump",
    emoji: "🐸",
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
      { pct: 45, tx: 0, ty: -70, rot: 0, sc: 1.08, op: 1 },
      { pct: 55, tx: 0, ty: -70, rot: 0, sc: 1.08, op: 1 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 1.1, ease: "ease-in-out", iter: "infinite", dir: "normal" },
  },
  spin: {
    name: "Orbit",
    emoji: "☀️",
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
      { pct: 100, tx: 0, ty: 0, rot: 360, sc: 1, op: 1 },
    ],
    settings: { dur: 1.5, ease: "linear", iter: "infinite", dir: "normal" },
  },
  pulse: {
    name: "Pulse",
    emoji: "❤️",
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
      { pct: 50, tx: 0, ty: 0, rot: 0, sc: 1.25, op: 0.75 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 1.2, ease: "ease-in-out", iter: "infinite", dir: "normal" },
  },
  slide: {
    name: "Slide In",
    emoji: "🚀",
    kf: [
      { pct: 0, tx: -160, ty: 0, rot: 0, sc: 0.8, op: 0 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 0.65, ease: "cubic-bezier(0.68,-0.55,0.265,1.55)", iter: "infinite", dir: "alternate" },
  },
  fade: {
    name: "Fade",
    emoji: "👻",
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
      { pct: 50, tx: 0, ty: 0, rot: 0, sc: 1, op: 0 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 2, ease: "ease-in-out", iter: "infinite", dir: "normal" },
  },
  pop: {
    name: "Pop",
    emoji: "🎈",
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: -10, sc: 0, op: 0 },
      { pct: 70, tx: 0, ty: 0, rot: 5, sc: 1.2, op: 1 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 0.55, ease: "ease-out", iter: "infinite", dir: "alternate" },
  },
  wobble: {
    name: "Wobble",
    emoji: "🦕",
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
      { pct: 20, tx: -18, ty: 0, rot: -8, sc: 1, op: 1 },
      { pct: 40, tx: 16, ty: 0, rot: 6, sc: 1, op: 1 },
      { pct: 60, tx: -12, ty: 0, rot: -4, sc: 1, op: 1 },
      { pct: 80, tx: 8, ty: 0, rot: 2, sc: 1, op: 1 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 1, ease: "ease-in-out", iter: "infinite", dir: "normal" },
  },
};

const CHARACTERS = [
  { id: 'star', emoji: '⭐' },
  { id: 'rocket', emoji: '🚀' },
  { id: 'cloud', emoji: '☁️' },
  { id: 'sun', emoji: '☀️' },
  { id: 'cat', emoji: '🐱' },
  { id: 'ghost', emoji: '👻' },
  { id: 'ufo', emoji: '🛸' },
  { id: 'balloon', emoji: '🎈' },
  { id: 'frog', emoji: '🐸' },
  { id: 'dino', emoji: '🦕' },
  { id: 'unicorn', emoji: '🦄' },
  { id: 'alien', emoji: '👾' },
  { id: 'heart', emoji: '❤️' },
  { id: 'diamond', emoji: '💎' },
  { id: 'fish', emoji: '🐠' },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function App() {
  const [kf, setKf] = useState<Keyframe[]>(() => JSON.parse(JSON.stringify(PRESETS.bounce.kf)));
  const [settings, setSettings] = useState<Settings>(() => JSON.parse(JSON.stringify(PRESETS.bounce.settings)));
  const [selIdx, setSelIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // New state additions
  const [character, setCharacter] = useState('⭐');
  const [activePreset, setActivePreset] = useState<string | null>('bounce');
  const [stageFlash, setStageFlash] = useState(false);
  const [charPop, setCharPop] = useState(false);
  const [newKeyframeId, setNewKeyframeId] = useState<number | null>(null);

  const styleTagRef = useRef<HTMLStyleElement | null>(null);
  const elRef = useRef<HTMLDivElement | null>(null);

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

  const updateAnimation = useCallback(() => {
    if (!styleTagRef.current || !elRef.current) return;
    const sorted = [...kf].sort((a, b) => a.pct - b.pct);
    const lines = sorted.map((k) => {
      const tr = `translate(${k.tx}px, ${k.ty}px) rotate(${k.rot}deg) scale(${k.sc.toFixed(2)})`;
      return `  ${k.pct}% { transform: ${tr}; opacity: ${k.op.toFixed(2)}; }`;
    }).join("\n");
    styleTagRef.current.textContent = `@keyframes _cab { \n${lines}\n }`;

    const el = elRef.current;
    el.style.animation = "none";
    void el.offsetHeight; // trigger reflow
    el.style.animation = `_cab ${settings.dur}s ${settings.ease} ${settings.iter} ${settings.dir}`;
  }, [kf, settings]);

  useEffect(() => {
    updateAnimation();
  }, [updateAnimation]);

  const loadPreset = (name: string) => {
    const p = PRESETS[name];
    setKf(JSON.parse(JSON.stringify(p.kf)));
    setSettings(JSON.parse(JSON.stringify(p.settings)));
    setSelIdx(0);
    setActivePreset(name);
    setStageFlash(true);
    setTimeout(() => setStageFlash(false), 400);
  };

  const handleCharSelect = (emoji: string) => {
    setCharacter(emoji);
    setCharPop(true);
    setTimeout(() => setCharPop(false), 300);
  };

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
    setKf(nextKf);
    setSelIdx(nextKf.length - 1);
    
    // Animation for new keyframe dot
    setNewKeyframeId(clamped);
    setTimeout(() => setNewKeyframeId(null), 300);
  };

  const deleteSelected = () => {
    if (!kf[selIdx] || kf[selIdx].pct === 0 || kf[selIdx].pct === 100) return;
    const nextKf = [...kf];
    nextKf.splice(selIdx, 1);
    setKf(nextKf);
    setSelIdx(Math.max(0, selIdx - 1));
  };

  const updateProp = (prop: keyof Keyframe, val: number) => {
    const nextKf = [...kf];
    nextKf[selIdx] = { ...nextKf[selIdx], [prop]: val };
    setKf(nextKf);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssOut).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sorted = [...kf].sort((a, b) => a.pct - b.pct);
  const cssOutLines = sorted.map((k) => {
    const tr = `translate(${k.tx}px, ${k.ty}px) rotate(${k.rot}deg) scale(${k.sc.toFixed(2)})`;
    return `  ${k.pct}% {\n    transform: ${tr};\n    opacity: ${k.op.toFixed(2)};\n  }`;
  }).join("\n");
  const cssOut = `@keyframes myAnimation {\n${cssOutLines}\n}\n\n.element {\n  animation: myAnimation ${settings.dur}s ${settings.ease}\n             ${settings.iter} ${settings.dir};\n}`;

  const currentKf = kf[selIdx];

  const PropSlider = ({
    id, label, min, max, step, val, unit, hintText
  }: { id: keyof Keyframe; label: string; min: number; max: number; step: number; val: number; unit: string; hintText: string }) => (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold">{label} <span className="font-mono text-[10px] text-muted-foreground ml-1">{id}</span></span>
        <span className="text-muted-foreground italic text-[10px]">{hintText}</span>
      </div>
      <div className="flex items-center gap-4">
        <Slider
          min={min} max={max} step={step}
          value={[val]}
          onValueChange={(v) => updateProp(id, v[0])}
          className="flex-1 cursor-ew-resize"
        />
        <span className="text-xs font-mono font-medium min-w-[50px] text-right text-foreground">
          {val}{unit}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 text-foreground font-sans flex flex-col items-center">
      <div className="w-full max-w-[880px] flex flex-col gap-6">
        
        {/* Header */}
        <header className="mb-2">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary tracking-wide mb-2 drop-shadow-sm">
            Cartoon Stage
          </h1>
          <p className="text-muted-foreground text-lg">
            Pick your character, set the scene, choreograph the moves.
          </p>
        </header>

        {/* Top Section: Stage & Settings */}
        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          
          {/* Stage Card */}
          <div className={`relative bg-card border-2 border-border rounded-2xl overflow-hidden flex flex-col min-h-[320px] transition-shadow duration-300 ${stageFlash ? 'animate-stage-flash shadow-[0_0_20px_5px_rgba(255,107,138,0.5)] border-primary' : 'shadow-lg'}`}>
            <div className="flex-1 relative" style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #c9e8ff 80%, #4CAF50 80%, #388E3C 100%)' }}>
              <div className="absolute inset-0 flex items-start justify-center pt-[15%]">
                <span
                  ref={elRef}
                  className={`text-[48px] leading-none select-none z-10 filter drop-shadow-md ${charPop ? 'animate-char-pop' : ''}`}
                >
                  {character}
                </span>
              </div>
              <span className="absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-wider text-black/40">
                Stage
              </span>
            </div>
            
            {/* Character Chips */}
            <div className="h-[60px] bg-card/95 backdrop-blur flex items-center px-4 overflow-x-auto gap-2 border-t-2 border-border no-scrollbar shrink-0">
              {CHARACTERS.map(c => (
                <button
                  key={c.id}
                  data-testid={`btn-char-${c.id}`}
                  onClick={() => handleCharSelect(c.emoji)}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-110 ${character === c.emoji ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'hover:bg-muted'}`}
                  title={`Select ${c.id}`}
                >
                  {c.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Timing & Behavior */}
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
                  onValueChange={(v) => setSettings({ ...settings, dur: v[0] })}
                  className="flex-1 cursor-ew-resize"
                />
                <span className="text-xs font-mono font-bold min-w-[40px] text-right">{settings.dur.toFixed(1)}s</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Easing</span>
              <Select value={settings.ease} onValueChange={(v) => setSettings({ ...settings, ease: v })}>
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
              <Select value={settings.iter} onValueChange={(v) => setSettings({ ...settings, iter: v })}>
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
              <Select value={settings.dir} onValueChange={(v) => setSettings({ ...settings, dir: v })}>
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
        </div>

        {/* Presets Row */}
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

        {/* Timeline */}
        <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-sm mt-2">
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

        {/* Properties Panel */}
        {currentKf && (
          <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2">
            <h2 className="text-xl font-display font-semibold text-primary flex items-center gap-2 mb-6">
              <Wand2 className="w-6 h-6" />
              Edit Move at {currentKf.pct}%
            </h2>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="space-y-4">
                <PropSlider 
                  id="tx" label="Slide left/right" min={-200} max={200} step={5} val={currentKf.tx} unit="px"
                  hintText={currentKf.tx < 0 ? "Left" : currentKf.tx > 0 ? "Right" : "Center"}
                />
                <PropSlider 
                  id="ty" label="Move up/down" min={-200} max={200} step={5} val={currentKf.ty} unit="px"
                  hintText={currentKf.ty < 0 ? "Up" : currentKf.ty > 0 ? "Down" : "Middle"}
                />
                <PropSlider 
                  id="rot" label="Spin angle" min={-360} max={360} step={5} val={currentKf.rot} unit="°"
                  hintText={currentKf.rot < 0 ? "Counter-clockwise" : currentKf.rot > 0 ? "Clockwise" : "Straight"}
                />
              </div>
              <div className="space-y-4">
                <PropSlider 
                  id="sc" label="Size" min={0} max={3} step={0.05} val={currentKf.sc} unit=""
                  hintText={currentKf.sc < 1 ? "Smaller" : currentKf.sc > 1 ? "Larger" : "Normal"}
                />
                <PropSlider 
                  id="op" label="Visibility" min={0} max={1} step={0.05} val={currentKf.op} unit=""
                  hintText={currentKf.op < 1 ? "Transparent" : "Opaque"}
                />
              </div>
            </div>
          </div>
        )}

        {/* CSS Output Panel */}
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden mt-4 shadow-sm mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b-2 border-border bg-background/50 gap-4">
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">Your CSS</h2>
              <p className="text-xs text-muted-foreground mt-1">Drop this into your stylesheet to use this animation anywhere.</p>
            </div>
            <Button 
              variant={copied ? "default" : "secondary"}
              className={`h-10 px-6 font-bold rounded-full transition-all ${copied ? 'animate-confetti-flash bg-green-500 text-white hover:bg-green-600' : ''}`}
              onClick={copyToClipboard}
              data-testid="button-copy-css"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy code"}
            </Button>
          </div>
          <pre className="m-0 p-5 text-sm font-mono text-foreground whitespace-pre overflow-x-auto leading-relaxed bg-[#0b0914]">
            <code dangerouslySetInnerHTML={{ __html: cssOut.replace(/([0-9.]+(px|deg|s|%|))|([a-z-]+\()|(\})/g, match => {
              if (match === '}') return `<span style="color: #6c688c">${match}</span>`;
              if (/[0-9.]/.test(match)) return `<span style="color: #FFD166">${match}</span>`;
              if (/\(/.test(match)) return `<span style="color: #a7a2c4">${match}</span>`;
              return match;
            }) }} />
          </pre>
        </div>

      </div>
    </div>
  );
}
