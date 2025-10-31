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

### Acceso a Nivel de Método

- `@Logger()` - Obtener instancia de logger específica de solicitud (sin parámetros)

Usa el decorador `@Logger()` para obtener una instancia de logger dedicada que se inicia automáticamente al comienzo de la ruta. Esto es útil para rastrear el cronometraje a lo largo de la operación en modo debug. Esto funciona tanto en métodos de controlador como en métodos de middleware.

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