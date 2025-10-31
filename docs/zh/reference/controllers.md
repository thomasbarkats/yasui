# 控制器

控制器是您 API 的入口点。它们定义 HTTP 端点并通过提取数据、调用业务逻辑和返回响应来处理传入请求。

## 概述

在 YasuiJS 中，控制器是用 `@Controller()` 装饰的类，用于将相关端点组合在一起。控制器中的每个方法都代表一个 HTTP 端点，使用方法装饰器如 `@Get()`、`@Post()` 等来定义。

控制器方法可以简单地返回任何值，这些值将自动序列化为 JSON 并返回 200 状态码。如需手动控制响应，您可以直接返回 Web 标准 Response 对象。

```typescript
import { Controller, Get, Post } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] }; // 自动返回 JSON
  }
}
```

## 控制器装饰器

`@Controller()` 装饰器将类标记为控制器并定义其所有路由的基础路径。

### 基本用法

```typescript
@Controller('/api/users')
export class UserController {
  // 所有路由都将以 /api/users 为前缀
}
```

### 使用中间件

您可以将中间件应用于控制器中的所有路由。在[中间件](/zh/reference/middlewares)中了解更多。

```typescript
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // 所有路由都将应用 AuthMiddleware
}
```

## HTTP 方法装饰器

YasuiJS 为所有标准 HTTP 方法提供装饰器。每个装饰器接受一个路径参数（必需）和可选的中间件参数。

- `@Get(path, ...middlewares)` - 处理 GET 请求
- `@Post(path, ...middlewares)` - 处理 POST 请求
- `@Put(path, ...middlewares)` - 处理 PUT 请求
- `@Delete(path, ...middlewares)` - 处理 DELETE 请求
- `@Patch(path, ...middlewares)` - 处理 PATCH 请求

### 基本路由

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] };
  }

  @Post('/')
  createUser() {
    return { message: 'User created' };
  }

  @Get('/:id')
  getUser() {
    // 在路径中使用 Express 风格的路由参数：
    // 路由：GET /api/users/123
    return { user: {} };
  }

  @Put('/:id')
  updateUser() {
    return { message: 'User updated' };
  }

  @Delete('/:id')
  deleteUser() {
    return { message: 'User deleted' };
  }
}
```

### 路由级中间件

将中间件应用于特定路由。在[中间件](/zh/reference/middlewares)中了解更多。

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/', ValidationMiddleware)
  getAllUsers() {}
}
```

## 参数装饰器

使用参数装饰器从 HTTP 请求中提取数据。YasuiJS 根据 TypeScript 类型自动转换参数，以获得更好的类型安全性。

### 提取请求体

`@Body(name?)` - 提取请求体数据

```typescript
@Controller('/api/users')
export class UserController {
  @Post('/')
  createUser(@Body() userData: any) {
    // 提取整个请求体
    return { created: userData };
  }

  @Post('/partial')
  updateUser(@Body('name') name: string) {
    // 从请求体中提取特定字段
    return { updatedName: name };
  }
}
```

### 提取参数和头部

- `@Param(name, items?)` - 提取路由参数
- `@Query(name, items?)` - 提取查询参数
- `@Header(name, items?)` - 提取请求头

参数会根据其 TypeScript 类型自动转换。对于非字符串类型的数组，您必须将项目类型指定为第二个参数：

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: number) {} // 转换为数字

  @Get('/search/:term')
  searchUsers(
    @Param('term') term: string,
    @Header('x-api-version') version: number,
    @Query('filters', [Boolean]) filters: boolean[],
    @Query('settings') settings: { theme: string } | null,
  ) {
    // version: number（头部转换为数字）
    // filters: boolean[]（来自 ?filters=true&filters=false&filters=1）
    // settings: object（来自 ?settings={"theme":"dark"} - JSON 解析，失败时为 null）
    return { page, active, tags, priorities };
  }
}
```

## 自动参数类型转换

YasuiJS 根据 TypeScript 类型自动转换参数：

### 基本类型
- **string** - 无转换（默认）
- **number** - 转换为数字，无效时返回 NaN
- **boolean** - 将 "true"/"1" 转换为 true，其他所有内容转换为 false
- **Date** - 转换为 Date 对象，无效时返回 Invalid Date
- **object** - 解析 JSON 字符串，用于像 `?data={"key":"value"}` 这样的查询，失败时返回 `null`

### 数组类型
TypeScript 无法在运行时检测数组项类型，因此您必须为非字符串数组指定 `[Type]`：

- **string[]** - 不需要额外配置（默认行为）
- **number、boolean 或 Date 数组** - 必须使用第二个参数指定项目类型

**类型化数组语法：**
```typescript
@Query('paramName', [Type]) paramName: Type[]
@Param('paramName', [Type]) paramName: Type[]  
@Header('headerName', [Type]) headerName: Type[]
```

## 请求对象访问

`@Req()` - 访问 YasuiJS 请求对象（具有 Express 兼容属性的 Web 标准请求）

```typescript
import { Request } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers(@Req() request: Request) {
    console.log(request.url);
    return { users: [] };
  }
}
```

## 响应处理

YasuiJS 自动处理响应序列化和状态码。

### 自动 JSON 响应

返回任何数据，它将自动序列化为 JSON：

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // 自动返回状态为 200 的 JSON
    return { users: ['John', 'Jane'] };
  }

  @Get('/string')
  getString() {
    // 将字符串作为 JSON 返回
    return 'Hello World';
  }

  @Get('/number')
  getNumber() {
    // 将数字作为 JSON 返回
    return 42;
  }
}
```

### 自定义状态码

`@HttpStatus(code)` - 设置自定义 HTTP 状态码

使用 `@HttpStatus()` 装饰器设置自定义状态码：

```typescript
import { HttpStatus, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Post('/alt')
  @HttpStatus(201) // 使用数字
  createUserAlt(@Body() userData: any) {
    // 返回状态 201 Created
    return { created: userData };
  }

  @Delete('/:id')
  @HttpStatus(HttpCode.NO_CONTENT) // 使用 HttpCode 枚举
  deleteUser(@Param('id') id: string) {
    // 返回状态 204 No Content
    // 对于 204 可以不返回任何内容
  }
}
```

### 手动响应处理

如需完全控制，返回 Web 标准 Response 对象：

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/custom')
  customResponse() {
    return new Response(JSON.stringify({
      message: "I'm a teapot",
      custom: true
    }), {
      status: 418,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  @Get('/text')
  textResponse() {
    return new Response('Plain text response', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
```

## 错误处理

让框架自动处理错误或抛出自定义错误。有关完整的错误处理详细信息，请参阅[错误处理](/zh/reference/error-handling)。