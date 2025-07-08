# Getting Started

This guide will get you up and running with your first API in just a few minutes.

## Prerequisites

Before we begin, make sure you have:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- Basic knowledge of **TypeScript**

You can check your Node.js version with:
```bash
node --version
```

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

## Examples

Check out the [complete examples](https://github.com/thomasbarkats/yasui/tree/main/src/examples) in the YasuiJS repository for more patterns and use cases.

## Need Help?

If you encounter any issues:

1. Make sure your `tsconfig.json` has `experimentalDecorators: true`
2. Check that you're using the correct import syntax
3. Verify your TypeScript and Node.js versions
4. Look at the console output for detailed error messages
