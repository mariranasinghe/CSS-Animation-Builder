import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppMode, Actor } from "../types";

export default function CssOutput({ mode, actors }: { mode: AppMode, actors: Actor[] }) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssOut).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  let cssOut = "";
  
  if (mode === 'playground') {
    const actor = actors[0];
    const sorted = [...actor.kf].sort((a, b) => a.pct - b.pct);
    const cssOutLines = sorted.map((k) => {
      const tr = `translate(${k.tx}px, ${k.ty}px) rotate(${k.rot}deg) scale(${k.sc.toFixed(2)})`;
      return `  ${k.pct}% {\n    transform: ${tr};\n    opacity: ${k.op.toFixed(2)};\n  }`;
    }).join("\n");
    cssOut = `@keyframes myAnimation {\n${cssOutLines}\n}\n\n.element {\n  animation: myAnimation ${actor.settings.dur}s ${actor.settings.ease}\n             ${actor.settings.iter} ${actor.settings.dir};\n}`;
  } else {
    actors.forEach((actor, i) => {
      const idx = i + 1;
      const sorted = [...actor.kf].sort((a, b) => a.pct - b.pct);
      const cssOutLines = sorted.map((k) => {
        const tr = `translate(${k.tx}px, ${k.ty}px) rotate(${k.rot}deg) scale(${k.sc.toFixed(2)})`;
        return `  ${k.pct}% {\n    transform: ${tr};\n    opacity: ${k.op.toFixed(2)};\n  }`;
      }).join("\n");
      cssOut += `/* ${actor.emoji} Actor ${idx} */\n`;
      cssOut += `@keyframes actor-${idx} {\n${cssOutLines}\n}\n\n`;
      cssOut += `.actor-${idx} {\n  animation: actor-${idx} ${actor.settings.dur}s ${actor.settings.ease}\n             ${actor.settings.iter} ${actor.settings.dir};\n}\n\n`;
    });
    cssOut = cssOut.trim();
  }

  return (
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
  );
}