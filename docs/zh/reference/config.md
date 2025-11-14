# 配置

使用 `yasui.createServer()` 和 `yasui.createApp()` 的 YasuiJS 应用程序完整配置参考。

## 概述

YasuiJS 提供两种主要方式来创建您的应用程序：

- **`yasui.createServer(config)`** - 自动创建并启动服务器
- **`yasui.createApp(config)`** - 返回用于手动服务器配置的 fetch 处理器

两种方法都接受相同的配置对象，包含以下选项。

## 配置选项

### 必需选项

#### `controllers`
**类型：** `Array<Constructor>`  
**描述：** 要在应用程序中注册的控制器类数组。

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController, ProductController]
});
```

### 可选选项

#### `middlewares`
应用于所有请求的全局中间件数组。必须是使用 `@Middleware()` 装饰的 YasuiJS 中间件类。
- **类型：** `Array<Constructor>`
- **默认值：** `[]`
- **示例值：** `[LoggingMiddleware, AuthMiddleware]`
- **注意：** Express 中间件（如 `cors()`、`helmet()`）与 YasuiJS 4.x 不兼容

#### `globalPipes`
应用于所有路由参数的全局管道数组。详情请参见[管道](/zh/reference/pipes)。  
- **类型：** `Array<Constructor<IPipeTransform>>`
- **默认值：** `[]`
- **示例值：** `[ValidationPipe, TrimPipe]`

#### `environment`
应用程序的环境名称。
- **类型：** `string`
- **默认值：** `process.env.NODE_ENV || 'development'`
- **示例值：** `production`

#### `port`
服务器端口号。仅在 `createServer()` 中使用。
- **类型：** `number | string`
- **默认值：** `3000`

#### `hostname`
服务器绑定的主机名。
- **类型：** `string | undefined`
- **默认值：** 开发环境中为 `'localhost'`，生产环境中为 undefined

#### `tls`
TLS/HTTPS 配置。提供时，服务器自动使用 HTTPS。
- **类型：** `TLSConfig | undefined`
- **默认值：** `undefined`（HTTP）
- **示例值：**
```typescript
{
  cert: './path/to/cert.pem',  // 或 PEM 字符串
  key: './path/to/key.pem',    // 或 PEM 字符串
  passphrase: 'optional',      // 可选密钥密码
  ca: './path/to/ca.pem'       // 可选 CA 证书
}
```

#### `runtimeOptions`
运行时特定的配置选项。
- **类型：** `RuntimeOptions | undefined`
- **默认值：** `undefined`
- **示例值：**
```typescript
{
  node: {
    http2: true,              // 启用 HTTP/2（默认：使用 TLS 时为 true）
    maxHeaderSize: 16384,     // 自定义头部大小
    ipv6Only: false           // 仅 IPv6 模式
  }
}
```

#### `debug`
启用调试模式，包含额外的日志记录和请求跟踪。
- **类型：** `boolean`
- **默认值：** `false`

#### `injections`
依赖注入的自定义注入令牌。详情请参见[依赖注入](/zh/reference/dependency-injection)。
- **类型：** `Array<Injection>`
- **默认值：** `[]`

其中 `Injection` 是：
```typescript
{ token: string; provide: any } | // 直接值
{ token: string; factory: () => Promise<any>; deferred?: boolean } // 工厂函数
```

- **示例值：**
```typescript
[
  // 直接值
  { token: 'CONFIG', provide: 'value' },

  // 异步工厂函数（在服务器启动前构建）
  {
    token: 'DATABASE',
    factory: async () => {
      const db = new Database();
      await db.connect();
      return db;
    }
  },
  // 非阻塞工厂函数（服务器启动时不等待它并接受错误）
  {
    token: 'ANALYTICS',
    deferred: true,
    factory: async () => {
      const analytics = new AnalyticsClient();
      await analytics.connect();
      return analytics;
    },
  }
]
```

#### `swagger`
Swagger 文档配置。详情请参见 [Swagger](/zh/reference/swagger)。
- **类型：** `SwaggerConfig | undefined`
- **默认值：** `undefined`
- **示例值：**
```typescript
{
  enabled: true,
  path: '/api-docs',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation'
  }
}
```

#### `enableDecoratorValidation`
启用启动时装饰器验证以捕获配置错误。
- **类型：** `boolean`
- **默认值：** `true`

## createServer() vs createApp()

### createServer()

创建服务器并自动开始监听：

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController],
  port: 3000,
  debug: true
});
```

