# Documentación de API (Swagger)

YasuiJS proporciona generación de documentación OpenAPI con integración opcional de Swagger UI. Genera automáticamente documentación a partir de tus decoradores existentes y te permite mejorarla con metadatos adicionales.

## Configuración

### Configuración Básica

Habilita Swagger agregando configuración a tu aplicación. YasuiJS genera documentación a partir de tus controladores, rutas y decoradores.

**Nota**: Necesitas instalar `swagger-ui-express` por separado:
```bash
npm install swagger-ui-express
```

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: { enabled: true }
});
```

La documentación será accesible en `/api-docs` (ruta predeterminada) y la especificación JSON en `/api-docs/swagger.json`.

YasuiJS genera automáticamente documentación básica a partir de tus controladores y decoradores de ruta existentes, incluso sin decoradores específicos de Swagger. El framework detecta:
- **Parámetros**: Los parámetros de ruta, parámetros de consulta y encabezados se detectan automáticamente con tipo `string` por defecto
- **Cuerpo de la solicitud**: Se detecta automáticamente cuando está presente con esquema `{}` por defecto
- **Respuestas**: Solo se detecta el código de estado 200 (o el estado predeterminado si `@HttpStatus` está presente) sin información de esquema

Las siguientes secciones describen cómo mejorar esta documentación con metadatos adicionales y tipado preciso.

### Configuración Completa

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    enabled: true,
    path: '/docs', // Ruta personalizada, especificación JSON en `/docs/swagger.json`
    info: {
      title: 'API de Gestión de Usuarios',
      version: '2.1.0',
      description: 'API completa para operaciones de gestión de usuarios',
    },
  }
});
```

## Definición de Esquema

YasuiJS utiliza clases TypeScript con decoradores de propiedades para definir esquemas de API. Las propiedades se infieren automáticamente de los metadatos de TypeScript cuando se usan decoradores sin parámetros.

Los esquemas se registran automáticamente si se utilizan en cualquier decorador.

### `@ApiProperty(definition?)`
Define una propiedad, requerida por defecto. Admite múltiples formatos de definición:

```typescript
export class CreateUserDto {
  @ApiProperty() // Tipo inferido de TypeScript
  name: string;

  @ApiProperty({ type: 'string', format: 'email' }) // Esquema OpenAPI, personalización completa
  username: string;

  @ApiProperty({ enum: ['admin', 'user', 'moderator'] }) // Valores enum
  role: string;

  @ApiProperty({ enum: UserStatus }) // Enum de TypeScript
  status: UserStatus;

  @ApiProperty([String]) // Array de primitivos
  tags: string[];

  @ApiProperty(AddressDto) // Referencia a otra clase
  address: AddressDto;

  @ApiProperty([AddressDto]) // Array de referencias de clase
  previousAddresses: AddressDto[];

  @ApiProperty({
    theme: String,
    preferences: PreferencesDto,
    categories: [String],
    addresses: [AddressDto]
  }) // Registro de usos previamente listados
  settings: any;
}
```

Solo los tipos primitivos pueden ser inferidos de los metadatos de TypeScript. Los tipos complejos (incluyendo arrays) tendrán por defecto `{ type: 'object' }`. Para tipado específico, usa los formatos de definición explícitos mostrados arriba.

### `@ApiPropertyOptional(definition?)`
Equivalente a `@ApiProperty({ required: false })`

```typescript
@ApiPropertyOptional()
description?: string;

@ApiPropertyOptional({ enum: ['small', 'medium', 'large'] })
size?: string;
```

### `@ApiSchema(name)`
Define un nombre de esquema personalizado. El nombre predeterminado es el nombre de la clase. Los nombres de esquema deben ser únicos.

```typescript
@ApiSchema('Solicitud de Crear Usuario')
export class CreateUserDto {
  @ApiProperty()
  name: string;
}
```

### Alias
- `@AP()` - Alias para `@ApiProperty()`
- `@APO()` - Alias para `@ApiPropertyOptional()`

## Documentación de Endpoints

### `@ApiBody(description?, definition?, contentType?)`
Documenta el esquema del cuerpo de la solicitud. El tipo de contenido predeterminado es `application/json`.

