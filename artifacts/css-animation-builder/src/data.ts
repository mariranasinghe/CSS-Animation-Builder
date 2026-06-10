import { Actor, Keyframe, Settings } from "./types";

export const PRESETS: Record<string, { kf: Keyframe[]; settings: Settings; emoji: string; name: string }> = {
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

export const CHARACTERS = [
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

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function makeDefaultActor(presetKey = 'bounce'): Actor {
  const p = PRESETS[presetKey] || PRESETS.bounce;
  return {
    id: crypto.randomUUID(),
    emoji: p.emoji,
    x: 50,
    y: 35,
    kf: JSON.parse(JSON.stringify(p.kf)),
    settings: JSON.parse(JSON.stringify(p.settings))
  };
}