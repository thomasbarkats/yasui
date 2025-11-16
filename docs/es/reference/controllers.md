# Controladores

Los controladores son los puntos de entrada de tu API. Definen endpoints HTTP y manejan las solicitudes entrantes extrayendo datos, llamando lógica de negocio y devolviendo respuestas.

## Descripción General

En YasuiJS, los controladores son clases decoradas con `@Controller()` que agrupan endpoints relacionados. Cada método en un controlador representa un endpoint HTTP, definido usando decoradores de método como `@Get()`, `@Post()`, etc.

Los métodos de controlador pueden simplemente devolver cualquier valor, que será automáticamente serializado a JSON con un código de estado 200. Para control manual de respuesta, puedes devolver un objeto Response de Web Standards directamente.

```typescript
import { Controller, Get, Post } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] }; // Devuelve JSON automáticamente
  }
}
```

## Decorador Controller

El decorador `@Controller()` marca una clase como controlador y define la ruta base para todas sus rutas.

### Uso Básico

```typescript
@Controller('/api/users')
export class UserController {
  // Todas las rutas tendrán el prefijo /api/users
}
```

### Con Middleware

Puedes aplicar middleware a todas las rutas en un controlador. Aprende más en [Middlewares](/es/reference/middlewares).

```typescript
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // Todas las rutas tendrán AuthMiddleware aplicado
}
```

## Decoradores de Métodos HTTP

YasuiJS proporciona decoradores para todos los métodos HTTP estándar. Cada decorador toma un parámetro de ruta (requerido) y parámetros de middleware opcionales.

- `@Get(path, ...middlewares)` - Manejar solicitudes GET
- `@Post(path, ...middlewares)` - Manejar solicitudes POST
- `@Put(path, ...middlewares)` - Manejar solicitudes PUT
- `@Delete(path, ...middlewares)` - Manejar solicitudes DELETE
- `@Patch(path, ...middlewares)` - Manejar solicitudes PATCH

### Rutas Básicas

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] };
  }

  @Post('/')
  createUser() {
    return { message: 'Usuario creado' };
  }

  @Get('/:id')
  getUser() {
    // Usa parámetros de ruta estilo Express en tus rutas:
    // Ruta: GET /api/users/123
    return { user: {} };
  }

  @Put('/:id')
  updateUser() {
    return { message: 'Usuario actualizado' };
  }

  @Delete('/:id')
  deleteUser() {
    return { message: 'Usuario eliminado' };
  }
}
```

### Middleware a Nivel de Ruta

Aplica middleware a rutas específicas. Aprende más en [Middlewares](/es/reference/middlewares).

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/', ValidationMiddleware)
  getAllUsers() {}
}
```

## Decoradores de Parámetros

Extrae datos de solicitudes HTTP usando decoradores de parámetros. YasuiJS transforma automáticamente los parámetros basándose en sus tipos TypeScript para mejor seguridad de tipos.

### Extraer Cuerpo de Solicitud

`@Body(name?)` - Extraer datos del cuerpo de la solicitud

```typescript
@Controller('/api/users')
export class UserController {
  @Post('/')
  createUser(@Body() userData: any) {
    // Extraer todo el cuerpo de la solicitud
    return { created: userData };
  }

  @Post('/partial')
  updateUser(@Body('name') name: string) {
    // Extraer campo específico del cuerpo
    return { updatedName: name };
  }
}
```

### Extraer Parámetros y Encabezados

- `@Param(name, items?)` - Extraer parámetros de ruta
- `@Query(name, items?)` - Extraer parámetros de consulta
- `@Header(name, items?)` - Extraer encabezados de solicitud

