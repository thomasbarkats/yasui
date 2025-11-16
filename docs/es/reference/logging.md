# Servicio de Logging

YasuiJS incluye un servicio de logging integrado con capacidades de cronometraje y salida codificada por colores. Proporciona logging estructurado para tu aplicación con contexto específico de solicitud y monitoreo de rendimiento.

El logger puede ser inyectado en servicios y controladores a través de inyección de constructor, o accedido directamente en parámetros de método usando el decorador `@Logger()`.

```typescript
import { Injectable, LoggerService } from 'yasui';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  getUser(id: string) {
    this.logger.log('Obteniendo usuario', { userId: id });
    const user = this.findUser(id);
    this.logger.success('Usuario encontrado exitosamente');
    return user;
  }
}
```

## Usando LoggerService

### Inyección de Constructor

Inyecta el servicio de logger en los constructores de tus servicios o controladores:

```typescript
@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  createUser(userData: any) {
    this.logger.log('Creando nuevo usuario');
    // Lógica de negocio aquí
    this.logger.success('Usuario creado exitosamente');
  }
}

@Controller('/users')
export class UserController {
  constructor(private readonly logger: LoggerService) {}

  @Get('/')
  getUsers() {
    this.logger.log('Obteniendo todos los usuarios');
    return this.userService.getAllUsers();
  }
}
```

### Logger a Nivel de Solicitud

Usa el decorador `@Logger()` para obtener una **instancia de logger dedicada, por solicitud**. Cada solicitud obtiene su propio logger aislado que se inicia automáticamente para rastreo de cronometraje. El logger se inicia cuando comienza la solicitud.

```typescript
import { LoggerService } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Logger() logger: LoggerService) {
    logger.log('Procesando solicitud de lista de usuarios');
    // El logger ya está iniciado, el cronometraje es automático
    const users = this.fetchUsers();
    logger.success(`Se encontraron ${users.length} usuarios`);
    return users;
  }
}

@Middleware()
export class RequestLoggerMiddleware {
  use(
    @Req() req: Request,
    @Logger() logger: LoggerService
  ) {
    logger.log('Solicitud entrante', { method: req.method, path: req.path });
  }
}
```

Una instancia de logger solo se crea por solicitud cuando se usa el decorador `@Logger`. El logger no es accesible vía `req.logger` - usa el decorador `@Logger()` para acceder a él. Esto asegura rendimiento óptimo al crear instancias de logger solo cuando se necesitan explícitamente.

**Logger de Constructor vs Logger a Nivel de Solicitud:**

```typescript
@Controller('/api/users')
export class UserController {
  // Inyección de constructor: Compartido entre todas las solicitudes
  // Usa `@Scope(Scopes.LOCAL)` para una instancia restringida al Controlador
  constructor(private readonly logger: LoggerService) {}

  @Get('/shared')
  withSharedLogger() {
    // Usa logger compartido (singleton por defecto)
    this.logger.log('Usando logger compartido');
  }

  @Get('/isolated')
  withRequestLogger(@Logger() logger: LoggerService) {
    // Usa logger de solicitud dedicado (único por solicitud)
    logger.log('Usando logger específico de solicitud');
    // Rastrea automáticamente el cronometraje desde que comenzó la solicitud
  }
}
```

**Cuándo usar cada uno:**
- **Inyección de constructor** - Logging a nivel de aplicación, inicialización de servicios, operaciones compartidas
- **Decorador `@Logger()`** - Operaciones específicas de solicitud, rastreo de rendimiento, logging de solicitud aislado

## Métodos de Logging

El LoggerService proporciona varios métodos para diferentes niveles de log:

```typescript
@Injectable()
export class ExampleService {
  constructor(private logger: LoggerService) {}

  demonstrateLogs() {
    // Información general
    this.logger.log('Aplicación iniciada');
    // Información de debug (detallada)
    this.logger.debug('Información de debug', { details: 'datos extra' });
    // Mensajes de éxito
    this.logger.success('Operación completada exitosamente');
    // Mensajes de advertencia
    this.logger.warn('Advertencia: método obsoleto usado');
    // Mensajes de error
    this.logger.error('Ocurrió un error', { error: 'detalles' });
  }
}
```

## Funcionalidad de Cronometraje

El logger incluye capacidades de cronometraje integradas para monitoreo de rendimiento:

```typescript
@Injectable()
export class DataService {
  constructor(private logger: LoggerService) {}

  processData() {
    this.logger.start(); // Iniciar cronómetro
    
    const data = this.fetchData();
    const elapsed = this.logger.stop(); // Detener y obtener tiempo transcurrido
    this.logger.log(`Procesamiento completado en ${elapsed}ms`);
    
    return data;
  }

  batchProcess(items: any[]) {
    this.logger.start();
    
    for (const item of items) {
      this.processItem(item);
      this.logger.reset(); // Reiniciar cronómetro para el siguiente elemento
    }
    
    // Obtener tiempo transcurrido actual sin detener
    const currentTime = this.logger.getTime();
    this.logger.debug(`Tiempo de procesamiento actual: ${currentTime}ms`);
  }
}
```

## Integración con Modo Debug

Cuando el modo debug está habilitado en tu configuración de YasuiJS, el logger proporciona salida más detallada:

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true // Habilita logging detallado
});
```

En modo debug:
- Todas las solicitudes entrantes se registran automáticamente
- Los mensajes de debug se muestran
- Se muestra información de error más detallada