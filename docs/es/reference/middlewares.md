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
import { Middleware, NextFunction } from 'yasui';

@Middleware()
export class LoggingMiddleware {
  use(@Next() next: NextFunction) {
    console.log('Request received');
    next();
  }
}
```

## Middlewares Basados en Clases

### Decorador Middleware

- `@Middleware()` - Marca una clase como middleware (sin parámetros)

El decorador `@Middleware()` define una clase como middleware. La clase debe implementar un método `use()`. Opcionalmente puede implementar la interfaz `IMiddleware` proporcionada por YasuiJS para forzar la firma del método.

```typescript
import {
  Middleware, IMiddleware,
  Request, Response, NextFunction,
  Req, Res, Next,
} from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    // Lógica de validación del token aquí

    next(); // Continuar al siguiente middleware o lógica del controlador
  }
}
```

### Decoradores de Parámetros en Middlewares

Los middlewares pueden usar los mismos decoradores de parámetros que los controladores:

```typescript
@Middleware()
export class ValidationMiddleware {
  use(
    @Body() body: any,
    @Query('validate') shouldValidate: boolean,
    @Header('content-type') contentType: string,
    @Next() next: NextFunction
  ) {
    if (shouldValidate && !this.isValid(body)) {
      throw new Error('Datos de solicitud inválidos');
    }
    
    next();
  }
  
  private isValid(data: any): boolean {
    // Lógica de validación
    return true;
  }
}
```

### Ejecución de Middleware

Debe llamar explícitamente a `next()` para continuar al siguiente middleware o controlador. Para detener el pipeline de solicitud, puede:
- Devolver una respuesta usando `@Res()`
- Lanzar un error
- No llamar a `next()`

```typescript
@Middleware()
export class ConditionalMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    if (req.path === '/public') {
      next(); // Continuar pipeline
    }
    // No llamar next() para detenerse aquí
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