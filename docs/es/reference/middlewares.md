# Middlewares

Los middlewares procesan las solicitudes en un pipeline antes de que lleguen a sus controladores. Manejan preocupaciones transversales como autenticación, registro, validación y transformación de solicitudes.

## Descripción General

YasuiJS admite dos tipos de middlewares:
- **Middlewares basados en clases** usando el decorador `@Middleware()`
- **Funciones Express RequestHandler** para compatibilidad con middlewares Express existentes

Los middlewares se pueden aplicar en tres niveles con diferentes prioridades de ejecución:
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

## Middlewares Basados en Clases

### Decorador Middleware

El decorador `@Middleware()` marca una clase como middleware. La clase debe implementar un método `use()`. Opcionalmente puede implementar la interfaz `IMiddleware` proporcionada por YasuiJS para forzar la firma del método.

```typescript
import { Middleware, IMiddleware, Request, Response, Req, Res } from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    // Lógica de validación del token aquí

    // Continuará al siguiente middleware o lógica del controlador si no devuelve nada/void
  }
}
```

### Decoradores de Parámetros en Middlewares

Los middlewares pueden usar los mismos decoradores de parámetros que los controladores y beneficiarse también de la captura automática de errores:

```typescript
@Middleware()
export class ValidationMiddleware {
  use(
    @Body() body: any,
    @Query('validate') shouldValidate: boolean,
    @Header('content-type') contentType: string
  ) {
    if (shouldValidate && !this.isValid(body)) {
      throw new HttpError(400, 'Datos de solicitud inválidos');
    }
  }

  private isValid(data: any): boolean {
    // Lógica de validación
    return true;
  }
}
```

### Inyección de Dependencias

Como las clases Middleware actúan como Controladores, también permiten la inyección de dependencias de la misma manera:

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
      throw new HttpError(400, 'Datos de solicitud inválidos');
    }
  }
}
```

## Middlewares Express RequestHandler

Puede usar funciones middleware estándar de Express directamente:

```typescript
import cors from 'cors';
import helmet from 'helmet';

yasui.createServer({
  middlewares: [
    cors(),
    helmet(),
  ]
});
```

## Niveles de Uso de Middleware

### Nivel de Aplicación

Aplicado a todas las solicitudes en toda su aplicación:

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
  // Todas las rutas tienen autenticación + validación
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
    // Ambos middlewares de autenticación y validación
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