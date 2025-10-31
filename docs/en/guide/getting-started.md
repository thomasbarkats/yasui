# Getting Started

This guide will get you up and running with your first API in just a few minutes.

## Prerequisites

Before we begin, make sure you have:

- **Node.js** (version 18 or higher), **Deno**, or **Bun** - YasuiJS works on all runtimes
- **npm**, **pnpm**, **yarn**, or your preferred package manager
- Basic knowledge of **TypeScript**

You can check your runtime version with:
```bash
node --version  # Node.js
deno --version  # Deno
bun --version   # Bun
```

This guide uses Node.js, but the same code works on:
- Traditional runtimes: Node.js, Deno, Bun
- Edge runtimes: Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy
- Serverless: AWS Lambda, Vercel Functions, Netlify Functions

## Quick Start

Let's create your first YasuiJS API in 3 simple steps.

### Step 1: Install YasuiJS

Create a new directory and install YasuiJS:

```bash
mkdir my-yasui-api
cd my-yasui-api
npm init -y
npm install yasui
npm install -D typescript @types/node
```

### Step 2: Configure TypeScript

Create a `tsconfig.json` file:

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

### Step 3: Create Your First API

Create `app.ts`:

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

### Step 4: Run Your API

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "tsc && node dist/app.js"
  }
}
```

Build and run your API:

```bash
npm run dev
```

Visit `http://localhost:3000` and you'll see:
```json
{ "message": "Hello World!" }
```

Congratulations! You have a working YasuiJS API.

## Need Help?

If you encounter any issues:

1. Make sure your `tsconfig.json` has `experimentalDecorators: true`
2. Check that you're using the correct import syntax
3. Verify your TypeScript and Node.js versions
4. Look at the console output for detailed error messages