**适用场景：**
- 您想立即启动服务器
- 您正在构建标准 API
- 您不需要自定义服务器配置

### createApp()

返回与任何基于 Web 标准的服务器或平台兼容的 fetch 处理器：

```typescript
import yasui from 'yasui';

const app = yasui.createApp({
  controllers: [UserController]
});

// app.fetch 是标准的 fetch 处理器 - 可与任何兼容的服务器一起使用

// 选项 1：SRVX（多运行时）
import { serve } from 'srvx';
serve({
  fetch: app.fetch,
  port: 3000
});

// 选项 2：原生 Deno
Deno.serve({ port: 3000 }, app.fetch);

// 选项 3：原生 Bun
Bun.serve({
  port: 3000,
  fetch: app.fetch
});

// 选项 4：Cloudflare Workers
export default {
  fetch: app.fetch
};

// 选项 5：Vercel Edge Functions
export const GET = app.fetch;
export const POST = app.fetch;

// 选项 6：Node.js http 服务器
import { createServer } from 'http';
createServer(async (req, res) => {
  const response = await app.fetch(req);
  // 将 Response 转换为 Node.js response
});
```

**适用场景：**
- 您需要自定义服务器配置
- 您想要更多服务器启动控制
- 您正在部署到边缘运行时（Cloudflare Workers、Vercel Edge、Netlify Edge、Deno Deploy）
- 您正在部署到无服务器平台
- 您正在集成平台特定功能

## 配置示例

### 基本 API 设置

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  port: 3000,
  debug: true
});
```

### 带 HTTPS 的完整配置

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  middlewares: [LoggingMiddleware, AuthMiddleware],
  globalPipes: [ValidationPipe, TrimPipe],
  port: 443,
  hostname: 'api.example.com',
  tls: {
    cert: './certs/cert.pem',
    key: './certs/key.pem',
    passphrase: 'optional-passphrase'
  },
  runtimeOptions: {
    node: {
      http2: true,
      maxHeaderSize: 16384
    }
  },
  debug: false,
  environment: 'production',
  enableDecoratorValidation: true,
  injections: [
    { token: 'DATABASE_URL', provide: process.env.DATABASE_URL },
    { token: 'JWT_SECRET', provide: process.env.JWT_SECRET }
  ],
  swagger: {
    generate: true,
    path: '/api-docs',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Complete API with all features'
    }
  }
});
```

### 多运行时配置

相同的配置在 Node.js、Deno 和 Bun 中都有效：

```typescript
// 在 Node.js、Deno 和 Bun 中都有效
yasui.createServer({
  controllers: [UserController],
  port: 3000,
  middlewares: [CorsMiddleware], // 使用原生 YasuiJS 中间件
  debug: true
});
```

### 边缘运行时部署

对于边缘运行时，使用 `createApp()` 获取标准 fetch 处理器：

```typescript
const app = yasui.createApp({
  controllers: [UserController],
  middlewares: [CorsMiddleware]
});

// 部署到 Cloudflare Workers
export default { fetch: app.fetch };

// 部署到 Vercel Edge
export const GET = app.fetch;
export const POST = app.fetch;

// 部署到 Deno Deploy
Deno.serve(app.fetch);
```

## 调试模式

启用调试模式以查看详细信息：

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true
});
```

调试模式提供：
- 请求/响应日志记录
- 依赖注入详情
- 路由注册信息
- 错误堆栈跟踪