import { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Check, Trash2, SlidersHorizontal } from "lucide-react";
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

const PRESETS: Record<string, { kf: Keyframe[]; settings: Settings }> = {
  bounce: {
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
      { pct: 45, tx: 0, ty: -70, rot: 0, sc: 1.08, op: 1 },
      { pct: 55, tx: 0, ty: -70, rot: 0, sc: 1.08, op: 1 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 1.1, ease: "ease-in-out", iter: "infinite", dir: "normal" },
  },
  spin: {
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
      { pct: 100, tx: 0, ty: 0, rot: 360, sc: 1, op: 1 },
    ],
    settings: { dur: 1.5, ease: "linear", iter: "infinite", dir: "normal" },
  },
  pulse: {
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
      { pct: 50, tx: 0, ty: 0, rot: 0, sc: 1.25, op: 0.75 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 1.2, ease: "ease-in-out", iter: "infinite", dir: "normal" },
  },
  slide: {
    kf: [
      { pct: 0, tx: -160, ty: 0, rot: 0, sc: 0.8, op: 0 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 0.65, ease: "cubic-bezier(0.68,-0.55,0.265,1.55)", iter: "infinite", dir: "alternate" },
  },
  fade: {
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
      { pct: 50, tx: 0, ty: 0, rot: 0, sc: 1, op: 0 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 2, ease: "ease-in-out", iter: "infinite", dir: "normal" },
  },
  pop: {
    kf: [
      { pct: 0, tx: 0, ty: 0, rot: -10, sc: 0, op: 0 },
      { pct: 70, tx: 0, ty: 0, rot: 5, sc: 1.2, op: 1 },
      { pct: 100, tx: 0, ty: 0, rot: 0, sc: 1, op: 1 },
    ],
    settings: { dur: 0.55, ease: "ease-out", iter: "infinite", dir: "alternate" },
  },
  wobble: {
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function App() {
  const [kf, setKf] = useState<Keyframe[]>(() => JSON.parse(JSON.stringify(PRESETS.bounce.kf)));
  const [settings, setSettings] = useState<Settings>(() => JSON.parse(JSON.stringify(PRESETS.bounce.settings)));
  const [selIdx, setSelIdx] = useState(0);
  const [copied, setCopied] = useState(false);

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
    id, label, min, max, step, val, unit
  }: { id: keyof Keyframe; label: string; min: number; max: number; step: number; val: number; unit: string }) => (
    <div className="flex items-center gap-4 mb-4">
      <span className="text-xs text-muted-foreground min-w-[76px] font-mono">{label}</span>
      <Slider
        min={min} max={max} step={step}
        value={[val]}
        onValueChange={(v) => updateProp(id, v[0])}
        className="flex-1 cursor-ew-resize"
      />
      <span className="text-xs font-medium min-w-[50px] text-right font-mono text-foreground">
        {val}{unit}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 text-foreground font-sans flex flex-col items-center">
      <div className="w-full max-w-[800px] flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-medium tracking-tight mb-1">CSS animation builder</h1>
          <p className="text-sm text-muted-foreground">Click the timeline to add keyframes. Adjust properties. Copy the CSS.</p>
        </div>

        <div className="grid md:grid-cols-[200px_1fr] gap-4">
          <div className="bg-card border border-border rounded-xl flex items-center justify-center min-h-[180px] overflow-hidden relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
            <div
              ref={elRef}
              className="w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/20 z-10"
            />
          </div>

          <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground min-w-[70px] font-mono">duration</span>
              <Slider
                min={0.2} max={5} step={0.1}
                value={[settings.dur]}
                onValueChange={(v) => setSettings({ ...settings, dur: v[0] })}
                className="flex-1 cursor-ew-resize"
              />
              <span className="text-xs font-medium min-w-[40px] text-right font-mono">{settings.dur.toFixed(1)}s</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground min-w-[70px] font-mono">easing</span>
              <Select value={settings.ease} onValueChange={(v) => setSettings({ ...settings, ease: v })}>
                <SelectTrigger className="flex-1 h-8 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ease">ease</SelectItem>
                  <SelectItem value="ease-in">ease-in</SelectItem>
                  <SelectItem value="ease-out">ease-out</SelectItem>
                  <SelectItem value="ease-in-out">ease-in-out</SelectItem>
                  <SelectItem value="linear">linear</SelectItem>
                  <SelectItem value="cubic-bezier(0.68,-0.55,0.265,1.55)">spring</SelectItem>
                  <SelectItem value="steps(6)">steps(6)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground min-w-[70px] font-mono">repeat</span>
              <Select value={settings.iter} onValueChange={(v) => setSettings({ ...settings, iter: v })}>
                <SelectTrigger className="flex-1 h-8 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infinite">infinite</SelectItem>
                  <SelectItem value="1">once</SelectItem>
                  <SelectItem value="2">twice</SelectItem>
                  <SelectItem value="3">3×</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground min-w-[70px] font-mono">direction</span>
              <Select value={settings.dir} onValueChange={(v) => setSettings({ ...settings, dir: v })}>
                <SelectTrigger className="flex-1 h-8 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">normal</SelectItem>
                  <SelectItem value="alternate">alternate</SelectItem>
                  <SelectItem value="reverse">reverse</SelectItem>
                  <SelectItem value="alternate-reverse">alt-reverse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground mr-2 font-mono">Presets:</span>
          {Object.keys(PRESETS).map(name => (
            <Button
              key={name}
              data-testid={`button-preset-${name}`}
              variant="secondary"
              size="sm"
              className="h-7 text-xs px-3 rounded-full font-medium"
              onClick={() => loadPreset(name)}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Timeline — click empty space to add a keyframe</span>
            {currentKf && currentKf.pct !== 0 && currentKf.pct !== 100 && (
              <Button 
                data-testid="button-delete-keyframe"
                variant="outline" 
                size="sm" 
                className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={deleteSelected}
              >
                <Trash2 className="w-3 h-3 mr-1.5" />
                Delete keyframe
              </Button>
            )}
          </div>
          
          <div 
            className="relative h-12 bg-card border border-border rounded-xl cursor-crosshair select-none"
            onClick={handleTimelineClick}
          >
            {[0, 25, 50, 75, 100].map(p => (
              <div 
                key={p} 
                className="absolute top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-mono pointer-events-none"
                style={{ 
                  left: p === 0 ? `calc(${p}% + 8px)` : p === 100 ? `calc(${p}% - 26px)` : `calc(${p}% - 10px)`
                }}
              >
                {p}%
              </div>
            ))}

            {kf.map((k, i) => {
              const isSel = i === selIdx;
              return (
                <div
                  key={i}
                  className={`absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full cursor-pointer z-10 transition-shadow ${isSel ? 'bg-primary border-[3px] border-card shadow-[0_0_0_2px_hsl(var(--primary))]' : 'bg-card border-2 border-muted-foreground hover:border-primary'}`}
                  style={{ left: `calc(${k.pct}% - 9px)` }}
                  title={`${k.pct}%`}
                  onClick={(e) => { e.stopPropagation(); setSelIdx(i); }}
                />
              );
            })}
          </div>
        </div>

        {currentKf && (
          <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center text-xs font-medium text-foreground mb-5">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-primary" />
              Keyframe at {currentKf.pct}%
            </div>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-1">
              <div>
                <PropSlider id="tx" label="translateX" min={-200} max={200} step={5} val={currentKf.tx} unit="px" />
                <PropSlider id="ty" label="translateY" min={-200} max={200} step={5} val={currentKf.ty} unit="px" />
                <PropSlider id="rot" label="rotate" min={-360} max={360} step={5} val={currentKf.rot} unit="°" />
              </div>
              <div>
                <PropSlider id="sc" label="scale" min={0} max={3} step={0.05} val={currentKf.sc} unit="" />
                <PropSlider id="op" label="opacity" min={0} max={1} step={0.05} val={currentKf.op} unit="" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden mt-2">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <span className="text-xs text-muted-foreground font-mono">Generated CSS</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs px-3 hover:bg-muted"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="w-3 h-3 mr-1.5 text-green-500" /> : <Copy className="w-3 h-3 mr-1.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="m-0 p-4 text-xs font-mono text-primary-foreground/90 whitespace-pre overflow-x-auto leading-relaxed bg-[#111113]">
            <code dangerouslySetInnerHTML={{ __html: cssOut.replace(/([0-9.]+(px|deg|s|%|))|([a-z-]+\()|(\})/g, match => {
              if (match === '}') return `<span style="color: #888">${match}</span>`;
              if (/[0-9.]/.test(match)) return `<span style="color: hsl(var(--primary))">${match}</span>`;
              if (/\(/.test(match)) return `<span style="color: #aaa">${match}</span>`;
              return match;
            }) }} />
          </pre>
        </div>
      </div>
    </div>
  );
}
