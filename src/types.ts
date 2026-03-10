import * as THREE from 'three';

export type ForceLevel = 'low' | 'medium' | 'high';

export interface ControlDef {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  unit?: string;
}

export interface LessonContext {
  scene: THREE.Scene;
  forceGroup: THREE.Group;
}

export interface LessonRuntime {
  root: THREE.Group;
  update: (params: Record<string, number>) => void;
  dispose: () => void;
}

export interface LessonDef {
  id: string;
  title: string;
  concept: string;
  explanation: string;
  insight: string;
  controls: ControlDef[];
  build: (ctx: LessonContext) => LessonRuntime;
}
