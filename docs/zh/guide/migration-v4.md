# 迁移指南：v3.x 到 v4.x

本指南帮助您从 YasuiJS 3.x（基于 Express）迁移到 YasuiJS 4.x（使用 [SRVX](https://srvx.h3.dev) 的 Web 标准）。

## 变更概览

YasuiJS 4.x 代表了一次重大的架构转变：

- **移除 Express 依赖** - 现在使用 Web 标准
- **createServer()** - 使用 [srvx](https://srvx.h3.dev) 支持 Node.js、Deno 和 Bun
- **createApp()** - 返回适用于任何 Web 标准平台的标准 fetch 处理器
- **边缘就绪** - 部署到 Cloudflare Workers、Vercel Edge、Netlify Edge、Deno Deploy（通过 createApp）
- **无服务器兼容** - 与 AWS Lambda、Vercel Functions、Netlify Functions 兼容（通过 createApp）
- **破坏性变更** - Express 中间件不再兼容
- **新功能** - TLS/HTTPS 支持，Node.js 上的 HTTP/2

## 破坏性变更

### 1. Express 中间件不兼容

**之前（v3.x）：**
```typescript
import cors from 'cors';
import helmet from 'helmet';

yasui.createServer({
  middlewares: [cors(), helmet()]
});
```

**之后（v4.x）：**
Express 中间件**不兼容**。您必须：
1. 寻找与 Web 标准兼容的替代方案
2. 编写原生 YasuiJS 中间件

```typescript
@Middleware()
export class CorsMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const response = await next();

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

yasui.createServer({
  middlewares: [CorsMiddleware]
});
```

### 2. 不再支持 Response 对象

`@Res()` 已**移除** - 不再支持。

**之前（v3.x）：**
```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Res() res: Response) {
    if (!req.headers.authorization) {
      // 抛出错误或返回 Response 对象
      throw new HttpError(401, 'Unauthorized');
    }
  }
}
```

**之后（v4.x）：**
```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request) {
    if (!req.rawHeaders.get('authorization')) {
      // 抛出错误或返回 Response 对象
      throw new HttpError(401, 'Unauthorized');
    }
    // 如果返回 nothing/void，将继续到下一个中间件或控制器
  }
}
```

### 3. Request 对象变更

`@Req()` 提供 Web 标准的 Request 对象，而不是 Express；只有一些属性保持兼容。

**Express 兼容属性**（仍然可用）：
- `req.path` - 不包含查询字符串的路径名
- `req.hostname` - 不包含端口的主机名
- `req.protocol` - "http" 或 "https"
- `req.ip` - 客户端 IP 地址
- `req.query` - 解析的查询对象
- `req.cookies` - 解析的 cookies 对象
- `req.body` - 解析的请求体
- `req.headers` - 返回用于属性访问的普通对象

**之后（v4.x）：**
```typescript
@Get('/users')
getUsers(@Req() req: Request) {
  // 通过原生 Headers 对象的 .get() 获取头部
  const auth = req.rawHeaders.get('authorization');

  // Express 兼容属性仍然有效
  const auth = req.headers.authorization;
  const page = req.query.page;
  const path = req.path;
}
```

### 4. 自定义响应处理变更

**之前（v3.x）：**
```typescript
@Get('/custom')
customResponse(@Res() res: Response) {
  res.status(418).json({ message: "I'm a teapot" });
}
```

**之后（v4.x）：**
```typescript
@Get('/custom')
customResponse() {
  // 选项 1：返回 Web 标准 Response
  return new Response(JSON.stringify({ message: "I'm a teapot" }), {
    status: 418,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 5. createApp() 返回类型

**之前（v3.x）：**
```typescript
import express from 'express';

const app = yasui.createApp({ controllers: [UserController] });
// app 是 Express Application

app.use(express.json());
app.listen(3000);
```

**之后（v4.x）：**
```typescript
import { serve } from 'srvx';

const app = yasui.createApp({ controllers: [UserController] });
// app 是 FetchHandler { fetch: Function }

serve({
  fetch: app.fetch,
  port: 3000
});
```

### 6. 配置变更

**之前（v3.x）：**
```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [cors(), helmet()],
  protocol: 'http',
  port: 3000
});
```

**之后（v4.x）：**
```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [CorsMiddleware],  // 仅 YasuiJS 中间件
  port: 3000,
  tls: {  // 新增：TLS/HTTPS 支持
    cert: './cert.pem',
    key: './key.pem'
  },
  runtimeOptions: {  // 新增：运行时特定选项
    node: {
      http2: true
    }
  }
});
```

**新选项：**
- `tls` - TLS/HTTPS 配置
- `hostname` - 服务器主机名
- `runtimeOptions` - 运行时特定配置

**已弃用：**
- `protocol` - 由 `tls` 配置自动确定

## 迁移步骤

### 步骤 1：更新依赖

```bash
npm install yasui@latest
# 或
pnpm update yasui
```

**Swagger UI 更改：**

YasuiJS v4 默认从 CDN 提供 Swagger UI 资源 - **无需额外的包**。

如果您在 v3 中使用 `swagger-ui-express`：

```bash
npm uninstall swagger-ui-express
# 或
pnpm remove swagger-ui-express
```

**无需更改代码** - Swagger UI 开箱即用，无需配置。CDN 方式还使 Swagger UI 能够在所有运行时（包括边缘环境）上工作。

### 步骤 2：移除 Express 中间件

识别代码库中的所有 Express 中间件：

```typescript
// 移除这些
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

