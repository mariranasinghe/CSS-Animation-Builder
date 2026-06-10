export type Keyframe = {
  pct: number;
  tx: number;
  ty: number;
  rot: number;
  sc: number;
  op: number;
};

export type Settings = {
  dur: number;
  ease: string;
  iter: string;
  dir: string;
};

export type Actor = {
  id: string;
  emoji: string;
  x: number;
  y: number;
  kf: Keyframe[];
  settings: Settings;
};

export type AppMode = 'playground' | 'scene';