# 管道

管道在请求数据到达控制器方法之前对其进行转换和验证。它们在中间件之后和路由控制器之前执行，并对单个路由参数进行操作。

## 概述

YasuiJS 管道可用于:
- **验证** - 检查传入数据是否符合预期标准
- **转换** - 将数据转换为所需格式或类型
- **净化** - 清理和规范化输入数据

管道可以在三个层级应用:
1. **全局层级** - 应用于应用程序中的所有参数
2. **控制器层级** - 应用于控制器中的所有参数
3. **方法层级** - 应用于特定路由方法中的参数

```typescript
import { PipeTransform, IParamMetadata } from 'yasui';

@PipeTransform()
export class ValidationPipe implements IPipeTransform {
  transform(value: any, metadata: IParamMetadata) {
    // 验证逻辑在这里
    return value;
  }
}
```

## 创建管道

### 管道接口

所有管道必须实现带有单个 `transform` 方法的 `IPipeTransform` 接口:

```typescript
import { PipeTransform, IPipeTransform, IParamMetadata } from 'yasui';

@PipeTransform()
export class ParseIntPipe implements IPipeTransform {

  transform(value: any, metadata: IParamMetadata): number {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      throw new HttpError(400, `预期为数字，但得到 "${value}"`);
    }
    return parsed;
  }
}
```

### IParamMetadata

`transform` 方法接收关于正在处理的参数的元数据:

- `type`: 参数的来源(body、query、param、headers 等)
- `name?`: 请求源对象中的属性名
- `metatype?`: 参数的底层类型，基于路由处理程序中的类型定义

请参阅[与类验证器集成](#integration-with-class-validator)部分中的示例以了解元数据的使用。

管道在自动类型转换后接收**类型化值**。

## 使用管道

### 方法层级

使用 `@UsePipes()` 将管道应用于特定路由方法:

```typescript
@Controller('/users')
export class UserController {

  @Get('/:id')
  @UsePipes(ParseIntPipe)
  getUser(@Param('id') id: number) {
    // id 保证是一个数字
    return this.userService.findById(id);
  }
}
```

### 控制器层级

将管道应用于控制器中的所有方法:

```typescript
@Controller('/users')
@UsePipes(ValidationPipe, LoggingPipe)
export class UserController {
  @Post('/')
  createUser(@Body() createUserDto: CreateUserDto) {
    // 所有路由的所有参数都经过验证和日志记录
  }
}
```

### 全局层级

将管道应用于整个应用程序的所有参数:

```typescript
yasui.createServer({
  controllers: [UserController],
  globalPipes: [ValidationPipe, TrimPipe]
});
```

## 执行顺序

管道按以下顺序执行:

1. **全局管道** (按注册顺序)
2. **控制器管道** (按声明顺序)
3. **方法管道** (按声明顺序)

```typescript
// 配置
yasui.createServer({
  globalPipes: [GlobalPipe] // 1. 首先
});

@Controller('/users')
@UsePipes(ControllerPipe) // 2. 其次
export class UserController {
  @Post('/')
  @UsePipes(MethodPipe) // 3. 最后
  createUser(@Body() data: any) {
    // 数据已经被所有三个管道处理过
  }
}
```

## 错误处理

管道可以抛出错误以拒绝无效请求，与所有其他层级一样，这些错误将被 Yasui 自动捕获:

```typescript
@PipeTransform()
export class RequiredPipe implements IPipeTransform {
  transform(value: any, metadata: IParamMetadata) {
    if (value === undefined || value === null || value === '') {
      const paramName = metadata.name || metadata.type;
      throw new HttpError(HttpCode.BAD_REQUEST, `${paramName} 是必需的`);
    }
    return value;
  }
}
```

## 与类验证器集成

YasuiJS 管道可以与 class-validator 和 class-transformer 无缝协作:

<details>
<summary>查看完整示例</summary>

```typescript
import { validate, IsEmail, IsString, MinLength  } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PipeTransform, IPipeTransform, ParamMetadata, HttpError } from 'yasui';

export class CreateUserDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @MinLength(3)
  name: string;
}

@Controller('/users')
export class UserController {
  @Post('/')
  @UsePipes(ValidationPipe) // 使用 class-validator 装饰器
  createUser(@Body() createUserDto: CreateUserDto) {
    // createUserDto 已验证并类型化
    return this.userService.create(createUserDto);
  }
}

@PipeTransform()
export class ValidationPipe implements IPipeTransform {
  async transform(value: any, metadata: ParamMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query') {
      return value;
    }
    // 跳过原始类型的验证
    if (!metadata.metatype || this.isPrimitiveType(metadata.metatype)) {
      return value;
    }

    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map(err => 
        Object.values(err.constraints || {}).join(', ')
      ).join('; ');

      throw new HttpError(400, `验证失败: ${messages}`);
    }
    return object;
  }

  private isPrimitiveType(type: Function): boolean {
    return [String, Boolean, Number, Array, Object].includes(type);
  }
}
```
</details>
