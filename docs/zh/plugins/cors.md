# CORS

用于 YasuiJS 应用程序的生产就绪 CORS（跨源资源共享）中间件。处理预检请求、源验证、凭据和现代安全功能。

## 安装

::: code-group
```bash [npm]
npm install @yasui/cors
```

```bash [pnpm]
pnpm add @yasui/cors
```

```bash [bun]
bun add @yasui/cors
```

```bash [deno]
deno add jsr:@yasui/cors
```
:::

## 概述

`@yasui/cors` 包提供符合标准的 CORS 中间件，具有高级功能包括：

- **源验证** - 精确匹配、通配符或正则表达式模式
- **预检处理** - 自动处理 OPTIONS 请求
- **凭据支持** - 处理 Cookie 和授权标头
- **缓存优化** - 正确的 `Vary` 标头管理
- **Private Network Access** - 支持 CORS-RFC1918 规范
- **安全优先** - 行业标准默认值和验证

**重要提示**：这是一个函数式中间件（不是基于类的）。它与 YasuiJS 类中间件一起工作，应在全局 `middlewares` 数组中注册。

## 快速开始

### 基本用法

```typescript
import yasui from 'yasui';
import { cors } from '@yasui/cors';

yasui.createServer({
  middlewares: [
    cors({
      origins: ['https://app.example.com', 'https://admin.example.com']
    })
  ],
  controllers: [UserController]
});
```

### 通配符（仅开发环境）

```typescript
import { cors } from '@yasui/cors';

yasui.createServer({
  middlewares: [
    cors({
      origins: '*'  // ⚠️ 不建议在生产环境中使用
    })
  ],
  controllers: [UserController]
});
```

**警告**：不建议在生产环境中使用 `origins: '*'`。始终指定精确的源或使用正则表达式模式以获得更好的安全性。

## 配置

`cors()` 函数接受一个配置对象，具有以下选项：

### `origins`（必需）

跨源请求允许的源。可以是通配符、精确源数组或包含正则表达式模式的数组。

- **类型**：`string[] | RegExp[] | (string | RegExp)[] | '*'`
- **必需**：是
- **示例**：

```typescript
// 精确源
cors({
  origins: ['https://app.example.com', 'https://admin.example.com']
})

// 通配符（仅开发环境）
cors({
  origins: '*'
})

// 用于动态子域的正则表达式模式
cors({
  origins: [
    'https://app.example.com',
    /^https:\/\/.*\.example\.com$/  // 匹配任何子域
  ]
})
```

### `methods`

跨源请求中允许的 HTTP 方法。

- **类型**：`string`
- **默认值**：`'GET,POST,PUT,DELETE,PATCH,OPTIONS'`
- **示例**：

```typescript
cors({
  origins: ['https://app.example.com'],
  methods: 'GET,POST,DELETE'
})
```

### `headers`

跨源请求中允许的请求标头。

- **类型**：`string`
- **默认值**：`'Content-Type,Authorization'`
- **示例**：

```typescript
cors({
  origins: ['https://app.example.com'],
  headers: 'Content-Type,Authorization,X-API-Key'
})
```

### `credentials`

允许在跨源请求中使用凭据（Cookie、授权标头）。

- **类型**：`boolean`
- **默认值**：`false`
- **重要提示**：不能与 `origins: '*'` 一起使用（启动时将抛出错误）

```typescript
cors({
  origins: ['https://app.example.com'],  // 必须指定精确源
  credentials: true
})
```

**安全说明**：当 `credentials: true` 时，浏览器需要在 `Access-Control-Allow-Origin` 标头中使用精确的源。中间件在启动时强制执行此操作，如果您尝试将通配符与凭据一起使用，将抛出错误。

### `maxAge`

预检响应缓存持续时间（以秒为单位）。确定浏览器缓存预检响应的时间。

- **类型**：`number`
- **默认值**：`86400`（24 小时）
- **示例**：

```typescript
cors({
  origins: ['https://app.example.com'],
  maxAge: 3600  // 1 小时
})
```

### `exposeHeaders`

暴露给客户端的响应标头（可通过 JavaScript 访问）。

- **类型**：`string`
- **默认值**：`undefined`
- **示例**：

```typescript
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: 'X-Total-Count,X-Page-Number'
})
```

**用法**：默认情况下，浏览器仅暴露安全标头（如 `Content-Type`）。使用此选项将自定义标头暴露给客户端 JavaScript。

### `allowNullOrigin`

允许具有 `null` 源的请求（file://、沙盒 iframe、隐私保护上下文）。

- **类型**：`boolean`
- **默认值**：`false`
- **示例**：

```typescript
cors({
  origins: ['https://app.example.com'],
  allowNullOrigin: true  // 允许 file:// 和沙盒上下文
})
```

**使用场景**：
- 从本地 HTML 文件测试（`file://` 协议）
- 沙盒 iframe（`<iframe sandbox>`）
- 隐私保护浏览器功能

