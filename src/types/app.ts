export interface ScreenBounds {
  W: number;
  H: number;
  cx: number;
  u: number;
  DPR: number;
}

export interface SceneExitState {
  t: number;
  dur: number;
}

export interface RenderEnv extends ScreenBounds {
  sc: number;
  R: number;
  t0: number;
  sceneElapsed: number;
  exiting: SceneExitState | null;
  tm: number[];
  fin: boolean;
  RM: boolean;
}

export interface DomRefs {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tx: HTMLElement;
  card: HTMLElement;
  st: HTMLElement;
  nt: HTMLElement;
  nx: HTMLElement;
}

export interface SettingsConfig {
  debug: boolean;
  audioEnabled: boolean;
  persistProgress: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
  cardContinueDelay: number;
  scene9ContinueDelay: number;
  maxDeltaSeconds: number;
}

export interface AtmosphereConfig {
  skyColors?: string[];
  mountains?: string[] | null;
  mountainReveal?: boolean;
  ground?: boolean;
  groundTop?: string;
  cloudDensity?: number;
}

export interface AmbientGlowConfig {
  rx: number;
  ry: number;
  radius: number;
  alpha: number;
  cool?: boolean;
}

export interface EffectRequest {
  name: string;
  params?: Record<string, unknown>;
}

export interface VisualSceneConfig {
  atmosphere?: AtmosphereConfig;
  ambientGlow?: AmbientGlowConfig | null;
  visualScene?: string | null;
  visualParams?: Record<string, unknown>;
  effects?: Array<string | EffectRequest>;
}

export interface AnimationRequest {
  name: string;
  params?: Record<string, unknown>;
}

export interface AnimationModule {
  name?: string;
  layer?: number;
  worldSpace?: boolean;
  init?: (ctx: AnimationInitContext | null, params?: Record<string, unknown>) => void;
  play?: (params?: Record<string, unknown>) => void;
  stop?: () => void;
  destroy?: () => void;
  update?: (dt: number, env: RenderEnv) => void;
  renderBackdrop?: (x: CanvasRenderingContext2D, env: RenderEnv) => void;
  render?: (x: CanvasRenderingContext2D, env: RenderEnv) => void;
  renderOverlay?: (x: CanvasRenderingContext2D, env: RenderEnv) => void;
  [action: string]: unknown;
}

export interface ScreenManagerLike {
  getBounds: () => ScreenBounds;
  onResize: (fn: (bounds: ScreenBounds) => void) => () => void;
  setRunning?: (v: boolean) => void;
  requestWakeLock?: () => Promise<boolean>;
  releaseWakeLock?: () => Promise<void>;
}

export interface AnimationInitContext {
  canvas: HTMLCanvasElement;
  ctx2d: CanvasRenderingContext2D;
  card: HTMLElement;
  nx: HTMLElement;
  tx: HTMLElement;
  screenManager: ScreenManagerLike;
  settings: SettingsConfig;
  getTime: () => number;
  onFinish: () => void;
}

export interface SceneMeta {
  id: number;
  file: string;
  transitionColor: string;
}

export interface SceneDefinition {
  id: number;
  hasCard?: boolean;
  darkCard?: boolean;
  manualContinue?: boolean;
  autoAdvance?: boolean;
  textStartDelay?: number;
  textWindow?: number;
  exitDuration?: number;
  exitAnimation?: string;
  transitionType?: string;
  texts?: Array<[string, string]>;
  getVisualConfig?: () => VisualSceneConfig;
  getAnimations?: () => Array<string | AnimationRequest>;
  updateUi?: (st: number, ctx: { animationManager: any; dom: DomRefs; settings: SettingsConfig }) => void;
  shouldAutoAdvance?: (ctx: { animationManager: any; sceneElapsed: number }) => boolean;
  onContinue?: (ctx: { sceneManager: any; animationManager: any; dom: DomRefs }) => boolean | unknown;
  onPointerMove?: (e: PointerEvent, ctx: { animationManager: any; screenManager: any; dom: DomRefs }) => void;
  onPointerDown?: (e: PointerEvent, ctx: { animationManager: any; screenManager: any; sceneManager: any; dom: DomRefs }) => void;
}

export interface VisualEffectModule {
  layer?: number;
  init?: (bounds: ScreenBounds, params?: Record<string, unknown>) => void;
  onResize?: (bounds: ScreenBounds) => void;
  update?: (dt: number, env: RenderEnv, params?: Record<string, unknown>) => void;
  render?: (x: CanvasRenderingContext2D, env: RenderEnv, params?: Record<string, unknown>) => void;
  destroy?: () => void;
}

export interface VisualSceneModule {
  init?: (bounds: ScreenBounds, params?: Record<string, unknown>) => void;
  update?: (dt: number, env: RenderEnv, activeEffects?: ActiveEffectEntry[]) => void;
}

export interface ActiveEffectEntry {
  name: string;
  effect: VisualEffectModule;
  params: Record<string, unknown>;
  failed: boolean;
}