Los parámetros se transforman automáticamente basándose en sus tipos TypeScript. Para arrays con tipos no-string, debes especificar el tipo de elemento como segundo parámetro:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: number) {} // Convertido a número.

  @Get('/search/:term')
  searchUsers(
    @Param('term') term: string,
    @Header('x-api-version') version: number,
    @Query('filters', [Boolean]) filters: boolean[],
    @Query('settings') settings: { theme: string } | null,
  ) {
    // version: number (encabezado convertido a número)
    // filters: boolean[] (de ?filters=true&filters=false&filters=1)
    // settings: object (de ?settings={"theme":"dark"} - JSON parseado, null si falla)
    return { page, active, tags, priorities };
  }
}
```

## Conversión Automática de Tipos de Parámetros

YasuiJS convierte automáticamente parámetros basándose en tipos TypeScript:

### Tipos Básicos
- **string** - Sin conversión (por defecto)
- **number** - Convierte a número, devuelve NaN si es inválido
- **boolean** - Convierte "true"/"1" a true, todo lo demás a false
- **Date** - Convierte a objeto Date, devuelve Invalid Date si es inválido
- **object** - Parsea strings JSON para consultas como `?data={"key":"value"}`, devuelve `null` si falla

### Tipos Array
TypeScript no puede detectar tipos de elementos de array en tiempo de ejecución, por lo que debes especificar `[Type]` para arrays no-string:

- **string[]** - No necesita configuración adicional (comportamiento por defecto)
- **arrays de number, boolean, o Date** - Debe especificar el tipo de elemento usando el segundo parámetro

**Sintaxis de Array Tipado:**
```typescript
@Query('paramName', [Type]) paramName: Type[]
@Param('paramName', [Type]) paramName: Type[]  
@Header('headerName', [Type]) headerName: Type[]
```

## Acceso al Objeto Request

`@Req()` - Acceder al objeto Request de YasuiJS (Web Standards Request con propiedades compatibles con Express)

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

**Propiedades de solicitud disponibles:**
- `url` - URL completa de la solicitud
- `method` - Método HTTP (GET, POST, etc.)
- `headers` / `rawHeaders` - Encabezados de solicitud (ver [Acceso a Encabezados](#acceso-a-encabezados))
- `params` - Parámetros de ruta
- `query` - Parámetros de query string
- `cookies` - Cookies parseadas
- `body` - Cuerpo de solicitud parseado
- `path` - Pathname de la solicitud
- `hostname` - Hostname de la solicitud
- `protocol` - Protocolo de solicitud (http/https)
- `ip` - Dirección IP del cliente

### Acceso a Encabezados

YasuiJS proporciona dos formas de acceder a encabezados:

**Estilo Express (objeto plano)**

Para compatibilidad al evitar un cambio incompatible desde v3.
```typescript
@Get('/')
getUsers(@Req() req: Request) {
  const auth = req.headers.authorization;        // Notación de punto
  const type = req.headers['content-type'];      // Notación de corchetes
}
```

**Web Standards Nativos (objeto Headers):**
```typescript
@Get('/')
getUsers(@Req() req: Request) {
  const auth = req.rawHeaders.get('authorization');
  const type = req.rawHeaders.get('content-type');
}
```

**Cuándo usar:**
- `req.headers` - Cuando accedes a múltiples encabezados o prefieres sintaxis estilo Express
- `req.rawHeaders` - Mejor para verificaciones de un solo encabezado, mejor rendimiento (sin conversión de objeto)

### Creación de Decoradores de Solicitud Personalizados

Puedes crear tus propios decoradores para extraer propiedades específicas del objeto de solicitud usando `routeRequestParamDecorator`.

```typescript
import { routeRequestParamDecorator } from 'yasui';

// Crear decorador personalizado para IP de solicitud
export const Ip = routeRequestParamDecorator('ip');

// Usar en controlador
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Ip() ip: string) {
    console.log(`Solicitud desde ${ip}`);
    return { users: [] };
  }
}
```

Este enfoque es preferido sobre usar `@Req()` para acceso a una sola propiedad, ya que:
- Mejora la legibilidad del código
- Habilita seguridad de tipos

Ver [Acceso al Objeto Request](#acceso-al-objeto-request) para la lista completa de propiedades de solicitud disponibles.

## Manejo de Respuestas

YasuiJS maneja automáticamente la serialización de respuestas y códigos de estado.

### Respuestas JSON Automáticas

Devuelve cualquier dato y será automáticamente serializado a JSON:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // Devuelve JSON automáticamente con estado 200
    return { users: ['John', 'Jane'] };
  }

  @Get('/string')
  getString() {
    // Devuelve string como JSON
    return 'Hola Mundo';
  }

  @Get('/number')
  getNumber() {
    // Devuelve número como JSON
    return 42;
  }
}
```

### Códigos de Estado Personalizados

`@HttpStatus(code)` - Establecer código de estado HTTP personalizado

Usa el decorador `@HttpStatus()` para establecer códigos de estado personalizados:

```typescript
import { HttpStatus, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Post('/alt')
  @HttpStatus(201) // Usando número
  createUserAlt(@Body() userData: any) {
    // Devuelve con estado 201 Created
    return { created: userData };
  }

  @Delete('/:id')
  @HttpStatus(HttpCode.NO_CONTENT) // Usando enum HttpCode
  deleteUser(@Param('id') id: string) {
    // Devuelve con estado 204 No Content
    // Puede no devolver nada para 204
  }
}
```

### Manejo Manual de Respuestas

Para control completo, devuelve un objeto Response de Web Standards:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/custom')
  customResponse() {
    return new Response(JSON.stringify({
      message: "Soy una tetera",
      custom: true
    }), {
      status: 418,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  @Get('/text')
  textResponse() {
    return new Response('Respuesta de texto plano', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
```

## Manejo de Errores

Deja que el framework maneje errores automáticamente o lanza errores personalizados. Para detalles completos sobre manejo de errores, consulta [Manejo de Errores](/es/reference/error-handling).