### `allowPrivateNetwork`

启用 Private Network Access 支持（CORS-RFC1918），用于从公共网络到私有/本地网络的请求。

- **类型**：`boolean`
- **默认值**：`false`
- **示例**：

```typescript
cors({
  origins: ['https://app.example.com'],
  allowPrivateNetwork: true
})
```

**使用场景**：允许 Web 应用程序访问本地网络资源（例如 `http://192.168.1.100`），当浏览器通过 `Access-Control-Request-Private-Network` 预检标头请求时。

**安全说明**：仅当预检请求明确包含 `Access-Control-Request-Private-Network: true` 时，中间件才会发送 `Access-Control-Allow-Private-Network: true`，遵循 CORS-RFC1918 规范。

## 工作原理

### 预检请求

当浏览器使用自定义标头或方法进行跨源请求时，它首先发送预检 `OPTIONS` 请求：

```http
OPTIONS /api/users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type,authorization
```

CORS 中间件拦截此请求并响应：

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Max-Age: 86400
Vary: Origin
```

### 实际请求

对于实际请求，中间件将 CORS 标头添加到响应中：

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
Vary: Origin
Content-Type: application/json

{"data": [...]}
```

### 源拒绝

当不允许某个源时，中间件：
1. **预检（OPTIONS）**：返回 `204 No Content`，不带 CORS 标头（行业标准）
2. **实际请求**：不添加 CORS 标头直接通过

然后浏览器阻止响应，防止 JavaScript 访问。

**为什么是 204 而不是 403？** 返回 204 而不带 CORS 标头是行业标准（Express、Fastify 等使用），因为它避免泄露有关端点是否存在的信息。

### 缓存管理

中间件自动管理 `Vary: Origin` 标头：

- **当 `origins: '*'` 且没有凭据时**：没有 `Vary` 标头（所有源的响应相同）
- **当使用源列表或凭据时**：添加 `Vary: Origin` 标头
- **当存在现有 `Vary` 标头时**：将 `Origin` 与现有值合并（例如 `Vary: Accept-Encoding, Origin`）

这确保 CDN 和浏览器正确缓存 CORS 响应。

## 安全最佳实践

### 1. 切勿将通配符与凭据一起使用

```typescript
// ❌ 错误 - 启动时将抛出错误
cors({
  origins: '*',
  credentials: true  // 错误：不能将凭据与通配符一起使用
})

// ✅ 正确
cors({
  origins: ['https://app.example.com'],
  credentials: true
})
```

### 2. 严格验证源

```typescript
// ❌ 有风险 - 过于宽松
cors({
  origins: '*'
})

// ✅ 更好 - 显式源
cors({
  origins: ['https://app.example.com']
})

// ✅ 良好 - 用于受控通配符的正则表达式
cors({
  origins: [/^https:\/\/[a-z0-9-]+\.example\.com$/]
})
```

### 3. 最小化暴露的标头

```typescript
// ❌ 有风险 - 暴露所有标头
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: '*'  // 不推荐
})

// ✅ 良好 - 仅暴露必要的标头
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: 'X-Total-Count,X-Page-Number'
})
```

### 4. 使用基于环境的配置

```typescript
// ✅ 良好 - 开发/生产的不同配置
const corsConfig = {
  origins: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000'],
  credentials: true
};

yasui.createServer({
  middlewares: [cors(corsConfig)],
  controllers: [UserController]
});
```

## 技术细节

**重要提示**：必须在全局 `middlewares` 数组中注册 CORS 中间件以拦截 OPTIONS 请求：

```typescript
yasui.createServer({
  middlewares: [cors({ origins: [...] })],  // ✅ 全局注册
  controllers: [UserController]
});
```

如果预检请求收到 404，请验证中间件是否在应用程序级别注册，而不是在控制器或路由级别。

### 启动验证

中间件在应用程序启动时验证配置（而不是每个请求）：
- ❌ 如果 `credentials: true` 与 `origins: '*'` 一起使用，则抛出错误

### 标头合并

在将 CORS 标头注入响应时：
- 保留现有响应标头
- 智能合并 `Vary` 标头（不会覆盖 `Vary: Accept-Encoding`）
- 对 CORS 标头使用 `Headers.set()`（不区分大小写）

### 性能优化

- 源验证使用 `Array.some()`（在第一个匹配时停止）
- 正则表达式模式在中间件创建时编译一次
- OPTIONS 请求不解析 body（立即响应）

### 合规性

- **CORS 规范**：完全符合 W3C CORS 规范
- **RFC1918**：Private Network Access 支持
- **行业标准**：遵循 Express/Fastify 模式（拒绝的预检返回 204）

## 另请参阅

- [中间件参考](/zh/reference/middlewares) - 了解 YasuiJS 中间件系统
- [配置](/zh/reference/config) - 应用程序级别配置
- [错误处理](/zh/reference/error-handling) - 正确处理 CORS 错误
