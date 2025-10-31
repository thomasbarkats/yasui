# 快速开始

本指南将帮助您在几分钟内启动并运行您的第一个 API。

## 前置条件

在开始之前，请确保您拥有：

- **Node.js**（版本 18 或更高）、**Deno** 或 **Bun** - YasuiJS 适用于所有运行时
- **npm**、**pnpm**、**yarn** 或您首选的包管理器
- **TypeScript** 的基础知识

您可以使用以下命令检查运行时版本：
```bash
node --version  # Node.js
deno --version  # Deno
bun --version   # Bun
```

本指南使用 Node.js，但相同的代码也适用于：
- 传统运行时：Node.js、Deno、Bun
- 边缘运行时：Cloudflare Workers、Vercel Edge、Netlify Edge、Deno Deploy
- 无服务器：AWS Lambda、Vercel Functions、Netlify Functions

## 快速开始

让我们通过 3 个简单步骤创建您的第一个 YasuiJS API。

### 步骤 1：安装 YasuiJS

创建一个新目录并安装 YasuiJS：

```bash
mkdir my-yasui-api
cd my-yasui-api
npm init -y
npm install yasui
npm install -D typescript @types/node
```

### 步骤 2：配置 TypeScript

创建 `tsconfig.json` 文件：

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

### 步骤 3：创建您的第一个 API

创建 `app.ts`：

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

### 步骤 4：运行您的 API

在您的 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "tsc && node dist/app.js"
  }
}
```

构建并运行您的 API：

```bash
npm run dev
```

访问 `http://localhost:3000`，您将看到：
```json
{ "message": "Hello World!" }
```

恭喜！您已经拥有了一个可运行的 YasuiJS API。

## 需要帮助？

如果您遇到任何问题：

1. 确保您的 `tsconfig.json` 中有 `experimentalDecorators: true`
2. 检查您使用的导入语法是否正确
3. 验证您的 TypeScript 和 Node.js 版本
4. 查看控制台输出以获取详细的错误信息