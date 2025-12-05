# Rate Limiting

用于 YasuiJS 应用程序的生产就绪速率限制中间件。通过限制每个时间窗口的请求数量来保护您的 API 免受滥用,支持自定义存储后端和灵活的密钥生成。

## 安装

::: code-group
```bash [npm]
npm install @yasui/rate-limit
```

```bash [pnpm]
pnpm add @yasui/rate-limit
```

```bash [bun]
bun add @yasui/rate-limit
```

```bash [deno]
deno add jsr:@yasui/rate-limit
```
:::

## 概述

`@yasui/rate-limit` 包提供了一个灵活的速率限制中间件,具有以下高级功能:

- **可配置限制** - 设置每个时间窗口的最大请求数
- **内存存储** - 内置存储,带自动清理功能
- **可扩展存储** - 支持 Redis、数据库或自定义存储
- **自定义密钥生成** - 按 IP、API 密钥、用户 ID 或自定义逻辑限制
- **标准头部** - 符合 RFC 6585 的速率限制头部
- **跳过逻辑** - 特定请求白名单
- **自定义处理器** - 覆盖默认 429 响应

**重要提示:** 这是一个函数式中间件(非基于类)。它与 YasuiJS 类中间件一起工作,应该在全局 `middlewares` 数组中注册。

## 快速开始

### 基本用法

```typescript
import yasui from 'yasui';
import { rateLimit } from '@yasui/rate-limit';

yasui.createServer({
  middlewares: [
    rateLimit({
      max: 100,       // 100 个请求
      windowMs: 60000 // 每分钟
    })
  ],
  controllers: [UserController]
});
```

### 按路由速率限制

```typescript
import { rateLimit } from '@yasui/rate-limit';

const strictLimit = rateLimit({ max: 10, windowMs: 60000 });
const normalLimit = rateLimit({ max: 100, windowMs: 60000 });

@Controller('/api')
export class ApiController {
  @Post('/login', strictLimit)
  login() {
    // 严格限制: 每分钟 10 个请求
  }

  @Get('/data', normalLimit)
  getData() {
    // 正常限制: 每分钟 100 个请求
  }
}
```

## 配置

`rateLimit()` 函数接受一个配置对象,包含以下选项:

### `max`

每个时间窗口允许的最大请求数。

- **类型:** `number`
- **默认值:** `100`

### `windowMs`

时间窗口持续时间(毫秒)。

- **类型:** `number`
- **默认值:** `60000` (1 分钟)

### `keyGenerator`

用于生成速率限制密钥的自定义函数。默认使用客户端 IP 地址。

- **类型:** `(req: YasuiRequest) => string`

```typescript
// 按 API 密钥限制
rateLimit({
  max: 1000,
  windowMs: 3600000,
  keyGenerator: (req) => {
    return req.rawHeaders.get('x-api-key') ?? 'anonymous';
  }
})
```

### `handler`

超出速率限制响应的自定义处理器。遵循 YasuiJS 模式:抛出 `HttpError`、返回数据(自动转换为 JSON)或返回 `Response` 用于自定义格式。

- **类型:** `(req: YasuiRequest, limit: number, remaining: number, resetTime: number) => Response | unknown | Promise<Response | unknown>`

```typescript
import { HttpError } from 'yasui';

// 抛出 HttpError(推荐用于 JSON 错误)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req, limit) => {
    throw new HttpError(429, '请求过多。请减慢速度。');
  }
})

// 返回对象(自动转换为 JSON,状态码 429)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req, limit, remaining, resetTime) => {
    return {
      error: '超出速率限制',
      limit,
      remaining,
      resetTime: Math.ceil(resetTime / 1000)
    };
  }
})

// 返回 Response 用于自定义格式(HTML、XML 等)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req) => {
    const acceptsHtml = req.rawHeaders.get('accept')?.includes('text/html');

    if (acceptsHtml) {
      return new Response(
        '<h1>请求过多</h1><p>请稍后重试。</p>',
        {
          status: 429,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    throw new HttpError(429, '超出速率限制');
  }
})
```

### `skip`

用于跳过特定请求速率限制的函数。

- **类型:** `(req: YasuiRequest) => boolean | Promise<boolean>`

```typescript
// 跳过内部请求
rateLimit({
  max: 100,
  windowMs: 60000,
  skip: (req) => {
    return req.rawHeaders.get('x-internal-request') === 'true';
  }
})
```

## 工作原理

### 请求跟踪

中间件使用滑动窗口算法跟踪请求:

1. **提取密钥:** 使用 `keyGenerator` 识别请求者(IP、API 密钥等)
2. **增加计数器:** 在配置的存储中存储请求时间戳
3. **检查限制:** 将请求计数与 `max` 进行比较
4. **允许或拒绝:** 如果超出则返回 429,否则继续

### 响应头部

当 `standardHeaders: true` 时,响应包括:

```http
HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1699564800
Content-Type: application/json
```

当超出速率限制时:

```http
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1699564800
Retry-After: 45
Content-Type: application/json

{"error":"Too Many Requests","message":"Rate limit exceeded. Try again in 45 seconds."}
```

## 安全最佳实践

### 1. 使用保守的限制

```typescript
// ✅ 合理
rateLimit({ max: 100, windowMs: 60000 })
```

### 2. 保护敏感端点

```typescript
const authLimit = rateLimit({ max: 5, windowMs: 15 * 60 * 1000 });

@Controller('/auth')
export class AuthController {
  @Post('/login', authLimit)
  login() {}
}
```

### 3. 验证密钥生成器输入

**默认行为:** 使用 `X-Forwarded-For` → `X-Real-IP` → 请求签名哈希。在反向代理后面,确保正确设置头部。

**注意:** 默认密钥生成器使用请求签名(User-Agent + Accept-Language)作为后备,以防止所有未知请求共享相同的速率限制。

### 4. 在生产环境中使用持久存储

```typescript
// ✅ 生产环境 - Redis 存储(持久化)
rateLimit({
  max: 100,
  windowMs: 60000,
  store: new RedisStore(redisClient, 60000)
})
```

## 技术细节

速率限制中间件可以应用于所有级别(应用程序、控制器、端点)。有关中间件使用级别和执行顺序的详细信息,请参阅[中间件参考](/zh/reference/middlewares)。

### 性能优化

- 高效过滤时间戳(仅保留有效条目)
- 双重清理策略:基于时间(每 60 秒)+ 基于大小(>10k 键)
- 超过最大大小时 LRU 驱逐(删除最旧的 20% 条目)
- 内存存储同步增量(无 await 开销)
- 注入头部而不克隆响应体

**内存安全:** 内存存储限制为最多 10,000 个键,带自动 LRU 驱逐。对于高流量生产环境(>10k 唯一 IP/小时),请使用 Redis 存储。

### 合规性

- **RFC 6585:** 429 Too Many Requests 状态码
- **Draft RFC:** RateLimit-* 头部(IETF 草案标准)
- **行业标准:** Retry-After 头部用于客户端重试逻辑

## 另请参阅

- [中间件参考](/zh/reference/middlewares) - 了解 YasuiJS 中间件系统
- [CORS 插件](/zh/plugins/cors) - 跨域资源共享
- [错误处理](/zh/reference/error-handling) - 正确处理速率限制错误
