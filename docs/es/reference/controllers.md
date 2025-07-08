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

  @Post('/')
  createUser() {
    return { message: 'Usuario creado' }; // Automáticamente devuelve JSON
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
import { AuthMiddleware } from './middleware/auth.middleware';

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

  @Get('/:id')
  getUser() {
    return { user: {} };
  }

  @Post('/')
  createUser() {
    return { message: 'Usuario creado' };
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

### Parámetros de Ruta

Usa parámetros de ruta al estilo Express en tus rutas:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser() {
    // Ruta: GET /api/users/123
  }

  @Get('/:id/posts/:postId')
  getUserPost() {
    // Ruta: GET /api/users/123/posts/456
  }

  @Get('/search/:category?')
  searchUsers() {
    // Ruta: GET /api/users/search o /api/users/search/admin
  }
}
```

### Middleware a Nivel de Ruta

Aplica middleware a rutas específicas. Aprende más en [Middlewares](/es/reference/middlewares).

```typescript
import { ValidationMiddleware, AuthMiddleware } from './middleware';

@Controller('/api/users')
export class UserController {
  @Get('/', ValidationMiddleware)
  getAllUsers() {
    // Solo esta ruta tiene ValidationMiddleware
  }

  @Post('/', AuthMiddleware, ValidationMiddleware)
  createUser() {
    // Esta ruta tiene ambos middlewares
  }
}
```

## Decoradores de Parámetros

Extrae datos de las peticiones HTTP usando decoradores de parámetros. Todos los decoradores de parámetros pueden usarse con o sin un nombre de parámetro para extraer valores específicos u objetos completos.

### Acceso al Objeto Request

- `@Req()` - Accede al objeto Request de Express (sin parámetros)
- `@Res()` - Accede al objeto Response de Express (sin parámetros)
- `@Next()` - Accede a NextFunction de Express (sin parámetros)

Accede a los objetos request, response y next de Express:

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
    // Acceso directo a objetos Express
    console.log(request.url);
    return { users: [] };
  }
}
```

### Extraer Parámetros de Ruta

- `@Param(name?)` - Extrae parámetros de ruta (nombre de parámetro opcional)

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    // Extrae parámetro específico
    return { userId: id };
  }

  @Get('/:id/posts/:postId')
  getUserPost(
    @Param('id') userId: string,
    @Param('postId') postId: string
  ) {
    // Extrae múltiples parámetros
    return { userId, postId };
  }

  @Get('/all')
  getAllWithParams(@Param() params: any) {
    // Obtiene todos los parámetros de ruta como objeto
    return { params };
  }
}
```

### Extraer Parámetros de Consulta

- `@Query(name?)` - Extrae parámetros de consulta (nombre de parámetro opcional)

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    // Extrae parámetros de consulta específicos con valores por defecto
    return { page, limit };
  }

  @Get('/search')
  searchUsers(@Query() query: any) {
    // Obtiene todos los parámetros de consulta como objeto
    return { searchParams: query };
  }
}
```

### Extraer Cuerpo de la Petición

- `@Body(name?)` - Extrae datos del cuerpo de la petición (nombre de parámetro opcional)

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
    // Extrae campo específico del cuerpo
    return { updatedName: name };
  }
}
```

### Extraer Cabeceras

- `@Header(name?)` - Extrae cabeceras de la petición (nombre de parámetro opcional)

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Header('authorization') auth: string) {
    // Extrae cabecera específica
    return { authHeader: auth };
  }

  @Get('/all-headers')
  getUsersWithHeaders(@Header() headers: any) {
    // Obtiene todas las cabeceras como objeto
    return { headers };
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
    return { users: ['Juan', 'Ana'] };
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

- `@HttpStatus(code)` - Establece código de estado HTTP personalizado (parámetro de código de estado requerido, acepta número o enum HttpCode)

Usa el decorador `@HttpStatus()` para establecer códigos de estado personalizados:

```typescript
import { HttpStatus, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Post('/')
  @HttpStatus(201) // Usando número
  createUser(@Body() userData: any) {
    // Devuelve con estado 201 Created
    return { created: userData };
  }

  @Post('/alt')
  @HttpStatus(HttpCode.CREATED) // Usando enum HttpCode
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
import { Response } from 'express';

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

  @Get('/file')
  downloadFile(@Res() res: Response) {
    res.download('/ruta/al/archivo.pdf');
  }
}
```

## Manejo de Errores

Deja que el framework maneje los errores automáticamente o lanza errores personalizados. Para detalles completos sobre manejo de errores, ver [Manejo de Errores](/es/reference/error-handling).

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.findById(id);
    
    if (!user) {
      // Lanza error HTTP personalizado
      throw new HttpError(HttpCode.NOT_FOUND, 'Usuario no encontrado');
    }
    
    return user;
  }
}
```