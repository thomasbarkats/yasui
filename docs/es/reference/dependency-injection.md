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
    console.log(`Enviando email a ${to}: ${subject}`);
  }
}
```

## Inyección en el Constructor

Simplemente declara tus dependencias en controladores, middleware o constructores de servicios. Puedes inyectar múltiples servicios en el mismo constructor. Serán resueltos e inyectados automáticamente:

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
    this.emailService.sendEmail(user.email, 'Pedido confirmado');
    
    return { order: orderData, payment };
  }
}
```

## Ámbitos de Dependencia

### Decorador Scope

- `@Scope(scope)` - Especifica el ámbito de dependencia (parámetro scope requerido)

YasuiJS soporta tres diferentes ámbitos de dependencia que controlan cómo se crean y comparten las instancias:

- **`Scopes.SHARED`** (por defecto): Instancia singleton compartida en toda la aplicación
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

  // Instancia compartida para el controlador
  constructor(private userService: UserService) {}

  @Get('/:id')
  getUser(
    @Param('id') id: string,
    @Inject() userService: UserService // Instancia específica para este endpoint
  ) {
    return userService.getUser(id);
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

### Usando Tokens Personalizados

Para escenarios complejos, usa tokens de inyección personalizados con `@Inject()`. Esto es útil para inyectar valores primitivos, configuraciones, o cuando necesitas múltiples instancias de la misma clase:

```typescript
@Injectable()
export class DatabaseService {
  constructor(
    @Inject('DATABASE_URL') private dbUrl: string,
    @Inject('CONFIG') private config: AppConfig
  ) {
    console.log(`Conectando a: ${this.dbUrl}`);
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

### Registrando Tokens Personalizados

Registra tokens personalizados en tu configuración de aplicación usando `provide` para valores directos o `factory` para valores computados:

```typescript
yasui.createServer({
  controllers: [UserController],
  injections: [
    // Valor directo
    { token: 'API_KEY', provide: process.env.API_KEY },
    // Factory asíncrona
    {
      token: 'DATABASE',
      factory: async () => {
        const db = new Database();
        await db.connect();
        return db;
      }
    }
  ]
});
```

Por defecto, todas las inyecciones de factory se resuelven antes de que el servidor inicie.

### Inyecciones Asíncronas Diferidas {#deferred-deps}

Usa `deferred: true` para dependencias que no deben bloquear el inicio del servidor y cuya ausencia temporal o error se acepta. El servidor inicia inmediatamente mientras la dependencia se inicializa en segundo plano.

**Cómo funciona:**

- El servidor inicia inmediatamente (no bloqueante)
- El servicio es `null` hasta que la factory se resuelve
- **El desarrollador maneja el estado null** (devolver 503, omitir operación, usar respaldo, etc.)
- Una vez inicializado, el servicio funciona normalmente
- Si la inicialización falla, el servicio permanece `null`

<details>
<summary>Haga clic para ver el ejemplo completo</summary>

```typescript
import { Inject, HttpError } from 'yasui';

yasui.createServer({
  controllers: [AnalyticsController],
  injections: [{
    token: 'ANALYTICS',
    deferred: true,
    factory: async () => {
      try {
        const analytics = new AnalyticsClient();
        await analytics.connect();
        return analytics;
      } catch (err) {
        // Hacer algo, como enviar una alerta.
        throw err; // El servicio permanecerá null
      }
    },
  }]
});

export class AnalyticsController {
  // YasuiJS te obligará a tipear con unión null
  constructor(
    @Inject('ANALYTICS') private analytics: AnalyticsService | null
  ) { }

  @Get('/events')
  getEvents() {
    // Manejar estado no listo/fallido:
    if (!this.analytics) {
      throw new HttpError(503, 'Analytics not ready');   // ej. devolver 503
      // O: return { events: [] };                      // Valor de respaldo
      // O: this.logger.warn('Analytics unavailable');  // Omitir operación
      //     return ;
    }
    return this.analytics.track('page_view');
  }
}
```
</details>

**Requisitos importantes de tipado:**

YasuiJS valida que las inyecciones diferidas estén tipadas con `| null` **solo para tipos Clase**. Esto se debe a las limitaciones de los metadatos de reflexión de TypeScript.

✅ **Funciona** (tipos Clase):

Se generará un error de validación de decorador cuando YasuiJS inicie si falta `| null`:
```typescript
@Inject('TOKEN') service: MyService | null // ✅ Validado
```

❌ **No validado** (compilará pero no se verificará):
```typescript
@Inject('TOKEN') config: object | null         // ⚠️ No validado (tipo literal)
@Inject('TOKEN') data: { foo: string } | null  // ⚠️ No validado (tipo en línea)
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