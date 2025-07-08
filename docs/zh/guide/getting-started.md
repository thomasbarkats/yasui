# 入门指南

本指南将帮助您在几分钟内创建并运行您的第一个API。

## 前提条件

在开始之前，请确保您已准备好：

- **Node.js**（版本18或更高）- [在此下载](https://nodejs.org/)
- **npm**或**yarn**包管理器
- **TypeScript**的基础知识

您可以使用以下命令检查您的Node.js版本：
```bash
node --version
```

## 快速开始

让我们通过3个简单的步骤创建您的第一个YasuiJS API。

### 步骤1：安装YasuiJS

创建一个新目录并安装YasuiJS：

```bash
mkdir my-yasui-api
cd my-yasui-api
npm init -y
npm install yasui
npm install -D typescript @types/node
```

### 步骤2：配置TypeScript

创建一个`tsconfig.json`文件：

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

### 步骤3：创建您的第一个API

创建`app.ts`：

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

### 步骤4：运行您的API

在您的`package.json`中添加脚本：

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "tsc && node dist/app.js"
  }
}
```

构建并运行您的API：

```bash
npm run dev
```

访问`http://localhost:3000`，您将看到：
```json
{ "message": "Hello World!" }
```

恭喜！您已经拥有了一个可工作的YasuiJS API。

## 示例

查看YasuiJS仓库中的[完整示例](https://github.com/thomasbarkats/yasui/tree/main/src/examples)，了解更多模式和用例。

## 需要帮助？

如果您遇到任何问题：

1. 确保您的`tsconfig.json`中设置了`experimentalDecorators: true`
2. 检查您是否使用了正确的导入语法
3. 验证您的TypeScript和Node.js版本
4. 查看控制台输出以获取详细的错误信息