```typescript
@Post('/users')
@ApiBody('Datos del usuario', CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```
Todos los formatos de definición descritos para @ApiProperty (esquema OpenAPI, Array de primitivos, Array de referencias de clase, Record, Enum...) son válidos para @ApiBody. Los esquemas de cualquier clase se resolverán automáticamente.

También es posible usar @ApiBody solo con referencia de clase sin descripción (será el nombre del esquema en este caso).
```ts
@Post('/users')
@ApiBody(CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```

### `@ApiResponse(statusCode, description?, definition?)`
Documenta las respuestas del endpoint.

```typescript
@Get('/users')
@ApiResponse(200, 'Usuarios', [UserDto])
getUsers() {}
```
Todos los formatos de definición descritos para @ApiProperty (esquema OpenAPI, Array de primitivos, Array de referencias de clase, Record, Enum...) son válidos para @ApiResponse. Los esquemas de cualquier clase se resolverán automáticamente.

También es posible usar @ApiResponse solo con referencia de clase sin descripción (será el nombre del esquema en este caso).
```typescript
@Get('/users/:id')
@ApiResponse(200, UserDto)
getUser(@Param('id') id: string) {}
```

### `@ApiOperation(summary, description?, tags?)`
Describe la operación del endpoint.

```typescript
@Get('/users')
@ApiOperation('Obtener todos los usuarios')
getUsers() {}

@Post('/users')
@ApiOperation('Crear usuario', 'Crea una nueva cuenta de usuario', ['usuarios'])
createUser() {}
```

### Documentación de Parámetros
- `@ApiParam(name, description?, required?, definition?)` - Parámetros de ruta
- `@ApiQuery(name, description?, required?, definition?)` - Parámetros de consulta
- `@ApiHeader(name, description?, required?, definition?)` - Encabezados

Todos los formatos de definición descritos para `@ApiProperty` y decoradores anteriores son compatibles, pero ten en cuenta que los usos complejos (objetos, arrays, referencias de clase, etc.) pueden no tener sentido según la naturaleza del decorador, aunque el esquema OpenAPI se generará correctamente.

```typescript
@Get('/users/:id')
@ApiParam('id', 'ID del usuario', true, Number)
@ApiQuery('include', 'Incluir datos relacionados', false, Boolean)
@ApiHeader('Authorization', 'Token Bearer', true) // String por defecto
getUser(
  @Param('id') id: number,
  @Query('include') include?: boolean
) {}
```

## Respuestas de Error

### `@ApiErrorResponse(statusCode, description?, ErrorDataClass?)`
Documenta respuestas de error con el formato del envoltorio de error de YasuiJS. Este decorador incluye automáticamente la estructura completa del esquema de error del framework que envuelve todos los errores en tu aplicación.

```typescript
@Get('/users/:id')
@ApiErrorResponse(404, 'Usuario no encontrado')
@ApiErrorResponse(500, 'Error interno del servidor')
getUser(@Param('id') id: string) {}
```

Cuando tienes clases de error personalizadas que extienden `HttpError`, puedes mejorarlas con los decoradores `@ApiProperty` y `@ApiPropertyOptional` para documentar sus propiedades específicas. El esquema resultante combinará tus datos de error personalizados con el envoltorio de error estándar de YasuiJS:

```typescript
@Post('/users')
@ApiErrorResponse(400, 'Fallo en la validación', ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}

// También es posible solo con referencia de clase (la descripción será el nombre del esquema)
@Post('/users')
@ApiErrorResponse(400, ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}
```

### Enfoque alternativo
Si prefieres una documentación de errores más simple sin el formato completo del envoltorio, puedes continuar usando el decorador estándar `@ApiResponse` descrito anteriormente. Con `@ApiResponse`, si pasas una clase de error personalizada que extiende HttpError, solo obtendrás el esquema de esa clase específica sin heredar ninguna definición de API.

## Funciones de Utilidad

### `resolveSchema(schema: ApiPropertyDefinition): OpenAPISchema`
Resuelve manualmente cualquier definición de esquema (ver formatos descritos en la sección @ApiProperty) al formato OpenAPI. Útil para casos de uso específicos.

```typescript
import { resolveSchema } from 'yasui';
const schema = resolveSchema(CreateUserDto);
```