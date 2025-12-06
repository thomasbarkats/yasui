# 验证

使用 [class-validator](https://github.com/typestack/class-validator) 为 YasuiJS 应用程序自动验证 DTO。根据带有装饰器的 DTO 类验证请求数据,将普通对象转换为类实例,并提供结构化的错误响应。

## 安装

::: code-group
```bash [npm]
npm install @yasui/validation class-validator class-transformer
```

```bash [pnpm]
pnpm add @yasui/validation class-validator class-transformer
```

```bash [bun]
bun add @yasui/validation class-validator class-transformer
```

```bash [deno]
deno add jsr:@yasui/validation npm:class-validator npm:class-transformer
```
:::

## 概述

`@yasui/validation` 包使用 class-validator 装饰器为 DTO 提供自动验证:

- **自动验证** - 验证 `@Body()` 和 `@Query()` 参数
- **类型转换** - 将普通对象转换为类实例
- **安全优先** - 默认启用白名单模式(防止批量赋值)
- **结构化错误** - 详细的验证错误响应
- **验证组** - 条件验证规则
- **嵌套验证** - 深层对象验证支持
- **性能选项** - 在第一个错误时停止以实现快速失败场景

**重要:** 这是一个与 YasuiJS 管道系统集成的管道转换。可以通过 `globalPipes` 全局应用,在控制器级别应用,或使用 `@UsePipes()` 按路由应用。

## 快速开始

### 1. 定义 DTO

使用 class-validator 装饰器创建 DTO 类:

```typescript
import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### 2. 全局应用

全局注册验证管道以验证所有 DTO:

```typescript
import yasui from 'yasui';
import { validation } from '@yasui/validation';
import { ProductController } from './controllers/product.controller';

yasui.createServer({
  globalPipes: [validation()],
  controllers: [ProductController]
});
```

### 3. 在控制器中使用

DTO 会自动验证和转换:

```typescript
import { Controller, Post, Body } from 'yasui';
import { CreateProductDto } from './dtos/product.dto';

@Controller('/products')
export class ProductController {

  @Post()
  async create(@Body() dto: CreateProductDto) {
    // dto 已经被验证并转换为 CreateProductDto 实例
    return { message: 'Product created', data: dto };
  }
}
```

## 配置

`validation()` 函数接受具有以下选项的配置对象:

### `whitelist`

去除没有装饰器的属性(防止批量赋值漏洞)。

- **类型:** `boolean`
- **默认值:** `true`
- **示例:**

```typescript
validation({
  whitelist: true  // 去除未知属性
})
```

**安全提示:** 默认启用以防止批量赋值攻击。当为 `true` 时,只保留带有 class-validator 装饰器的属性。未知属性会被静默删除。

### `forbidNonWhitelisted`

如果存在非白名单属性则抛出错误(严格模式)。

- **类型:** `boolean`
- **默认值:** `false`
- **示例:**

```typescript
validation({
  whitelist: true,
  forbidNonWhitelisted: true  // 抛出错误而不是删除
})
```

**用例:** 客户端必须发送确切 DTO 的严格 API。如果存在未知属性,则返回 400 错误,而不是静默删除它们。对于早期捕获客户端错误很有用。

### `stopAtFirstError`

在第一个错误时停止验证(性能优化)。

- **类型:** `boolean`
- **默认值:** `false`
- **示例:**

```typescript
validation({
  stopAtFirstError: true  // 快速失败模式
})
```

**用例:** 用于不需要完整错误详细信息的高流量端点。客户端收到的错误消息不太详细(仅第一个错误),但验证速度更快。

### `groups`

用于条件验证规则的验证组。

- **类型:** `string[]`
- **默认值:** `undefined`
- **示例:**

```typescript
// 带组的 DTO
class UpdateUserDto {
  @IsEmail({ groups: ['admin'] })
  email?: string;

  @IsString({ groups: ['user', 'admin'] })
  name?: string;
}

// 应用特定组的验证
validation({ groups: ['admin'] })
```

**用例:** 将组传递给 class-validator 进行条件验证。有关详细信息,请参阅 [class-validator 组文档](https://github.com/typestack/class-validator#validation-groups)。

## 默认配置

管道使用生产就绪的默认值:

```typescript
{
  whitelist: true,              // 去除未知属性
  forbidNonWhitelisted: false,  // 宽松模式(删除而不是错误)
  stopAtFirstError: false,      // 获取所有错误
  groups: []                    // 无组
}
```

## 工作原理

验证管道自动为 `@Body()` 和 `@Query()` 参数执行:

1. **跳过原生类型** - 绕过 `String`、`Number`、`Boolean`、`Array`、`Object`(已由 YasuiJS 类型转换)
2. **转换** - 使用 `class-transformer` 将普通对象转换为 DTO 类实例
3. **验证** - 在实例上运行 class-validator 装饰器
4. **白名单** - 去除没有装饰器的属性(如果 `whitelist: true`)
5. **抛出或返回** - 失败时抛出 `ValidationException`(400 状态),成功时返回实例

管道自动跳过 `@Param()`、`@Header()` 等,因为 YasuiJS 已经使用 TypeScript 元数据对它们进行了类型转换。

## 技术细节

管道与 YasuiJS 的管道系统集成。有关使用模式(全局管道、使用 `@UsePipes()` 按路由等),请参阅[管道参考](/zh/reference/pipes)。

当验证失败时,管道抛出 `ValidationException`(扩展 `HttpError`)并返回 400 状态码。YasuiJS 自动处理异常并返回错误响应。

## 另请参阅

- [管道参考](/zh/reference/pipes) - 了解 YasuiJS 管道系统
- [错误处理](/zh/reference/error-handling) - 正确处理验证错误
- [class-validator](https://github.com/typestack/class-validator) - 验证装饰器文档
- [class-transformer](https://github.com/typestack/class-transformer) - 类型转换文档
