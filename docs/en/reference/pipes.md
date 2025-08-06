# Pipes

Pipes transform and validate incoming request data before it reaches your controller methods. They are executed after middleware and before your route controllers, and operate on individual route parameters.

## Overview

YasuiJS pipes can be useful for:
- **Validation** - Check if incoming data meets expected criteria
- **Transformation** - Convert data to desired formats or types
- **Sanitization** - Clean and normalize input data

Pipes can be applied at three levels:
1. **Global level** - Applied to all parameters in your application
2. **Controller level** - Applied to all parameters in a controller
3. **Method level** - Applied to parameters in specific route methods

```typescript
import { PipeTransform, IParamMetadata } from 'yasui';

@PipeTransform()
export class ValidationPipe implements IPipeTransform {
  transform(value: any, metadata: IParamMetadata) {
    // Validation logic here
    return value;
  }
}
```

## Creating Pipes

### Pipe Interface

All pipes must implement the `IPipeTransform` interface with a single `transform` method:

```typescript
import { PipeTransform, IPipeTransform, IParamMetadata } from 'yasui';

@PipeTransform()
export class ParseIntPipe implements IPipeTransform {

  transform(value: any, metadata: IParamMetadata): number {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      throw new HttpError(400, `Expected number, got "${value}"`);
    }
    return parsed;
  }
}
```

### IParamMetadata

The `transform` method receives metadata about the parameter being processed:

- `type`: Source of the parameter (body, query, param, headers etc)
- `name?`: Property name in the request source object */
- `metatype?`: Underlying type of the parameter, based on the type definition in the route handler

See the example in the [Integration with Class Validator](#integration-with-class-validator) section to see the metadata in use.

Pipes receive **typed values** after automatic type casting.

## Using Pipes

### Method Level

Apply pipes to specific route methods using `@UsePipes()`:

```typescript
@Controller('/users')
export class UserController {

  @Get('/:id')
  @UsePipes(ParseIntPipe)
  getUser(@Param('id') id: number) {
    // id is guaranteed to be a number
    return this.userService.findById(id);
  }
}
```

### Controller Level

Apply pipes to all methods in a controller:

```typescript
@Controller('/users')
@UsePipes(ValidationPipe, LoggingPipe)
export class UserController {
  @Post('/')
  createUser(@Body() createUserDto: CreateUserDto) {
    // All parameters validated and logged for all routes
  }
}
```

### Global Level

Apply pipes to all parameters across your entire application:

```typescript
yasui.createServer({
  controllers: [UserController],
  globalPipes: [ValidationPipe, TrimPipe]
});
```

## Execution Order

Pipes execute in this order:

1. **Global pipes** (in registration order)
2. **Controller pipes** (in declaration order)
3. **Method pipes** (in declaration order)

```typescript
// Configuration
yasui.createServer({
  globalPipes: [GlobalPipe] // 1. First
});

@Controller('/users')
@UsePipes(ControllerPipe) // 2. Second
export class UserController {
  @Post('/')
  @UsePipes(MethodPipe) // 3. Third
  createUser(@Body() data: any) {
    // data has been processed by all three pipes
  }
}
```

## Error Handling

Pipes can throw errors to reject invalid requests, as at all other levels, these will be automatically caught by Yasui:

```typescript
@PipeTransform()
export class RequiredPipe implements IPipeTransform {
  transform(value: any, metadata: IParamMetadata) {
    if (value === undefined || value === null || value === '') {
      const paramName = metadata.name || metadata.type;
      throw new HttpError(HttpCode.BAD_REQUEST, `${paramName} is required`);
    }
    return value;
  }
}
```

## Integration with Class Validator

YasuiJS pipes can work seamlessly with class-validator and class-transformer:

<details>
<summary>See the complete example</summary>

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
  @UsePipes(ValidationPipe) // Uses class-validator decorators
  createUser(@Body() createUserDto: CreateUserDto) {
    // createUserDto is validated and typed
    return this.userService.create(createUserDto);
  }
}

@PipeTransform()
export class ValidationPipe implements IPipeTransform {
  async transform(value: any, metadata: ParamMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query') {
      return value;
    }
    // Skip validation for primitive types
    if (!metadata.metatype || this.isPrimitiveType(metadata.metatype)) {
      return value;
    }

    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map(err => 
        Object.values(err.constraints || {}).join(', ')
      ).join('; ');

      throw new HttpError(400, `Validation failed: ${messages}`);
    }
    return object;
  }

  private isPrimitiveType(type: Function): boolean {
    return [String, Boolean, Number, Array, Object].includes(type);
  }
}
```
</details>
