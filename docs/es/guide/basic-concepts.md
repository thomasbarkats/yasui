# Conceptos Básicos

Esta guía introduce los conceptos fundamentales que hacen funcionar YasuiJS. Entender estos conceptos te ayudará a construir mejores APIs y aprovechar al máximo la arquitectura del framework.

## Descripción General

YasuiJS está construido alrededor de algunos conceptos centrales:

- **Controladores**: Definen los endpoints de tu API y manejan las peticiones HTTP
- **Servicios**: Contienen tu lógica de negocio y operaciones de datos
- **Inyección de Dependencias**: Gestiona automáticamente las relaciones entre componentes
- **Decoradores**: Proporcionan metadatos y configuración de forma declarativa
- **Middleware**: Procesa las peticiones en un pipeline antes de llegar a los controladores

## Controladores

**Los controladores son los puntos de entrada de tu API.** Definen qué endpoints existen y cómo responder a las peticiones HTTP.

### Qué Hacen los Controladores

Los controladores tienen una responsabilidad principal: traducir las peticiones HTTP en operaciones de negocio y devolver respuestas apropiadas. Deben ser capas delgadas que deleguen el trabajo real a los servicios.

```typescript
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### Por Qué Son Importantes los Controladores

- **Organización de Rutas**: Agrupa endpoints relacionados de forma lógica
- **Manejo de Peticiones**: Extrae y valida datos de petición automáticamente
- **Formateo de Respuestas**: Devuelve datos que se serializan automáticamente
- **Separación de Responsabilidades**: Mantiene la lógica HTTP separada de la lógica de negocio

Los controladores deben centrarse en aspectos HTTP (rutas, códigos de estado, cabeceras) mientras delegan la lógica de negocio a los servicios.

## Servicios

**Los servicios contienen tu lógica de negocio.** Realizan el trabajo real que tu aplicación necesita hacer, independientemente de cómo se solicitó ese trabajo.

### Qué Hacen los Servicios

Los servicios encapsulan operaciones de negocio y pueden ser utilizados por múltiples controladores. Manejan cosas como procesamiento de datos, llamadas a APIs externas y reglas de negocio.

```typescript
@Injectable()
export class UserService {
  private users = [];

  getAllUsers() {
    return this.users;
  }

  createUser(userData) {
    // Lógica de negocio aquí
    const user = { id: generateId(), ...userData };
    this.users.push(user);
    return user;
  }
}
```

### Por Qué Son Importantes los Servicios

- **Reusabilidad**: Múltiples controladores pueden usar el mismo servicio
- **Testabilidad**: La lógica de negocio puede probarse independientemente del HTTP
- **Organización**: Las operaciones de negocio relacionadas están agrupadas
- **Mantenibilidad**: Los cambios en la lógica de negocio no afectan a los controladores

Los servicios deben centrarse en "qué" hace tu aplicación, no en "cómo" se accede a ella.

## Inyección de Dependencias

**La Inyección de Dependencias gestiona automáticamente las relaciones entre componentes.** En lugar de crear y conectar objetos manualmente, YasuiJS lo hace por ti.

### Cómo Funciona

Cuando YasuiJS ve un controlador que necesita un servicio, automáticamente crea el servicio y lo inyecta:

```typescript
@Injectable()
export class UserService {
  // Implementación del servicio
}

@Controller('/users')
export class UserController {
  // UserService se crea e inyecta automáticamente
  constructor(private userService: UserService) {}
}
```

### Por Qué Es Importante la Inyección de Dependencias

- **Acoplamiento Débil**: Los componentes no crean sus propias dependencias
- **Testabilidad**: Fácil reemplazar dependencias con mocks para pruebas
- **Flexibilidad**: Cambiar implementaciones sin modificar consumidores
- **Gestión del Ciclo de Vida**: El framework maneja la creación y limpieza de objetos

Tú declaras lo que necesitas, y el framework determina cómo proporcionarlo.

## Decoradores

**Los decoradores proporcionan metadatos sobre tu código.** Le dicen a YasuiJS cómo interpretar y configurar tus clases y métodos.

### Qué Hacen los Decoradores

Los decoradores reemplazan archivos de configuración y configuración manual con anotaciones declarativas:

```typescript
@Controller('/api/users')    // Esta clase maneja las rutas /api/users
export class UserController {
  
