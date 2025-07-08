# Servicio de Registro

YasuiJS incluye un servicio de registro incorporado con capacidades de temporización y salida codificada por colores. Proporciona registro estructurado para su aplicación con contexto específico de solicitud y monitoreo de rendimiento.

El registrador puede ser inyectado en servicios y controladores mediante inyección de constructor, o accedido directamente en parámetros de método usando el decorador `@Logger()`.

```typescript
import { Injectable, LoggerService } from 'yasui';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  getUser(id: string) {
    this.logger.log('Buscando usuario', { userId: id });
    const user = this.findUser(id);
    this.logger.success('Usuario encontrado exitosamente');
    return user;
  }
}
```

## Usando LoggerService

### Inyección de Constructor

Inyecte el servicio de registro en los constructores de su servicio o controlador:

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

- `@Logger()` - Obtener instancia de registro específica de solicitud (sin parámetros)

Use el decorador `@Logger()` para obtener una instancia de registro dedicada que se inicia automáticamente al comienzo de la ruta. Esto es útil para rastrear el tiempo durante la operación en modo de depuración. Esto funciona tanto en métodos de controlador como en métodos de middleware.

```typescript
import { LoggerService } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Logger() logger: LoggerService) {
    logger.log('Procesando solicitud de lista de usuarios');
    // El registrador ya está iniciado, el tiempo es automático
    const users = this.fetchUsers();
    logger.success(`Se encontraron ${users.length} usuarios`);
    return users;
  }
}

@Middleware()
export class RequestLoggerMiddleware {
  use(
    @Req() req: Request,
    @Logger() logger: LoggerService,
    @Next() next: NextFunction
  ) {
    logger.log('Solicitud entrante', { method: req.method, path: req.path });
    next();
  }
}
```

## Métodos de Registro

El LoggerService proporciona varios métodos para diferentes niveles de registro:

```typescript
@Injectable()
export class ExampleService {
  constructor(private logger: LoggerService) {}

  demonstrateLogs() {
    // Información general
    this.logger.log('Aplicación iniciada');
    // Información de depuración (detallada)
    this.logger.debug('Información de depuración', { details: 'datos extra' });
    // Mensajes de éxito
    this.logger.success('Operación completada exitosamente');
    // Mensajes de advertencia
    this.logger.warn('Advertencia: método obsoleto utilizado');
    // Mensajes de error
    this.logger.error('Error ocurrido', { error: 'detalles' });
  }
}
```

## Funcionalidad de Temporización

El registrador incluye capacidades de temporización incorporadas para monitoreo de rendimiento:

```typescript
@Injectable()
export class DataService {
  constructor(private logger: LoggerService) {}

  processData() {
    this.logger.start(); // Iniciar temporizador
    
    const data = this.fetchData();
    const elapsed = this.logger.stop(); // Detener y obtener tiempo transcurrido
    this.logger.log(`Procesamiento completado en ${elapsed}ms`);
    
    return data;
  }

  batchProcess(items: any[]) {
    this.logger.start();
    
    for (const item of items) {
      this.processItem(item);
      this.logger.reset(); // Reiniciar temporizador para siguiente elemento
    }
    
    // Obtener tiempo transcurrido actual sin detener
    const currentTime = this.logger.getTime();
    this.logger.debug(`Tiempo de procesamiento actual: ${currentTime}ms`);
  }
}
```

## Integración del Modo de Depuración

Cuando el modo de depuración está habilitado en su configuración de YasuiJS, el registrador proporciona una salida más detallada:

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true // Habilita registro detallado
});
```

En modo de depuración:
- Todas las solicitudes entrantes se registran automáticamente
- Se muestran los mensajes de depuración
- Se muestra información de error más detallada