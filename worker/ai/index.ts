export * from "./muse";
export * from "./provenance";
export { nextTurn } from "./interview";
export { concept, research, report, system, legal } from "./stages";
export { prototype, repairPrototype, sanitize } from "./prototype";
export { screen, type Application } from "./screen";
import { createMuse, type AiEnv } from "./muse";
export const transcribe = (bytes: Uint8Array | ArrayBuffer, contentType: string, env: AiEnv) =>
  createMuse(env).transcribe(bytes, contentType);
