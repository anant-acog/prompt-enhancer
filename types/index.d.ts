export type Original = string | null

declare module 'claude-code' {
  interface PluginState {
    'prompt-enhancer': { isBusy: boolean; original: Original }
  }
}
