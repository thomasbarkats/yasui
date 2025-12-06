# Validación

Validación automática de DTO para aplicaciones YasuiJS usando [class-validator](https://github.com/typestack/class-validator). Valida datos de solicitud contra clases DTO con decoradores, transforma objetos planos en instancias de clase y proporciona respuestas de error estructuradas.

## Instalación

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

## Descripción general

El paquete `@yasui/validation` proporciona validación automática para DTO usando decoradores class-validator:

- **Validación automática** - Valida parámetros `@Body()` y `@Query()`
- **Transformación de tipos** - Convierte objetos planos en instancias de clase
- **Seguridad primero** - Modo whitelist habilitado por defecto (previene asignación masiva)
- **Errores estructurados** - Respuestas de error de validación detalladas
- **Grupos de validación** - Reglas de validación condicionales
- **Validación anidada** - Soporte de validación de objetos profundos
- **Opciones de rendimiento** - Detener en el primer error para escenarios fail-fast

**Importante:** Este es un pipe transform que se integra con el sistema de pipes de YasuiJS. Se puede aplicar globalmente vía `globalPipes`, a nivel de controlador, o por ruta usando `@UsePipes()`.

## Inicio rápido

### 1. Define tu DTO

Crea una clase DTO con decoradores class-validator:

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

### 2. Aplicar globalmente

Registra el pipe de validación globalmente para validar todos los DTO:

```typescript
import yasui from 'yasui';
import { validation } from '@yasui/validation';
import { ProductController } from './controllers/product.controller';

yasui.createServer({
  globalPipes: [validation()],
  controllers: [ProductController]
});
```

### 3. Usar en controladores

El DTO es automáticamente validado y transformado:

```typescript
import { Controller, Post, Body } from 'yasui';
import { CreateProductDto } from './dtos/product.dto';

@Controller('/products')
export class ProductController {

  @Post()
  async create(@Body() dto: CreateProductDto) {
    // dto ya está validado y transformado a instancia CreateProductDto
    return { message: 'Product created', data: dto };
  }
}
```

## Configuración

La función `validation()` acepta un objeto de configuración con las siguientes opciones:

### `whitelist`

Elimina propiedades sin decoradores (previene vulnerabilidades de asignación masiva).

- **Tipo:** `boolean`
- **Por defecto:** `true`
- **Ejemplo:**

```typescript
validation({
  whitelist: true  // Elimina propiedades desconocidas
})
```

**Nota de seguridad:** Habilitado por defecto para prevenir ataques de asignación masiva. Cuando es `true`, solo se mantienen las propiedades con decoradores class-validator. Las propiedades desconocidas se eliminan silenciosamente.

### `forbidNonWhitelisted`

Lanza error si propiedades no permitidas están presentes (modo estricto).

- **Tipo:** `boolean`
- **Por defecto:** `false`
- **Ejemplo:**

```typescript
validation({
  whitelist: true,
  forbidNonWhitelisted: true  // Lanza error en lugar de eliminar
})
```

**Caso de uso:** APIs estrictas donde los clientes deben enviar DTO exactos. Retorna error 400 si propiedades desconocidas están presentes en lugar de eliminarlas silenciosamente. Útil para detectar bugs de cliente temprano.

### `stopAtFirstError`

Detiene la validación en el primer error (optimización de rendimiento).

- **Tipo:** `boolean`
- **Por defecto:** `false`
- **Ejemplo:**

```typescript
validation({
  stopAtFirstError: true  // Modo fail-fast
})
```

**Caso de uso:** Usar para endpoints de alto tráfico donde no se requieren detalles completos de error. Los clientes reciben mensajes de error menos detallados (solo el primer error), pero la validación es más rápida.

### `groups`

Grupos de validación para reglas de validación condicionales.

- **Tipo:** `string[]`
- **Por defecto:** `undefined`
- **Ejemplo:**

```typescript
// DTO con grupos
class UpdateUserDto {
  @IsEmail({ groups: ['admin'] })
  email?: string;

  @IsString({ groups: ['user', 'admin'] })
  name?: string;
}

// Aplicar validación específica del grupo
validation({ groups: ['admin'] })
```

**Caso de uso:** Pasa grupos a class-validator para validación condicional. Ver [documentación de grupos class-validator](https://github.com/typestack/class-validator#validation-groups) para detalles.

## Configuración por defecto

El pipe usa valores por defecto listos para producción:

```typescript
{
  whitelist: true,              // Elimina propiedades desconocidas
  forbidNonWhitelisted: false,  // Modo permisivo (eliminar en lugar de error)
  stopAtFirstError: false,      // Obtener todos los errores
  groups: []                    // Sin grupos
}
```

## Cómo funciona

El pipe de validación se ejecuta automáticamente para parámetros `@Body()` y `@Query()`:

1. **Omite tipos nativos** - Evita `String`, `Number`, `Boolean`, `Array`, `Object` (ya type-casted por YasuiJS)
2. **Transforma** - Convierte objeto plano a instancia de clase DTO usando `class-transformer`
3. **Valida** - Ejecuta decoradores class-validator en la instancia
4. **Whitelist** - Elimina propiedades sin decoradores (si `whitelist: true`)
5. **Lanza o retorna** - Lanza `ValidationException` (estado 400) en fallo, retorna instancia en éxito

El pipe omite automáticamente `@Param()`, `@Header()`, etc. porque YasuiJS ya los type-casta usando metadatos de TypeScript.

## Detalles técnicos

El pipe se integra con el sistema de pipes de YasuiJS. Ver [Referencia de Pipes](/es/reference/pipes) para patrones de uso (pipes globales, por ruta con `@UsePipes()`, etc.).

Cuando la validación falla, el pipe lanza `ValidationException` (extiende `HttpError`) con código de estado 400. YasuiJS automáticamente maneja la excepción y retorna una respuesta de error.

## Ver también

- [Referencia de Pipes](/es/reference/pipes) - Aprende sobre el sistema de pipes de YasuiJS
- [Manejo de errores](/es/reference/error-handling) - Maneja errores de validación correctamente
- [class-validator](https://github.com/typestack/class-validator) - Documentación de decoradores de validación
- [class-transformer](https://github.com/typestack/class-transformer) - Documentación de transformación de tipos
