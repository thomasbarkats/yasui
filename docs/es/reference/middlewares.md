# Middlewares

Los middlewares procesan las solicitudes en un pipeline antes de que lleguen a tus controladores. Manejan preocupaciones transversales como autenticación, logging, validación y transformación de solicitudes.

## Descripción General

YasuiJS soporta dos tipos de middlewares, ambos construidos sobre Web Standards y compatibles con todos los runtimes (Node.js, Deno, Bun):

1. **Middlewares basados en clases** - Usan el decorador `@Middleware()` con soporte de inyección de dependencias
2. **Middlewares funcionales** - Funciones simples que siguen el patrón `Request → Response` de Web Standards

**Importante**: YasuiJS 4.x utiliza Web Standards Request/Response en lugar de Express. Los middlewares estilo Express (como `cors`, `helmet`, etc.) **no son compatibles**. Usa alternativas compatibles con Web Standards o escribe middlewares nativos de YasuiJS.

Los middlewares pueden aplicarse en tres niveles con diferentes prioridades de ejecución:
1. **Nivel de aplicación** - Aplicado a todas las solicitudes
2. **Nivel de controlador** - Aplicado a todas las rutas en un controlador
3. **Nivel de endpoint** - Aplicado a rutas específicas

```typescript
import { Middleware } from 'yasui';

@Middleware()
export class LoggingMiddleware {
  use() {
    console.log('Request received');
  }
}
```

## Middlewares Funcionales

Los middlewares funcionales son funciones simples que siguen el patrón `Request → Response` de Web Standards. Son perfectos para integraciones de terceros, operaciones sin estado o cuando no necesitas inyección de dependencias.

```typescript
import type { YasuiRequest, RequestHandler, NextFunction } from 'yasui';

export function simpleLogger(): RequestHandler {
  return async (req: YasuiRequest, next?: NextFunction): Promise<Response> => {
    console.log(`${req.method} ${req.path}`);
    return next ? next() : new Response(null, { status: 500 });
  };
}

// Uso
yasui.createServer({
  middlewares: [simpleLogger()],
  controllers: [UserController]
});
```

**Compatibilidad con terceros:** Los middlewares funcionales funcionan con cualquier biblioteca que proporcione handlers compatibles con Web Standards, como bibliotecas de autenticación (ej. `auth.handler()` de BetterAuth), plugins oficiales, o handlers fetch personalizados.

**Cuándo usarlos:**
- Integraciones de terceros (BetterAuth, etc.)
- Operaciones sin estado (logging, CORS, limitación de tasa)
- No se necesita inyección de dependencias

**Cuándo usar clases:**
- Necesitas inyección de dependencias (`@Inject()`)
- Acceso a servicios/base de datos
- Lógica de negocio compleja con estado compartido

## Middlewares Basados en Clases

### Decorador Middleware

El decorador `@Middleware()` marca una clase como middleware. La clase debe implementar un método `use()`. Opcionalmente puedes implementar la interfaz `IMiddleware` proporcionada por YasuiJS para forzar la firma del método.

```typescript
import { Middleware, IMiddleware, Request, Req } from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(@Req() req: Request) {
    const token = req.rawHeaders.get('authorization');

    if (!token) {
      throw new HttpError(401, 'Unauthorized');
    }
    // Lógica de validación de token aquí

    // Continuará al siguiente middleware o controlador si no retornas nada/void
  }
}
```

**Nota:** Los middlewares funcionan como métodos de controlador - puedes retornar valores, lanzar errores, o no retornar nada para continuar. Usar `@Next()` es opcional si necesitas control manual sobre el flujo de ejecución.

### Decoradores de Parámetros en Middlewares

Los middlewares pueden usar los mismos decoradores de parámetros que los controladores y también se benefician de la captura automática de errores:

```typescript
@Middleware()
export class ValidationMiddleware {
  use(
    @Body() body: any,
    @Query('validate') shouldValidate: boolean,
    @Header('content-type') contentType: string
  ) {
    if (shouldValidate && !this.isValid(body)) {
      throw new HttpError(400, 'Invalid request data');
    }
  }

  private isValid(data: any): boolean {
    // Lógica de validación
    return true;
  }
}
```

**Conversión Automática de Tipos:** Todos los decoradores de parámetros en middlewares se benefician de la misma conversión automática de tipos que los controladores. Los parámetros se convierten a sus tipos especificados antes de la ejecución del middleware.

### Inyección de Dependencias

Como las clases Middleware actúan como Controladores, también permiten inyección de dependencias de la misma manera:

```typescript
@Middleware()
export class LoggingMiddleware {
  constructor (
    private validationService: ValidationService, // Inyección estándar
    @Inject('CONFIG') private config: AppConfig, // Inyección personalizada pre-registrada
  ) {}

  use(
    @Body() body: any,
    @Inject() anotherService: AnotherService, // Lo mismo a nivel de método
  ) {
    if (!this.validationService.isValid(body)) {
      throw new HttpError(400, 'Invalid request data');
    }
  }
}
```

## Escribiendo Middlewares Personalizados

Puedes crear middlewares para casos de uso comunes. Aquí hay dos patrones:

### Patrón 1: Validación Simple (No se necesita @Next())

```typescript
@Middleware()
export class ApiKeyMiddleware implements IMiddleware {
  use(@Header('x-api-key') apiKey: string) {
    if (!apiKey || apiKey !== 'expected-key') {
      throw new HttpError(401, 'Invalid API key');
    }
    // Continuará automáticamente
  }
}
```

### Patrón 2: Modificación de Respuesta (Usando @Next())

Cuando necesites modificar la respuesta, usa `@Next()`:

```typescript
@Middleware()
export class TimingMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const start = Date.now();
    const response = await next();
    const duration = Date.now() - start;

    const headers = new Headers(response.headers);
    headers.set('X-Response-Time', `${duration}ms`);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
}
```

**Para el manejo de CORS en producción**, utiliza el plugin oficial [`@yasui/cors`](/es/plugins/cors) que proporciona validación de orígenes, manejo de solicitudes preflight, soporte de credenciales y características de seguridad modernas.

## Niveles de Uso de Middleware

### Nivel de Aplicación

Aplicado a todas las solicitudes en toda tu aplicación:

```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [LoggingMiddleware, SecurityMiddleware]
});
```

### Nivel de Controlador

Aplicado a todas las rutas dentro de un controlador específico:

```typescript
// Middleware único
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // Todas las rutas requieren autenticación
}

// Múltiples middlewares
@Controller('/api/admin', AuthMiddleware, ValidationMiddleware)
export class AdminController {
  // Todas las rutas tienen auth + validación
}
```

### Nivel de Endpoint

Aplicado solo a rutas específicas:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // Sin middleware
  }
  
  @Post('/', ValidationMiddleware)
  createUser() {
    // Solo middleware de validación
  }
  
  @Delete('/:id', AuthMiddleware, ValidationMiddleware)
  deleteUser() {
    // Ambos middlewares auth y validación
  }
}
```

## Orden de Ejecución

Los middlewares se ejecutan en este orden:

1. **Middlewares de aplicación** (en orden de registro)
2. **Middlewares de controlador** (en orden de declaración)
3. **Middlewares de endpoint** (en orden de declaración)
4. **Método del controlador**

```typescript
// Ejemplo de orden de ejecución:
yasui.createServer({
  middlewares: [GlobalMiddleware] // 1. Primero
});

@Controller('/users', ControllerMiddleware) // 2. Segundo
export class UserController {
  @Post('/', EndpointMiddleware) // 3. Tercero
  createUser() {
    // 4. Finalmente el método del controlador
  }
}
```