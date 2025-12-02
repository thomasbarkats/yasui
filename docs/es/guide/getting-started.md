# Primeros Pasos

Esta guía te ayudará a poner en marcha tu primera API en solo unos minutos.

## Prerrequisitos

Antes de comenzar, asegúrate de tener:

- **Node.js** (versión 18 o superior), **Deno**, o **Bun** - YasuiJS funciona en todos los runtimes
- **npm**, **pnpm**, **yarn**, o tu gestor de paquetes preferido
- Conocimientos básicos de **TypeScript**

Puedes verificar la versión de tu runtime con:
```bash
node --version  # Node.js
deno --version  # Deno
bun --version   # Bun
```

Esta guía usa Node.js, pero el mismo código funciona en:
- Runtimes tradicionales: Node.js, Deno, Bun
- Runtimes edge: Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy
- Serverless: AWS Lambda, Vercel Functions, Netlify Functions

## Inicio Rápido

Vamos a crear tu primera API de YasuiJS en 3 simples pasos.

### Paso 1: Instalar YasuiJS

Crea un nuevo directorio e instala YasuiJS:

::: code-group
```bash [npm]
mkdir my-yasui-api
cd my-yasui-api
npm init -y
npm install yasui
npm install -D typescript @types/node
```

```bash [pnpm]
mkdir my-yasui-api
cd my-yasui-api
pnpm init
pnpm add yasui
pnpm add -D typescript @types/node
```

```bash [bun]
mkdir my-yasui-api
cd my-yasui-api
bun init -y
bun add yasui
bun add -D typescript @types/node
```

```bash [deno]
mkdir my-yasui-api
cd my-yasui-api
deno init
deno add jsr:@yasui/yasui
```
:::

### Paso 2: Configurar TypeScript

Crea un archivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Paso 3: Crear Tu Primera API

Crea `app.ts`:

```typescript
import yasui, { Controller, Get } from 'yasui';

@Controller('/')
export class AppController {
  @Get('/')
  hello() {
    return { message: 'Hello World!' };
  }
}

yasui.createServer({
  controllers: [AppController]
});
```

### Paso 4: Ejecutar Tu API

Añade scripts a tu `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "tsc && node dist/app.js"
  }
}
```

Construye y ejecuta tu API:

::: code-group
```bash [npm]
npm run dev
```

```bash [pnpm]
pnpm dev
```

```bash [bun]
bun run dev
```

```bash [deno]
deno run --allow-net --allow-read app.ts
```
:::

Visita `http://localhost:3000` y verás:
```json
{ "message": "Hello World!" }
```

¡Felicitaciones! Tienes una API de YasuiJS funcionando.

## ¿Necesitas Ayuda?

Si encuentras algún problema:

1. Asegúrate de que tu `tsconfig.json` tenga `experimentalDecorators: true`
2. Verifica que estés usando la sintaxis de importación correcta
3. Confirma las versiones de TypeScript y Node.js
4. Revisa la salida de la consola para mensajes de error detallados