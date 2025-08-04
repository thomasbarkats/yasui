# 配置

使用 `yasui.createServer()` 和 `yasui.createApp()` 的 YasuiJS 应用程序完整配置参考。

## 概述

YasuiJS 提供两种主要方式来创建应用程序：

- **`yasui.createServer(config)`** - 自动创建并启动 HTTP 服务器
- **`yasui.createApp(config)`** - 返回一个可手动配置的 Express 应用程序

这两种方法都接受相同的配置对象，具有以下选项。

## 配置选项

### 必需选项

#### `controllers`
**类型:** `Array<Constructor>`  
**描述:** 要在应用程序中注册的控制器类数组。

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController, ProductController]
});
```

### 可选选项

#### `middlewares`
**类型:** `Array<Constructor | RequestHandler>`  
**默认值:** `[]`  
**描述:** 应用于所有请求的全局中间件数组。可以是 YasuiJS 中间件类或 Express RequestHandler 函数。

```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [LoggingMiddleware, cors()]
});
```

#### `environment`
**类型:** `string`  
**默认值:** `process.env.NODE_ENV || 'development'`  
**描述:** 应用程序的环境名称。

```typescript
yasui.createServer({
  controllers: [UserController],
  environment: 'production'
});
```

#### `port`
**类型:** `number`  
**默认值:** `3000`  
**描述:** HTTP 服务器的端口号。仅用于 `createServer()`。

```typescript
yasui.createServer({
  controllers: [UserController],
  port: 8080
});
```

#### `debug`
**类型:** `boolean`  
**默认值:** `false`  
**描述:** 启用调试模式，提供额外的日志记录和请求跟踪。

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true
});
```

#### `injections`
**类型:** `Array<{ token: string, provide: any }>`  
**默认值:** `[]`  
**描述:** 依赖注入的自定义注入令牌。详见 [依赖注入](/zh/reference/dependency-injection)。

```typescript
yasui.createServer({
  controllers: [UserController],
  injections: [
    { token: 'DATABASE_URL', provide: 'postgresql://localhost:5432/mydb' },
    { token: 'CONFIG', provide: { apiKey: 'secret' } }
  ]
});
```

#### `swagger`
**类型:** `SwaggerConfig | undefined`  
**默认值:** `undefined`  
**描述:** Swagger 文档配置。详见 [Swagger](/zh/reference/swagger)。

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    enabled: true,
    path: '/api-docs',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation'
    }
  }
});
```

#### `enableDecoratorValidation`
**类型:** `boolean`  
**默认值:** `true`  
**描述:** 在启动时启用装饰器验证以捕获配置错误。

```typescript
yasui.createServer({
  controllers: [UserController],
  enableDecoratorValidation: false
});
```

## createServer() 与 createApp() 的比较

### createServer()

创建 HTTP 服务器并自动开始监听：

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController],
  port: 3000,
  debug: true
});

// 服务器自动启动并在端口 3000 上监听
```

**适用场景：**
- 想要立即启动服务器
- 不需要额外的 Express 配置
- 构建简单的 API

### createApp()

返回一个可手动配置的 Express 应用程序：

```typescript
import yasui from 'yasui';

const app = yasui.createApp({
  controllers: [UserController]
});

// 添加自定义 Express 中间件
app.use('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 添加自定义路由
app.get('/custom', (req, res) => {
  res.json({ message: 'Custom route' });
});

// 手动启动服务器
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**适用场景：**
- 需要自定义 Express 配置
- 想要添加自定义路由或中间件
- 需要更多服务器启动控制
- 与现有 Express 应用程序集成

## 配置示例

### 基本 API 设置

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  port: 3000,
  debug: true
});
```

### 完整配置

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  middlewares: [LoggingMiddleware, AuthMiddleware],
  port: 3000,
  debug: false,
  environment: 'production',
  enableDecoratorValidation: true,
  injections: [
    { token: 'DATABASE_URL', provide: process.env.DATABASE_URL },
    { token: 'JWT_SECRET', provide: process.env.JWT_SECRET }
  ],
  swagger: {
    enabled: true,
    path: '/api-docs',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Complete API with all features'
    }
  }
});
```

### Express 集成

```typescript
import yasui from 'yasui';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = yasui.createApp({
  controllers: [UserController],
  middlewares: [LoggingMiddleware]
});

// 添加 Express 中间件
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// 添加自定义路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
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