yasui.createServer({
  middlewares: [cors(), helmet(), morgan('dev')]  // ❌ 不再有效
});
```

### 步骤 3：替换为原生中间件

为每个功能编写 YasuiJS 中间件：

```typescript
// 创建原生 CORS 中间件
@Middleware()
export class CorsMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  }
}

yasui.createServer({
  middlewares: [CorsMiddleware]  // ✅ 有效
});
```

### 步骤 4：更新中间件签名

从所有中间件中移除 `@Res()` 的使用：抛出新的 HttpError 来处理错误状态，或返回值。

记住：中间件的工作方式类似于控制器方法。除非您想修改响应，否则不需要调用 `next()`。

### 步骤 6：更新手动响应处理

用 Web 标准替换 Express 响应方法：

**之前：**
```typescript
@Get('/file')
downloadFile(@Res() res: Response) {
  res.sendFile('/path/to/file.pdf');
}

@Get('/redirect')
redirect(@Res() res: Response) {
  res.redirect('/new-location');
}
```

**之后：**
```typescript
@Get('/file')
async downloadFile() {
  const file = await Deno.readFile('/path/to/file.pdf'); // 或 fs.readFile
  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="file.pdf"'
    }
  });
}

@Get('/redirect')
redirect() {
  return new Response(null, {
    status: 302,
    headers: { 'Location': '/new-location' }
  });
}
```

### 步骤 7：更新 createApp() 使用

如果您使用 `createApp()` 进行自定义服务器设置：

**之前：**
```typescript
const app = yasui.createApp({ controllers: [UserController] });

app.use(express.static('public'));
app.listen(3000);
```

**之后：**
```typescript
import { serve } from 'srvx';

const app = yasui.createApp({ controllers: [UserController] });

serve({
  fetch: app.fetch,
  port: 3000,
  static: {  // srvx 静态文件服务
    '/': './public'
  }
});
```

### 步骤 8：测试您的应用程序

1. 启动您的服务器
2. 测试所有端点
3. 验证中间件行为
4. 检查错误处理
5. 使用不同运行时测试（Node.js、Deno、Bun）

## v4.x 中的新功能

### TLS/HTTPS 支持

```typescript
yasui.createServer({
  controllers: [UserController],
  port: 443,
  tls: {
    cert: './certs/cert.pem',
    key: './certs/key.pem',
    passphrase: 'optional'
  }
});
```

### HTTP/2 支持（Node.js）

```typescript
yasui.createServer({
  controllers: [UserController],
  tls: {
    cert: './cert.pem',
    key: './key.pem'
  },
  runtimeOptions: {
    node: {
      http2: true  // 使用 TLS 时默认启用
    }
  }
});
```

### 多运行时和边缘部署

相同代码可在各种运行时和平台上工作：

```typescript
// 传统运行时
// 在 Node.js、Deno 和 Bun 上工作
yasui.createServer({
  controllers: [UserController],
  port: 3000
});

// 边缘运行时 - 使用 createApp()
const app = yasui.createApp({
  controllers: [UserController]
});

// Cloudflare Workers
export default {
  fetch: app.fetch
};

// Vercel Edge Functions
export const GET = app.fetch;
export const POST = app.fetch;

// Deno Deploy
Deno.serve(app.fetch);

// Netlify Edge Functions
export default app.fetch;
```

### 随处部署

由于 YasuiJS 返回标准的 fetch 处理器，您可以部署到：
- **传统服务器**：Node.js、Deno、Bun
- **边缘运行时**：Cloudflare Workers、Vercel Edge、Netlify Edge、Deno Deploy
- **无服务器**：AWS Lambda（使用适配器）、Vercel Functions、Netlify Functions
- **任何支持** Web 标准 fetch 处理器的平台

## 获取帮助

如果您在迁移过程中遇到问题：

1. 查看[文档](/zh/reference/config)
2. 查看[示例](https://github.com/thomasbarkats/yasui/tree/main/src/example)
3. 在 [GitHub](https://github.com/thomasbarkats/yasui/issues) 上提出问题