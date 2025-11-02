# Documentación de API (Swagger)

YasuiJS proporciona generación de documentación OpenAPI con integración opcional de Swagger UI. Genera automáticamente documentación a partir de tus decoradores existentes y te permite mejorarla con metadatos adicionales.

## Configuración

### Configuración Básica

Habilita Swagger agregando configuración a tu aplicación. YasuiJS genera documentación a partir de tus controladores, rutas y decoradores.

Los assets de Swagger UI se sirven desde CDN por defecto - **no se necesitan paquetes adicionales**.

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',
    info: {
      title: 'Mi API',
      version: '1.0.0',
    },
  }
});
```

La documentación será accesible por defecto en `/api-docs` si no se especifica una ruta personalizada, y la especificación JSON en `/<path>/swagger.json`.

### Configuración de CDN

Por defecto, YasuiJS carga los assets de Swagger UI desde el CDN jsDelivr (`https://cdn.jsdelivr.net/npm/swagger-ui-dist@5`). Puedes personalizar la fuente CDN o usar assets auto-alojados:

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',

    // Usar CDN alternativo (unpkg)
    cdn: 'https://unpkg.com/swagger-ui-dist@5',

    // O fijar a una versión específica
    // cdn: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0',

    // O usar assets auto-alojados
    // cdn: '/swagger-ui',

    info: {
      title: 'Mi API',
      version: '1.0.0',
    },
  }
});
```

**Beneficios del CDN:**
- ✅ Cero instalación - funciona inmediatamente
- ✅ Funciona en todos los runtimes (Node.js, Deno, Bun, entornos edge)
- ✅ Sin dependencias del sistema de archivos
- ✅ Siempre actualizado con la última versión de Swagger UI

**Casos de uso de CDN personalizado:**
- **CDN alternativo**: Usar unpkg u otros proveedores de CDN
- **Versión específica**: Fijar a una versión particular de Swagger UI
- **CDN regional**: Usar un CDN más rápido para tu región
- **Auto-alojado**: Servir assets desde tu propio servidor o CDN
- **Offline/air-gapped**: Desplegar con assets locales en entornos restringidos

### Documentación Auto-Generada

YasuiJS genera automáticamente documentación básica a partir de tus controladores existentes y decoradores de ruta, incluso sin ningún decorador específico de Swagger. El framework detecta:
- **Parámetros**: Los parámetros de ruta, parámetros de consulta y encabezados se detectan automáticamente con tipo `string` por defecto
- **Cuerpo de solicitud**: Se detecta automáticamente cuando está presente con esquema `{}` por defecto
- **Respuestas**: Solo se detecta el código de estado 200 (o el estado por defecto si `@HttpStatus` está presente) sin información de esquema

Las siguientes secciones describen cómo mejorar esta documentación con metadatos adicionales y tipado preciso.

### Configuración Completa

Todas las propiedades estándar de la especificación OpenAPI 3.0 son compatibles y opcionales. El framework maneja automáticamente la generación de `openapi`, `paths` y `components` basándose en tus decoradores.

<details>
<summary>Ver ejemplo completo con todas las opciones de configuración</summary>

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',
    // Objeto Info de OpenAPI
    info: {
      title: 'API de Gestión de Usuarios',
      version: '2.1.0',
      description: 'API completa para operaciones de gestión de usuarios',
      termsOfService: 'https://example.com/terms',
      contact: {
        name: 'Soporte de API',
        url: 'https://example.com/support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    // Documentación Externa
    externalDocs: {
      description: 'Encuentra más información aquí',
      url: 'https://example.com/docs'
    },
    // Información del Servidor
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: 'Servidor de producción',
        variables: {
          version: {
            default: 'v1',
            enum: ['v1', 'v2'],
            description: 'Versión de API'
          }
        }
      },
      {
        url: 'https://staging.example.com/v1',
        description: 'Servidor de staging'
      }
    ],
    // Requisitos de Seguridad Globales
    security: [
      { bearerAuth: [] },
      { apiKeyAuth: [] }
    ],
    // Etiquetas Globales
    tags: [
      {
        name: 'users',
        description: 'Operaciones de gestión de usuarios',
        externalDocs: {
          description: 'Descubre más',
          url: 'https://example.com/docs/users'
        }
      }
    ]
  }
});
```

</details>

## Definición de Esquemas

YasuiJS utiliza clases de TypeScript con decoradores de propiedades para definir esquemas de API. Las propiedades se infieren automáticamente de los metadatos de TypeScript cuando se usan decoradores sin parámetros.

Los esquemas se registran automáticamente si se usan en cualquier decorador.

### `@ApiProperty(definition?)`
Define una propiedad, requerida por defecto. Soporta múltiples formatos de definición:

```typescript
export class CreateUserDto {
  @ApiProperty() // Tipo inferido de TypeScript
  name: string;

  @ApiProperty([String]) // Array de primitivos
  tags: string[];

  @ApiProperty(AddressDto) // Referencia a otra clase
  address: AddressDto;

  @ApiProperty([AddressDto]) // Array de referencias de clase
  previousAddresses: AddressDto[];

  @ApiProperty({ enum: ['admin', 'user'] }) // Valores enum
  role: string;

  @ApiProperty({ enum: UserStatus }) // Enum de TypeScript
  status: UserStatus;

  // Esquema OpenAPI, personalización completa
  @ApiProperty({ type: 'string', format: 'email' }) 
  username: string;

  @ApiProperty({
    theme: String,
    preferences: PreferencesDto,
    categories: [String],
    addresses: [AddressDto]
  }) // Registro de usos previamente listados
  settings: any;
}
```

Solo los tipos primitivos pueden inferirse de los metadatos de TypeScript. Los tipos complejos (incluyendo arrays) tendrán por defecto `{ type: 'object' }`. Para tipado específico, usa los formatos de definición explícitos mostrados arriba.

### `@ApiPropertyOptional(definition?)`
Equivalente a `@ApiProperty({ required: false })`

```typescript
@ApiPropertyOptional()
description?: string;

@ApiPropertyOptional({ enum: ['small', 'medium', 'large'] })
size?: string;
```

### `@ApiSchema(name)`
Define un nombre de esquema personalizado. El nombre por defecto es el nombre de la clase. Los nombres de esquema deben ser únicos.

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
Documenta el esquema del cuerpo de solicitud. El tipo de contenido por defecto es `application/json`.

```typescript
@Post('/users')
@ApiBody('Datos de usuario', CreateUserDto)
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
@ApiOperation('Crear usuario', 'Crea una nueva cuenta de usuario', ['users'])
createUser() {}
```

### Documentación de Parámetros
- `@ApiParam(name, description?, required?, definition?)` - Parámetros de ruta
- `@ApiQuery(name, description?, required?, definition?)` - Parámetros de consulta  
- `@ApiHeader(name, description?, required?, definition?)` - Encabezados

Todos los formatos de definición descritos para `@ApiProperty` y decoradores anteriores son compatibles, pero ten en cuenta que usos complejos (objetos, arrays, referencias de clase, etc.) pueden no tener sentido dependiendo de la naturaleza del decorador, aunque el esquema OpenAPI se generará correctamente.

```typescript
@Get('/users/:id')
@ApiParam('id', 'ID de Usuario', true, Number)
@ApiQuery('include', 'Incluir datos relacionados', false, Boolean)
@ApiHeader('Authorization', 'Token Bearer', true) // String por defecto
getUser(
  @Param('id') id: number,
  @Query('include') include?: boolean
) {}
```

## Respuestas de Error

### `@ApiErrorResponse(statusCode, description?, ErrorDataClass?)`
Documenta respuestas de error con el formato de wrapper de error de YasuiJS. Este decorador incluye automáticamente la estructura completa del esquema de error del framework que envuelve todos los errores en tu aplicación.

```typescript
@Get('/users/:id')
@ApiErrorResponse(404, 'Usuario no encontrado')
@ApiErrorResponse(500, 'Error interno del servidor')
getUser(@Param('id') id: string) {}
```

Cuando tienes clases de error personalizadas que extienden `HttpError`, puedes mejorarlas con decoradores `@ApiProperty` y `@ApiPropertyOptional` para documentar sus propiedades específicas. El esquema resultante fusionará los datos de tu error personalizado con el wrapper de error estándar de YasuiJS:

```typescript
@Post('/users')
@ApiErrorResponse(400, 'Validación fallida', ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}

// También posible solo con referencia de clase (la descripción será el nombre del esquema)
@Post('/users')
@ApiErrorResponse(400, ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}
```

### Enfoque alternativo
Si prefieres documentación de errores más simple sin el formato completo de wrapper, puedes continuar usando el decorador estándar `@ApiResponse` descrito anteriormente. Con `@ApiResponse`, si pasas una clase de error personalizada que extiende HttpError, solo obtendrás el esquema de esa clase específica sin heredar ninguna definición de API.

## Funciones de Utilidad

### `resolveSchema(schema: ApiPropertyDefinition): OpenAPISchema`
Resuelve manualmente cualquier definición de esquema (ver formatos descritos en la sección @ApiProperty) al formato OpenAPI. Útil para casos de uso específicos.

```typescript
import { resolveSchema } from 'yasui';
const schema = resolveSchema(CreateUserDto);
```