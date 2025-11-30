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
- **默认值：** `undefined`
- **示例值：** `production`

#### `port`
服务器端口号。仅在 `createServer()` 中使用。
- **类型：** `number | string`
- **默认值：** `3000`

#### `hostname`
服务器绑定的主机名。
- **类型：** `string | undefined`
- **默认值：** 开发环境中为 `'localhost'`，生产环境中为 undefined

#### `maxBodySize`
请求体的最大字节大小。超过此限制的请求将被拒绝并返回 413 Payload Too Large。
- **类型：** `number`
- **默认值：** `10485760`（10MB）
- **注意：** 这是应用程序级别的检查，适用于所有运行时（Node.js、Deno、Bun）

#### `maxHeaderSize`
请求头的最大总字节大小。超过此限制的请求将被拒绝并返回 413 Payload Too Large。
- **类型：** `number`
- **默认值：** `16384`（16KB）
- **注意：** 这是应用程序级别的检查，适用于所有运行时。

#### `tls`
TLS/HTTPS 配置。提供时，服务器自动使用 HTTPS。类型从 **srvx** 提取。
- **类型：** `TLSConfig | undefined`
- **默认值：** `undefined`（HTTP）
- **示例值：**
```typescript
{
  cert: './path/to/cert.pem',  // 或 PEM 字符串
  key: './path/to/key.pem',    // 或 PEM 字符串
  passphrase: 'optional'       // 可选密钥密码
}
```

#### `runtimeOptions`
运行时特定的服务器配置选项。这些选项直接传递给底层服务器（[srvx](https://srvx.h3.dev)），然后传递给相应的运行时。类型从 srvx 的 `ServerOptions` 提取以确保类型安全。
- **类型：** `RuntimeOptions | undefined`
- **默认值：** `undefined`
- **支持的运行时：** `node`、`bun`、`deno`、`serviceWorker`

**各运行时可用选项：**

- **`node`**：接受所有 [Node.js HTTP ServerOptions](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener)、[HTTPS ServerOptions](https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener)、[HTTP/2 ServerOptions](https://nodejs.org/api/http2.html#http2createsecureserveroptions-onrequesthandler) 和 [ListenOptions](https://nodejs.org/api/net.html#serverlistenoptions-callback)，以及：
  - `http2?: boolean` - 启用 HTTP/2（默认：使用 TLS 时为 true）

- **`bun`**：接受所有 [Bun.Serve.Options](https://bun.sh/docs/api/http)（除了 `fetch`）

- **`deno`**：接受所有 [Deno.ServeOptions](https://docs.deno.com/api/deno/~/Deno.ServeOptions)

- **`serviceWorker`**：接受 service worker 配置（参见 [srvx 文档](https://srvx.h3.dev/guide/options)）

**示例：**
```typescript
yasui.createServer({
  controllers: [UserController],
  runtimeOptions: {
    node: {
      http2: true,
      maxHeadersize: 16384,
      ipv6Only: false
    }
  }
});
```

**注意：** 要在所有运行时中实现一致的头部/请求体大小限制，请使用根级别的 `maxHeaderSize` 和 `maxBodySize` 选项。运行时特定选项在支持的情况下提供额外的深度防御。

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
  { token: 'API_KEY', provide: 'value' },

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

#### `strictValidation`
启用类型转换和 JSON 解析的严格验证。启用后，抛出 `HttpError(400)` 而不是返回无效值（NaN、Invalid Date、null）或 undefined body。
- **类型：** `boolean`
- **默认值：** `false`
- **参见：** [严格验证模式](/reference/controllers#严格验证模式) 获取详细行为和示例

#### `requestTimeout`
请求的最大持续时间（毫秒）。超过此持续时间的请求将以 408 Request Timeout 终止。
- **类型：** `number`
- **默认值：** `30000`（30秒）
- **注意：** 防止长时间运行的请求耗尽服务器资源。设置为 `0` 可禁用超时。

#### `compression`
根据客户端的 `Accept-Encoding` 头启用响应的自动 gzip 压缩。
- **类型：** `boolean`
- **默认值：** `false`
- **行为：**
  - 仅当客户端发送 `Accept-Encoding: gzip` 头时压缩
  - 仅压缩基于文本的内容类型（JSON、HTML、CSS、JavaScript、XML）
  - 跳过二进制格式的压缩（图像、视频、存档文件）
  - 浏览器和 HTTP 客户端（curl、Postman、fetch）会自动解压响应
- **示例：**
```typescript
yasui.createServer({
  controllers: [UserController],
  compression: true  // 启用 gzip 压缩
});
```
- **注意：** 使用 Web 标准 `CompressionStream` API（Node.js 18+、Deno、Bun）。为 JSON/文本响应提供 70%+ 的带宽减少，CPU 开销极小。

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

## 环境变量

YasuiJS 提供对环境变量的访问，该访问与运行时无关。使用它而不是 `process.env` 以确保在 Node.js、Deno 和 Bun 中的兼容性。

- `getEnv(name: string, fallback?: string): string` - 读取环境变量，带可选的后备值

```typescript
import { getEnv, Injectable } from 'yasui';

@Injectable()
export class DatabaseService {
  private readonly dbUrl = getEnv('DATABASE_URL', 'localhost');
  private readonly port = getEnv('DB_PORT', '5432');

  connect() {
    console.log(`连接到 ${this.dbUrl}:${this.port}`);
  }
}
```
