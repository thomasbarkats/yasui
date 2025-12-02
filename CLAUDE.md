# CLAUDE.md

Instructions for Claude Code working on YasuiJS.

## Core Concept

TypeScript REST framework. Decorators store metadata on prototypes via `reflect-metadata`. Core builds instances using metadata, creates route handlers, executes middleware chains.

## File Navigation

```
src/
├── decorators/          # Metadata writers (@Controller writes to prototype.path + prototype.configureRoutes)
├── utils/
│   ├── route-handler.ts      # Reads metadata, creates handler functions
│   ├── decorator-validator.ts # Validates metadata consistency
│   └── app.service.ts         # Error handling, 404, logging
├── core.ts              # Orchestrates: registers routes, builds middlewares chain, creates fetch handler
├── injector.ts          # Builds instances by reading DESIGN_PARAM_TYPES metadata
├── base.ts              # Entry: createServer() / createApp()
└── web.ts               # YasuiRequest extends Request

plugins/         # Official plugins (@yasui/cors, etc.) - functional middlewares
docs/en/         # Source of truth
docs/es|fr|zh/   # Translations (ask before updating)
src/example/     # Basic usage example + sanity test
```

## File Patterns

- `*.i.ts` = interfaces
- `*.enum.ts` = enums
- One class per file
- Interfaces prefix `I`, union types prefix `T`

## Comments

- Avoid useless comments
- Only comment tricky/complex lines when it brings quick understanding
- Exception: Public API must be fully commented (exported functions, YasuiConfig properties, etc.) - JSR scoring requires it

## Critical Patterns

### Error Handling
```typescript
// CORRECT
return await next();
return next().catch(err => handle(err));

// WRONG - errors escape
try { return await next(); } catch {}
```
Framework uses `.catch()` chains. Never `try { return await }`.

### DI Token Strategy
```typescript
SHARED scope → string key → registry.get('ClassName')
LOCAL/DEEP_LOCAL scope → Symbol key → registry.get(Symbol('ClassName'))
```

### Metadata Flow
1. Decorator writes metadata to prototype: `defineMetadata(KEY, value, target.prototype)`
2. Core reads metadata during setup: `getMetadata(KEY, Controller.prototype)`
3. Route handler reads at request time: `getMetadata(KEY, instance, methodName)`

Pre-cache metadata at registration, not per-request.

### Performance
- Lazy parse body (only if `@Body()` present)
- Pre-allocate arrays (calculate max index first)
- Cache regexes, metadata lookups
- Type casting only for `params/query/headers`, not body

## Metadata Keys (enums/reflect.enum.ts)

```typescript
DESIGN_PARAM_TYPES   // auto from TypeScript
PRE_INJECTED_DEPS    // @Inject('TOKEN') writes here
ROUTES               // @Get/@Post write here
PARAMS               // @Param/@Query write here
METHOD_INJECTED_DEPS // @Inject() in methods
RESOLVED_METHOD_DEPS // Injector writes resolved deps
```

## Breaking Rules

1. No `return await` inside try-catch
2. Deferred injections return objects only (no primitives), typed with `| null`
3. Type casting needs TypeScript metadata (`design:paramtypes`)
4. SHARED scope default (no inheritance unless DEEP_LOCAL)
5. Web Standards only (Express middlewares incompatible)

## When Implementing Features

1. Find similar decorator/util in src/, copy pattern
2. Write metadata in decorator using `defineMetadata()`
3. Read metadata in Core/Injector/RouteHandler using `getMetadata()`
4. Add validation in DecoratorValidator
5. Test with src/example/ to verify basic functionality
6. Test Node/Deno/Bun if touching Core/Base

## Documentation

English first. Ask before touching es/fr/zh translations.

**Important:** Links in translated docs must point to localized paths:
- FR docs: `/fr/guide/...`, `/fr/reference/...`, `/fr/plugins/...`
- ES docs: `/es/guide/...`, `/es/reference/...`, `/es/plugins/...`
- ZH docs: `/zh/guide/...`, `/zh/reference/...`, `/zh/plugins/...`
- Never use `/guide/...` or `/plugins/...` in translated docs (points to EN version)

## Source of Truth

- Architecture patterns → read Core/Injector
- Decorator patterns → read existing decorators
- Error handling → app.service.ts
- Type casting → route-handler.ts
- DI resolution → injector.ts
