/** Multi-runtime compatibility utilities */

// Type declarations for runtime-specific globals
declare const Deno: {
  version?: { deno?: string };
  env: { get(key: string): string | undefined };
  cwd(): string;
};

declare const Bun: {
  version?: string;
};

declare const process: {
  versions?: { node?: string };
  env: Record<string, string | undefined>;
  cwd(): string;
};

/** Detected runtime type */
export type Runtime = 'node' | 'deno' | 'bun' | 'unknown';


/** Detect current runtime environment */
export function detectRuntime(): Runtime {
  if (typeof Deno !== 'undefined' && Deno?.version?.deno) {
    return 'deno';
  }
  if (typeof Bun !== 'undefined' && Bun?.version) {
    return 'bun';
  }
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'node';
  }
  return 'unknown';
}

/** Get current runtime */
export const RUNTIME: Runtime = detectRuntime();

/** Cross-runtime current working directory access */
export function getCwd(): string {
  try {
    switch (RUNTIME) {
      case 'deno':
        return Deno.cwd();
      case 'node':
      case 'bun':
        // Bun supports process.cwd() like Node
        return process.cwd();
      default:
        return '.';
    }
  } catch {
    return '.';
  }
}

/**
 * Safe method to read an environment variable
 * @param name environment variable name
 * @param back optional default / fallback value
 */
export function getEnv(name: string, fallback = ''): string {
  try {
    switch (RUNTIME) {
      case 'deno':
        return Deno.env.get(name) ?? fallback;
      case 'node':
      case 'bun':
        // Bun supports process.env like Node
        return process.env[name] ?? fallback;
      default:
        return fallback;
    }
  } catch {
    return fallback;
  }
}

/** @deprecated use `getEnv` instead */
export const ConfigService = { get: getEnv };
