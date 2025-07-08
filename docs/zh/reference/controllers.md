# 控制器

控制器是您API的入口点。它们定义HTTP端点并通过提取数据、调用业务逻辑和返回响应来处理传入请求。

## 概述

在YasuiJS中，控制器是用`@Controller()`装饰的类，它们将相关端点分组在一起。控制器中的每个方法代表一个HTTP端点，使用方法装饰器如`@Get()`、`@Post()`等定义。

控制器方法可以简单地返回任何值，这些值将自动序列化为JSON并带有200状态码。要获得更多控制，您可以使用`@Res()`直接访问Express响应对象，并使用原生Express方法如`res.json()`、`res.status()`或`res.sendFile()`。

```typescript
import { Controller, Get, Post } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] }; // 自动返回JSON
  }

  @Post('/')
  createUser() {
    return { message: 'User created' }; // 自动返回JSON
  }
}
```

## 控制器装饰器

`@Controller()`装饰器将类标记为控制器并为其所有路由定义基本路径。

### 基本用法

```typescript
@Controller('/api/users')
export class UserController {
  // 所有路由都将以/api/users为前缀
}
```

### 使用中间件

您可以对控制器中的所有路由应用中间件。在[中间件](/zh/reference/middlewares)中了解更多。

```typescript
import { AuthMiddleware } from './middleware/auth.middleware';

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

  @Get('/:id')
  getUser() {
    return { user: {} };
  }

  @Post('/')
  createUser() {
    return { message: 'User created' };
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

### 路由参数

在路径中使用Express风格的路由参数：

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser() {
    // 路由: GET /api/users/123
  }

  @Get('/:id/posts/:postId')
  getUserPost() {
    // 路由: GET /api/users/123/posts/456
  }

  @Get('/search/:category?')
  searchUsers() {
    // 路由: GET /api/users/search 或 /api/users/search/admin
  }
}
```

### 路由级中间件

对特定路由应用中间件。在[中间件](/zh/reference/middlewares)中了解更多。

```typescript
import { ValidationMiddleware, AuthMiddleware } from './middleware';

@Controller('/api/users')
export class UserController {
  @Get('/', ValidationMiddleware)
  getAllUsers() {
    // 只有这个路由有ValidationMiddleware
  }

  @Post('/', AuthMiddleware, ValidationMiddleware)
  createUser() {
    // 这个路由有两个中间件
  }
}
```

## 参数装饰器

使用参数装饰器从HTTP请求中提取数据。所有参数装饰器都可以带参数名或不带参数名使用，以提取特定值或整个对象。

### 请求对象访问

- `@Req()` - 访问Express Request对象（无参数）
- `@Res()` - 访问Express Response对象（无参数）
- `@Next()` - 访问Express NextFunction（无参数）

访问Express请求、响应和next对象：

```typescript
import { Request, Response, NextFunction } from 'express';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction
  ) {
    // 直接访问Express对象
    console.log(request.url);
    return { users: [] };
  }
}
```

### 提取路由参数

- `@Param(name?)` - 提取路由参数（可选参数名）

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    // 提取特定参数
    return { userId: id };
  }

  @Get('/:id/posts/:postId')
  getUserPost(
    @Param('id') userId: string,
    @Param('postId') postId: string
  ) {
    // 提取多个参数
    return { userId, postId };
  }

  @Get('/all')
  getAllWithParams(@Param() params: any) {
    // 获取所有路由参数作为对象
    return { params };
  }
}
```

### 提取查询参数

- `@Query(name?)` - 提取查询参数（可选参数名）

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    // 提取特定查询参数并设置默认值
    return { page, limit };
  }

  @Get('/search')
  searchUsers(@Query() query: any) {
    // 获取所有查询参数作为对象
    return { searchParams: query };
  }
}
```

### 提取请求体

- `@Body(name?)` - 提取请求体数据（可选参数名）

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

### 提取请求头

- `@Header(name?)` - 提取请求头（可选参数名）

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Header('authorization') auth: string) {
    // 提取特定请求头
    return { authHeader: auth };
  }

  @Get('/all-headers')
  getUsersWithHeaders(@Header() headers: any) {
    // 获取所有请求头作为对象
    return { headers };
  }
}
```

## 响应处理

YasuiJS自动处理响应序列化和状态码。

### 自动JSON响应

返回任何数据，它将自动序列化为JSON：

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // 自动返回JSON，状态码为200
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

- `@HttpStatus(code)` - 设置自定义HTTP状态码（必需状态码参数，接受数字或HttpCode枚举）

使用`@HttpStatus()`装饰器设置自定义状态码：

```typescript
import { HttpStatus, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Post('/')
  @HttpStatus(201) // 使用数字
  createUser(@Body() userData: any) {
    // 返回状态码201 Created
    return { created: userData };
  }

  @Post('/alt')
  @HttpStatus(HttpCode.CREATED) // 使用HttpCode枚举
  createUserAlt(@Body() userData: any) {
    // 返回状态码201 Created
    return { created: userData };
  }

  @Delete('/:id')
  @HttpStatus(HttpCode.NO_CONTENT) // 使用HttpCode枚举
  deleteUser(@Param('id') id: string) {
    // 返回状态码204 No Content
    // 对于204可以不返回任何内容
  }
}
```

### 手动响应处理

要完全控制，请使用Express响应对象：

```typescript
import { Response } from 'express';

@Controller('/api/users')
export class UserController {
  @Get('/custom')
  customResponse(@Res() res: Response) {
    res.status(418).json({ 
      message: "I'm a teapot",
      custom: true 
    });
    // 直接使用res时不要返回任何内容
  }

  @Get('/file')
  downloadFile(@Res() res: Response) {
    res.download('/path/to/file.pdf');
  }
}
```

## 错误处理

让框架自动处理错误或抛出自定义错误。有关完整的错误处理详情，请参阅[错误处理](/zh/reference/error-handling)。

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.findById(id);
    
    if (!user) {
      // 抛出自定义HTTP错误
      throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
    }
    
    return user;
  }
}
```