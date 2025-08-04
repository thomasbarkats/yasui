# 控制器

控制器是API的入口点。它们定义HTTP端点并通过提取数据、调用业务逻辑和返回响应来处理传入请求。

## 概述

在YasuiJS中，控制器是使用`@Controller()`装饰器修饰的类，用于将相关端点组合在一起。控制器中的每个方法代表一个HTTP端点，使用`@Get()`、`@Post()`等方法装饰器定义。

控制器方法可以简单地返回任何值，这些值将自动序列化为JSON并返回200状态码。如果需要更多控制，你可以使用`@Res()`直接访问Express响应对象，并使用原生Express方法如`res.json()`、`res.status()`或`res.sendFile()`。

```typescript
import { Controller, Get, Post } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] }; // 自动返回JSON
  }
}
```

## 控制器装饰器

`@Controller()`装饰器将类标记为控制器并为其所有路由定义基础路径。

### 基本用法

```typescript
@Controller('/api/users')
export class UserController {
  // 所有路由都将以/api/users为前缀
}
```

### 使用中间件

你可以为控制器中的所有路由应用中间件。在[中间件](/zh/reference/middlewares)中了解更多。

```typescript
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // 所有路由都将应用AuthMiddleware
}
```

## HTTP方法装饰器

YasuiJS为所有标准HTTP方法提供装饰器。每个装饰器接受一个路径参数（必需）和可选的中间件参数。

- `@Get(path, ...middlewares)` - 处理GET请求
- `@Post(path, ...middlewares)` - 处理POST请求
- `@Put(path, ...middlewares)` - 处理PUT请求
- `@Delete(path, ...middlewares)` - 处理DELETE请求
- `@Patch(path, ...middlewares)` - 处理PATCH请求

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
    return { message: '用户已创建' };
  }

  @Get('/:id')
  getUser() {
    // 在路径中使用Express风格的路由参数：
    // 路由: GET /api/users/123
    return { user: {} };
  }

  @Put('/:id')
  updateUser() {
    return { message: '用户已更新' };
  }

  @Delete('/:id')
  deleteUser() {
    return { message: '用户已删除' };
  }
}
```

### 路由级中间件

对特定路由应用中间件。在[中间件](/zh/reference/middlewares)中了解更多。

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/', ValidationMiddleware)
  getAllUsers() {}
}
```

## 参数装饰器

使用参数装饰器从HTTP请求中提取数据。YasuiJS根据TypeScript类型自动转换参数以获得更好的类型安全性。

### 提取请求体

- `@Body(name?)` - 提取请求体数据

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

### 提取参数和请求头

- `@Param(name)` - 提取路由参数
- `@Query(name)` - 提取查询参数
- `@Header(name?)` - 提取请求头

参数会根据TypeScript类型自动转换：

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: number) { 
    // 自动转换为数字
  }

  @Get('/search')
  searchUsers(
    @Query('page') page: number,
    @Query('active') active: boolean,
    @Query('tags') tags: string[]
  ) {
    // page: number (从"123"转换为123)
    // active: boolean (从"true"/"1"转换为true)
    // tags: string[] (来自?tags=red&tags=blue)
    return { page, active, tags };
  }

  @Get('/profile')
  getProfile(
    @Query('settings') settings: { theme: string },
    @Header('x-api-version') version: number
  ) {
    // settings: object (从?settings={"theme":"dark"} - JSON解析)
    // version: number (请求头转换为数字)
    return { settings, version };
  }
}
```

### 支持的类型转换

YasuiJS根据TypeScript类型自动转换参数：

- **string** - 无转换（默认）
- **number** - 转换为数字，无效时返回NaN
- **boolean** - 将"true"/"1"转换为true，其他转换为false
- **Date** - 转换为Date对象，无效时返回Invalid Date
- **string[]** - 用于查询数组如`?tags=red&tags=blue`
- **object** - 解析JSON字符串，用于查询如`?data={"key":"value"}`

### 请求对象访问

- `@Req()` - 访问Express Request对象
- `@Res()` - 访问Express Response对象
- `@Next()` - 访问Express NextFunction

```typescript
import { Request, Response, NextFunction } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction
  ) {
    console.log(request.url);
    return { users: [] };
  }
}
```

## 响应处理

YasuiJS自动处理响应序列化和状态码。

### 自动JSON响应

返回任何数据都将自动序列化为JSON：

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // 自动返回JSON，状态码200
    return { users: ['John', 'Jane'] };
  }

  @Get('/string')
  getString() {
    // 将字符串作为JSON返回
    return 'Hello World';
  }

  @Get('/number')
  getNumber() {
    // 将数字作为JSON返回
    return 42;
  }
}
```

### 自定义状态码

- `@HttpStatus(code)` - 设置自定义HTTP状态码

使用`@HttpStatus()`装饰器设置自定义状态码：

```typescript
import { HttpStatus, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Post('/alt')
  @HttpStatus(201) // 使用数字
  createUserAlt(@Body() userData: any) {
    // 返回状态码201 Created
    return { created: userData };
  }

  @Delete('/:id')
  @HttpStatus(HttpCode.NO_CONTENT) // 使用HttpCode枚举
  deleteUser(@Param('id') id: string) {
    // 返回状态码204 No Content
    // 204可以不返回任何内容
  }
}
```

### 手动响应处理

要完全控制，使用Express响应对象：

```typescript
import { Response } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/custom')
  customResponse(@Res() res: Response) {
    res.status(418).json({ 
      message: "我是茶壶",
      custom: true 
    });
    // 直接使用res时不要返回任何内容
  }
}
```

## 错误处理

让框架自动处理错误或抛出自定义错误。完整的错误处理详情，请参见[错误处理](/zh/reference/error-handling)。