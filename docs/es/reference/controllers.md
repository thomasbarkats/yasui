# Controladores

Los controladores son los puntos de entrada de tu API. Definen endpoints HTTP y manejan las solicitudes entrantes extrayendo datos, llamando a la lógica de negocio y devolviendo respuestas.

## Descripción General

En YasuiJS, los controladores son clases decoradas con `@Controller()` que agrupan endpoints relacionados. Cada método en un controlador representa un endpoint HTTP, definido usando decoradores de método como `@Get()`, `@Post()`, etc.

Los métodos del controlador pueden simplemente devolver cualquier valor, que será automáticamente serializado a JSON con un código de estado 200. Para mayor control, puedes acceder al objeto de respuesta Express directamente usando `@Res()` y usar métodos nativos de Express como `res.json()`, `res.status()`, o `res.sendFile()`.

```typescript
import { Controller, Get, Post } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] }; // Automáticamente devuelve JSON
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

YasuiJS proporciona decoradores para todos los métodos HTTP estándar. Cada decorador toma un parámetro de ruta (requerido) y parámetros opcionales de middleware.

- `@Get(path, ...middlewares)` - Maneja peticiones GET
- `@Post(path, ...middlewares)` - Maneja peticiones POST
- `@Put(path, ...middlewares)` - Maneja peticiones PUT
- `@Delete(path, ...middlewares)` - Maneja peticiones DELETE
- `@Patch(path, ...middlewares)` - Maneja peticiones PATCH

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

Extrae datos de las peticiones HTTP usando decoradores de parámetros. YasuiJS transforma automáticamente los parámetros basándose en sus tipos TypeScript para una mejor seguridad de tipos.

### Extraer Cuerpo de la Petición

`@Body(name?)` - Extrae datos del cuerpo de la petición

```typescript
@Controller('/api/users')
export class UserController {
  @Post('/')
  createUser(@Body() userData: any) {
    // Extrae todo el cuerpo de la petición
    return { created: userData };
  }

  @Post('/partial')
  updateUser(@Body('name') name: string) {
    // Extrae un campo específico del cuerpo
    return { updatedName: name };
  }
}
```

### Extraer Parámetros y Cabeceras

- `@Param(name, items?)` - Extrae parámetros de ruta
- `@Query(name, items?)` - Extrae parámetros de consulta
- `@Header(name, items?)` - Extrae cabeceras de la petición

Los parámetros se transforman automáticamente según sus tipos TypeScript. Para arrays con tipos no string, debes especificar el tipo de elemento como segundo parámetro:

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
    // version: number (cabecera convertida a número)
    // filters: boolean[] (desde ?filters=true&filters=false&filters=1)
    // settings: object (desde ?settings={"theme":"dark"} - JSON parseado, null si falla)
    return { page, active, tags, priorities };
  }
}
```

## Conversión Automática de Tipos de Parámetros

YasuiJS convierte automáticamente los parámetros según los tipos de TypeScript:

### Tipos Básicos
- **string** - Sin conversión (por defecto)
- **number** - Convierte a número, devuelve NaN si es inválido
- **boolean** - Convierte "true"/"1" a true, todo lo demás a false
- **Date** - Convierte a objeto Date, devuelve Invalid Date si es inválido
- **object** - Parsea strings JSON para consultas como `?data={"key":"value"}`, devuelve `null` si falla

### Tipos Array
TypeScript no puede detectar tipos de elementos de array en tiempo de ejecución, así que debes especificar `[Type]` para arrays no string:

- **string[]** - No necesita configuración adicional (comportamiento por defecto)
- **arrays de number, boolean, o Date** - Debe especificarse el tipo de elemento usando el segundo parámetro

**Sintaxis de Array Tipado:**
```typescript
@Query('paramName', [Type]) paramName: Type[]
@Param('paramName', [Type]) paramName: Type[]  
@Header('headerName', [Type]) headerName: Type[]
```

## Acceso al Objeto Request

- `@Req()` - Accede al objeto Request de Express
- `@Res()` - Accede al objeto Response de Express
- `@Next()` - Accede a la función Next de Express

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

## Manejo de Respuestas

YasuiJS maneja automáticamente la serialización de respuestas y códigos de estado.

### Respuestas JSON Automáticas

Devuelve cualquier dato y será automáticamente serializado a JSON:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // Automáticamente devuelve JSON con estado 200
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

`@HttpStatus(code)` - Establece código de estado HTTP personalizado

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

Para control completo, usa el objeto response de Express:

```typescript
import { Response } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/custom')
  customResponse(@Res() res: Response) {
    res.status(418).json({
      message: "Soy una tetera",
      custom: true
    });
    // No devuelvas nada cuando uses res directamente
  }
}
```

## Manejo de Errores

Deja que el framework maneje los errores automáticamente o lanza errores personalizados. Para detalles completos sobre manejo de errores, ver [Manejo de Errores](/es/reference/error-handling).