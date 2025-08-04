# Manejo de Errores

YasuiJS proporciona manejo y formateo automático de errores tanto para el registro como para las respuestas del cliente. Todos los métodos del controlador están automáticamente envueltos con manejo de errores para capturar y procesar cualquier error lanzado.

## Descripción General

Cuando ocurre un error en tu aplicación, YasuiJS automáticamente:
- Registra el error con información detallada (URL, método, estado, mensaje)
- Lo formatea y lo envía al cliente como una respuesta JSON
- Incluye código de estado HTTP, detalles del error, información de la solicitud y cualquier dato adicional del error

```typescript
@Get('/:id')
getUser(@Param('id') id: string) {
  const user = this.userService.findById(id);

  if (!user) {
    // Este error será capturado y formateado automáticamente
    throw new Error('Usuario no encontrado');
  }
  return user;
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

  constructor(fields: string[]) {
    super(HttpCode.BAD_REQUEST, 'Faltan campos requeridos');
    this.fields = fields;
  }
}

@Controller('/users')
export class UserController {

  @Post('/')
  createUser(@Body() userData: any) {
    const missingFields = this.validateUserData(userData);

    if (missingFields.length > 0) {
      throw new ValidationError(missingFields);
    }
    return this.userService.createUser(userData);
  }
}
```

## Enum HttpCode

YasuiJS proporciona un enum `HttpCode` con códigos de estado HTTP comunes. Para una lista completa de códigos de estado HTTP y sus significados, consulta la [documentación de códigos de estado de respuesta HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

## Formato de Respuesta de Error

Cuando se lanza un error, YasuiJS automáticamente lo formatea en una respuesta JSON consistente:

```json
{
  "url": "http://localhost:3000/api/users/123",
  "path": "/api/users/123",
  "method": "POST",
  "name": "ValidationError", // Nombre de la clase de error
  "message": "Faltan campos requeridos",
  "statusMessage": "Bad Request", // Mensaje de estado HTTP
  "status": 404, // Código de estado HTTP
  "data": {
    "fields": ["name", "age"]
  }
}
```

Las propiedades de errores personalizados que heredan de HttpError se incluirán en `data`.

## Manejo de Errores en Servicios

Los servicios o cualquier Injectable pueden lanzar errores que serán capturados automáticamente cuando se llamen desde los controladores:

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