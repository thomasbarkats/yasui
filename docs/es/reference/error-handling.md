# Manejo de Errores

YasuiJS proporciona manejo y formateo automático de errores tanto para el registro como para las respuestas del cliente. Todos los métodos del controlador están automáticamente envueltos con manejo de errores para capturar y procesar cualquier error lanzado.

## Descripción General

Cuando ocurre un error en tu aplicación, YasuiJS automáticamente:
- Registra el error con información detallada (URL, método, estado, mensaje)
- Lo formatea y envía al cliente como una respuesta JSON
- Incluye código de estado HTTP, detalles del error, información de la solicitud y cualquier dato adicional del error

```typescript
@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.findById(id);
    
    if (!user) {
      // Este error será capturado y formateado automáticamente
      throw new HttpError(HttpCode.NOT_FOUND, 'Usuario no encontrado');
    }
    return user;
  }
}
```

## Manejo de Errores Personalizado

### Clase HttpError

Crea errores personalizados con códigos de estado específicos y datos adicionales extendiendo o usando la clase `HttpError`. Tu error personalizado debe establecer las propiedades `status` y `message` y puede incluir cualquier propiedad adicional.

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/users')
export class UserController {
 @Get('/:id')
 getUser(@Param('id') id: string) {
   const user = this.userService.findById(id);
   
   if (!user) {
     throw new HttpError(HttpCode.NOT_FOUND, 'Usuario no encontrado');
   }
   
   return user;
 }
}
```

### Clases de Error Personalizadas

Crea clases de error personalizadas para errores específicos de lógica de negocio:

```typescript
class ValidationError extends HttpError {
  fields: string[];

  constructor(message: string, fields: string[]) {
    super(HttpCode.BAD_REQUEST, message);
    this.fields = fields;
  }
}

@Controller('/users')
export class UserController {
  @Post('/')
  createUser(@Body() userData: any) {
    const missingFields = this.validateUserData(userData);
    
    if (missingFields.length > 0) {
      throw new ValidationError('Faltan campos requeridos', missingFields);
    }
    
    return this.userService.createUser(userData);
  }
}
```

## Enum HttpCode

YasuiJS proporciona un enum `HttpCode` con códigos de estado HTTP comunes. Para una lista completa de códigos de estado HTTP y sus significados, consulta la [documentación de códigos de estado de respuesta HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

```typescript
import { HttpCode } from 'yasui';

@Controller('/api')
export class ApiController {
  @Delete('/:id')
  deleteItem(@Param('id') id: string) {
    if (!this.service.exists(id)) {
      throw new HttpError(HttpCode.NOT_FOUND, 'Elemento no encontrado');
    }
    
    this.service.delete(id);
  }
}
```

## Formato de Respuesta de Error

Cuando se lanza un error, YasuiJS automáticamente lo formatea en una respuesta JSON consistente:

```json
{
  "error": {
    "status": 404,
    "message": "Usuario no encontrado",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/users/123",
    "method": "GET",
    "data": {
      "resourceType": "User",
      "resourceId": "123"
    }
  }
}
```

La respuesta incluye:
- **status**: Código de estado HTTP
- **message**: Mensaje de error
- **timestamp**: Cuándo ocurrió el error
- **path**: Ruta de la solicitud donde ocurrió el error
- **method**: Método HTTP
- **data**: Cualquier propiedad adicional de tu error personalizado

## Manejo de Errores en Servicios

Los servicios pueden lanzar errores que serán automáticamente capturados cuando se llamen desde los controladores:

```typescript
@Injectable()
export class UserService {
  findById(id: string) {
    const user = this.database.findUser(id);
    
    if (!user) {
      // Esto será capturado por el manejador de errores del controlador
      throw new HttpError(HttpCode.NOT_FOUND, 'Usuario no encontrado');
    }
    
    return user;
  }

  createUser(userData: any) {
    if (this.emailExists(userData.email)) {
      throw new HttpError(HttpCode.CONFLICT, 'El email ya existe', {
        email: userData.email,
        suggestion: 'Intenta iniciar sesión en su lugar'
      });
    }
    
    return this.database.createUser(userData);
  }
}
```

## Validación de Decoradores

YasuiJS valida automáticamente tus decoradores al inicio para detectar errores comunes de configuración. Estos errores se reportan después de la inicialización del servidor pero no impiden que el servidor se ejecute:

```typescript
// Esto será detectado y reportado como un error
@Injectable()
export class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
export class ServiceB {
  constructor(private serviceA: ServiceA) {} // ¡Dependencia circular detectada!
}

// Se detectará la falta del decorador de parámetro
@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(id: string) { // Falta el decorador @Param('id')
    return this.userService.findById(id);
  }
}
```

Puedes deshabilitar la validación de decoradores en la configuración (no recomendado):

```typescript
yasui.createServer({
  controllers: [UserController],
  enableDecoratorValidation: false // Inseguro - deshabilita la validación
});
```