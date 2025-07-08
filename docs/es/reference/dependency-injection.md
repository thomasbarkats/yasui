# Inyección de Dependencias

YasuiJS proporciona un sistema completo de inyección de dependencias con resolución automática de dependencias y gestión de ámbitos. Permite un acoplamiento flexible, mejor capacidad de prueba y una separación más limpia de responsabilidades.

## Descripción General

La inyección de dependencias gestiona automáticamente las relaciones entre componentes. En lugar de crear y conectar objetos manualmente, YasuiJS lo hace por ti analizando los constructores de clases y parámetros de métodos.

```typescript
import { Injectable, Controller } from 'yasui';

@Injectable()
export class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}

@Controller('/users')
export class UserController {
  // UserService se crea e inyecta automáticamente
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

## Servicios Inyectables

### Decorador Injectable

- `@Injectable()` - Marca una clase como inyectable (sin parámetros, requerido para todos los servicios)

Usa el decorador `@Injectable()` para marcar una clase como inyectable. Este decorador es **requerido** para todos los servicios que serán inyectados.

```typescript
import { Injectable } from 'yasui';

@Injectable()
export class UserService {
  getUser(id: string) {
    // Lógica de negocio aquí
    return { id, name: 'John Doe' };
  }
}

@Injectable()
export class EmailService {
  sendEmail(to: string, subject: string) {
    // Lógica de email aquí
    console.log(`Sending email to ${to}: ${subject}`);
  }
}
```

## Inyección en el Constructor

Simplemente declara tus dependencias en controladores, middleware o constructores de servicios. Puedes inyectar múltiples servicios en el mismo constructor. Se resolverán e inyectarán automáticamente:

```typescript
@Injectable()
export class OrderService {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
    private paymentService: PaymentService
  ) {}

  processOrder(orderData: any) {
    const user = this.userService.getUser(orderData.userId);
    const payment = this.paymentService.processPayment(orderData.amount);
    this.emailService.sendEmail(user.email, 'Order confirmed');
    
    return { order: orderData, payment };
  }
}
```

## Ámbitos de Dependencia

### Decorador Scope

- `@Scope(scope)` - Especifica el ámbito de dependencia (parámetro de ámbito requerido)

YasuiJS soporta tres ámbitos diferentes de dependencia que controlan cómo se crean y comparten las instancias:

- **`Scopes.SHARED`** (predeterminado): Instancia singleton compartida en toda la aplicación
- **`Scopes.LOCAL`**: Nueva instancia para cada contexto de inyección
- **`Scopes.DEEP_LOCAL`**: Nueva instancia que propaga la localidad a sus propias dependencias

El decorador `@Scope()` se aplica en el punto de inyección, no en la clase del servicio.

### Ámbitos a Nivel de Constructor

Puedes especificar ámbitos para dependencias individuales en constructores:

```typescript
@Injectable()
export class MyService {
  constructor(
    @Scope(Scopes.LOCAL) private tempService: TempService,
    @Scope(Scopes.DEEP_LOCAL) private isolatedService: IsolatedService,
    private sharedService: SharedService // SHARED por defecto
  ) {}
}
```

### Guías de Selección de Ámbito

- **SHARED**: Usar para servicios sin estado, cachés, conexiones a base de datos
- **LOCAL**: Usar para servicios específicos de solicitud, procesadores temporales
- **DEEP_LOCAL**: Usar para operaciones completamente aisladas, escenarios de prueba

## Inyección a Nivel de Método

### Decorador Inject

- `@Inject(token?)` - Inyecta dependencias en parámetros de método (token personalizado opcional)

Puedes inyectar dependencias directamente en parámetros de método de controlador o middleware. Esto restringe la inyección a endpoints específicos en lugar de todo el controlador, permitiendo una gestión de ámbito más precisa. Por ejemplo, puedes tener un servicio compartido inyectado en el constructor, pero una ruta específica que necesita una instancia dedicada del mismo servicio.

```typescript
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {} // Instancia compartida para el controlador

  @Get('/:id')
  getUser(
    @Param('id') id: string,
    @Inject() userService: UserService // Instancia específica para este endpoint
  ) {
    return userService.getUser(id);
  }

  @Get('/')
  getUsers(@Inject() userService: UserService) {
    return userService.getAllUsers();
  }
}
```

### Ámbitos a Nivel de Método

Los ámbitos también funcionan con inyección a nivel de método:

```typescript
@Controller('/api')
export class ApiController {
  @Get('/data')
  getData(
    @Inject() @Scope(Scopes.LOCAL) tempService: TempService,
    @Inject() @Scope(Scopes.SHARED) cacheService: CacheService
  ) {
    return tempService.processData(cacheService.getData());
  }
}
```

## Tokens de Inyección Personalizados

### Uso de Tokens Personalizados

Para escenarios complejos, usa tokens de inyección personalizados con `@Inject()`. Esto es útil para inyectar valores primitivos, configuraciones o cuando necesitas múltiples instancias de la misma clase:

```typescript
@Injectable()
export class DatabaseService {
  constructor(
    @Inject('DATABASE_URL') private dbUrl: string,
    @Inject('CONFIG') private config: AppConfig
  ) {
    console.log(`Connecting to: ${this.dbUrl}`);
  }
}

@Controller('/users')
export class UserController {
  @Get('/')
  getUsers(
    @Inject('API_VERSION') apiVersion: string,
    @Inject() userService: UserService
  ) {
    return {
      version: apiVersion,
      users: userService.getAllUsers()
    };
  }
}
```

### Registro de Tokens Personalizados

Registra tokens personalizados en la configuración de tu aplicación:

```typescript
interface AppConfig {
  apiKey: string;
  timeout: number;
}

yasui.createServer({
  controllers: [UserController],
  injections: [
    { token: 'DATABASE_URL', provide: 'postgresql://localhost:5432/mydb' },
    { token: 'API_VERSION', provide: 'v1.0.0' },
    { 
      token: 'CONFIG', 
      provide: { 
        apiKey: process.env.API_KEY, 
        timeout: 5000 
      } as AppConfig
    }
  ]
});
```

### Dependencias Circulares

YasuiJS detecta y previene automáticamente las dependencias circulares al inicio:

```typescript
// Esto será detectado y reportado como un error
@Injectable()
export class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
export class ServiceB {
  constructor(private serviceA: ServiceA) {} // ¡Dependencia circular!
}
```