  @Get('/:id')              // Este método maneja peticiones GET
  getUser(@Param('id') id: string) {  // Extrae 'id' de la URL
    return { id, name: 'John' };
  }
}
```

### Tipos de Decoradores

- **Decoradores de Clase**: `@Controller()`, `@Injectable()`, `@Middleware()` - definen lo que representa una clase
- **Decoradores de Método**: `@Get()`, `@Post()`, `@Put()` - definen métodos HTTP y rutas
- **Decoradores de Parámetros**: `@Param()`, `@Body()`, `@Query()` - extraen datos de la petición

### Por Qué Son Importantes los Decoradores

- **Declarativo**: El código declara claramente su intención
- **Co-ubicación**: La configuración vive junto al código que configura
- **Seguridad de Tipos**: TypeScript puede validar el uso de decoradores
- **Procesamiento Automático**: El framework lee decoradores y configura todo

Los decoradores hacen que tu código sea autodocumentado y eliminan la conexión manual.

## Middleware

**El middleware procesa peticiones en un pipeline.** Cada middleware puede examinar, modificar o detener una petición antes de que llegue a tu controlador.

### Cómo Funciona el Middleware

Las funciones middleware se ejecutan en secuencia, cada una decidiendo si continuar al siguiente paso:

```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    // Verificar autenticación
    if (req.headers.authorization) {
      next(); // Continuar al siguiente middleware o controlador
    } else {
      throw new Error('No autorizado'); // Detener aquí
    }
  }
}
```

### Niveles de Middleware

El middleware puede aplicarse en diferentes niveles:

```typescript
// Global: se aplica a todas las peticiones
yasui.createServer({
  middlewares: [LoggingMiddleware]
});

// Controlador: se aplica a todas las rutas en el controlador
@Controller('/users', AuthMiddleware)
export class UserController {}

// Ruta: se aplica a un endpoint específico
@Get('/', ValidationMiddleware)
getUsers() {}
```

### Por Qué Es Importante el Middleware

- **Preocupaciones Transversales**: Maneja autenticación, logging, validación globalmente
- **Reusabilidad**: El mismo middleware puede usarse en diferentes rutas
- **Composabilidad**: Combina múltiples middleware para comportamiento complejo
- **Separación**: Mantiene preocupaciones como auth separadas de la lógica de negocio

El middleware te permite construir pipelines de procesamiento de peticiones que son potentes y mantenibles.

## Cómo Todo Funciona Junto

Estos conceptos se combinan para crear una arquitectura limpia:

```typescript
// 1. El middleware procesa la petición
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    // Autenticar petición
    next();
  }
}

// 2. El servicio contiene lógica de negocio
@Injectable()
export class UserService {
  createUser(userData) {
    // Lógica de negocio aquí
    return newUser;
  }
}

// 3. El controlador coordina las capas HTTP y de negocio
@Controller('/users', AuthMiddleware)
export class UserController {
  constructor(private userService: UserService) {} // DI

  @Post('/') // El decorador define la ruta
  createUser(@Body() userData: any) { // El decorador extrae datos
    return this.userService.createUser(userData); // Delega al servicio
  }
}
```

### El Flujo de la Petición

1. **La petición llega** a tu API
2. **El middleware** la procesa (auth, logging, etc.)
3. **El controlador** recibe la petición vía decoradores
4. **La inyección de dependencias** proporciona los servicios requeridos
5. **El servicio** realiza la operación de negocio
6. **El controlador** devuelve el resultado
7. **El framework** serializa y envía la respuesta

## Beneficios de Esta Arquitectura

### Separación de Responsabilidades
Cada componente tiene una responsabilidad clara y única:
- Los controladores manejan HTTP
- Los servicios manejan lógica de negocio
- El middleware maneja preocupaciones transversales

### Testabilidad
Los componentes pueden probarse de forma aislada:
- Probar servicios sin HTTP
- Probar controladores con servicios simulados
- Probar middleware independientemente

### Mantenibilidad
Los cambios están localizados:
- Los cambios en la lógica de negocio no afectan a los controladores
- Los cambios en las rutas no afectan a los servicios
- Las nuevas funcionalidades pueden reutilizar servicios existentes

### Escalabilidad
La arquitectura soporta el crecimiento:
- Añadir nuevos controladores fácilmente
- Compartir servicios entre controladores
- Componer middleware para requisitos complejos

## Cuándo Usar Qué

### Usar Controladores Para:
- Definir endpoints de API
- Extraer datos de peticiones
- Establecer códigos de estado de respuesta
- Coordinar entre servicios

### Usar Servicios Para:
- Lógica y reglas de negocio
- Procesamiento de datos
- Llamadas a APIs externas
- Operaciones que podrían reutilizarse

### Usar Inyección de Dependencias Para:
- Conectar servicios con controladores
- Gestionar ciclos de vida de objetos
- Facilitar las pruebas
- Mantener código débilmente acoplado

### Usar Decoradores Para:
- Definir rutas y métodos HTTP
- Extraer parámetros de petición
- Configurar middleware
- Añadir metadatos para documentación

### Usar Middleware Para:
- Autenticación y autorización
- Logging de peticiones/respuestas
- Validación de entrada
- Limitación de tasa
- Manejo de errores