# Validation

Automatic DTO validation for YasuiJS applications using [class-validator](https://github.com/typestack/class-validator). Validates request data against DTO classes with decorators, transforms plain objects to class instances, and provides structured error responses.

## Installation

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

## Overview

The `@yasui/validation` package provides automatic validation for DTOs using class-validator decorators:

- **Automatic validation** - Validates `@Body()` and `@Query()` parameters
- **Type transformation** - Converts plain objects to class instances
- **Security-first** - Whitelist mode enabled by default (prevents mass assignment)
- **Structured errors** - Detailed validation error responses
- **Validation groups** - Conditional validation rules
- **Nested validation** - Deep object validation support
- **Performance options** - Stop at first error for fast-fail scenarios

**Important:** This is a pipe transform that integrates with YasuiJS's pipe system. It can be applied globally via `globalPipes`, at controller level, or per-route using `@UsePipes()`.

## Quick Start

### 1. Define Your DTO

Create a DTO class with class-validator decorators:

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

### 2. Apply Globally

Register the validation pipe globally to validate all DTOs:

```typescript
import yasui from 'yasui';
import { validation } from '@yasui/validation';
import { ProductController } from './controllers/product.controller';

yasui.createServer({
  globalPipes: [validation()],
  controllers: [ProductController]
});
```

### 3. Use in Controllers

The DTO is automatically validated and transformed:

```typescript
import { Controller, Post, Body } from 'yasui';
import { CreateProductDto } from './dtos/product.dto';

@Controller('/products')
export class ProductController {

  @Post()
  async create(@Body() dto: CreateProductDto) {
    // dto is already validated and transformed to CreateProductDto instance
    return { message: 'Product created', data: dto };
  }
}
```

## Configuration

The `validation()` function accepts a configuration object with the following options:

### `whitelist`

Strip properties without decorators (prevents mass assignment vulnerabilities).

- **Type:** `boolean`
- **Default:** `true`
- **Example:**

```typescript
validation({
  whitelist: true  // Strips unknown properties
})
```

**Security Note:** Enabled by default to prevent mass assignment attacks. When `true`, only properties with class-validator decorators are kept. Unknown properties are silently removed.

### `forbidNonWhitelisted`

Throw error if non-whitelisted properties are present (strict mode).

- **Type:** `boolean`
- **Default:** `false`
- **Example:**

```typescript
validation({
  whitelist: true,
  forbidNonWhitelisted: true  // Throws error instead of stripping
})
```

**Use Case:** Strict APIs where clients must send exact DTOs. Returns 400 error if unknown properties are present instead of silently stripping them. Useful for catching client bugs early.

### `stopAtFirstError`

Stop validation on first error (performance optimization).

- **Type:** `boolean`
- **Default:** `false`
- **Example:**

```typescript
validation({
  stopAtFirstError: true  // Fast-fail mode
})
```

**Use Case:** Use for high-traffic endpoints where full error details aren't required. Clients receive less detailed error messages (only first error), but validation is faster.

### `groups`

Validation groups for conditional validation rules.

- **Type:** `string[]`
- **Default:** `undefined`
- **Example:**

```typescript
// DTO with groups
class UpdateUserDto {
  @IsEmail({ groups: ['admin'] })
  email?: string;

  @IsString({ groups: ['user', 'admin'] })
  name?: string;
}

// Apply group-specific validation
validation({ groups: ['admin'] })
```

**Use Case:** Pass groups to class-validator for conditional validation. See [class-validator groups documentation](https://github.com/typestack/class-validator#validation-groups) for details.

## Default Configuration

The pipe uses production-ready defaults:

```typescript
{
  whitelist: true,              // Strip unknown properties
  forbidNonWhitelisted: false,  // Lenient mode (strip instead of error)
  stopAtFirstError: false,      // Get all errors
  groups: []                    // No groups
}
```

## How It Works

The validation pipe executes automatically for `@Body()` and `@Query()` parameters:

1. **Skip native types** - Bypasses `String`, `Number`, `Boolean`, `Array`, `Object` (already type-casted by YasuiJS)
2. **Transform** - Converts plain object to DTO class instance using `class-transformer`
3. **Validate** - Runs class-validator decorators on the instance
4. **Whitelist** - Strips properties without decorators (if `whitelist: true`)
5. **Throw or return** - Throws `ValidationException` (400 status) on failure, returns instance on success

The pipe automatically skips `@Param()`, `@Header()`, etc. because YasuiJS already type-casts these using TypeScript metadata.

## Technical Details

The pipe integrates with YasuiJS's pipe system. See [Pipes Reference](/reference/pipes) for usage patterns (global pipes, per-route with `@UsePipes()`, etc.).

When validation fails, the pipe throws `ValidationException` (extends `HttpError`) with 400 status code. YasuiJS automatically handles the exception and returns an error response.

## See Also

- [Pipes Reference](/reference/pipes) - Learn about YasuiJS pipe system
- [Error Handling](/reference/error-handling) - Handle validation errors properly
- [class-validator](https://github.com/typestack/class-validator) - Validation decorators documentation
- [class-transformer](https://github.com/typestack/class-transformer) - Type transformation documentation
