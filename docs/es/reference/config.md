# Configuración

Referencia completa de configuración para aplicaciones YasuiJS usando `yasui.createServer()` y `yasui.createApp()`.

## Descripción General

YasuiJS proporciona dos formas principales de crear tu aplicación:

- **`yasui.createServer(config)`** - Crea e inicia un servidor HTTP automáticamente
- **`yasui.createApp(config)`** - Devuelve una aplicación Express para configuración manual

Ambos métodos aceptan el mismo objeto de configuración con las siguientes opciones.

## Opciones de Configuración

### Opciones Requeridas

#### `controllers`
**Tipo:** `Array<Constructor>`  
**Descripción:** Array de clases controladoras para registrar en tu aplicación.

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController, ProductController]
});
```

### Opciones Opcionales

#### `middlewares`
Array de middlewares globales para aplicar a todas las peticiones. Pueden ser clases middleware de YasuiJS o funciones RequestHandler de Express.
- **Tipo:** `Array<Constructor | RequestHandler>`
- **Valor predeterminado:** `[]`
- **Ejemplo:** `[LoggingMiddleware, cors()]`

#### `globalPipes`
Array de pipes globales para aplicar a todos los parámetros de ruta. Ver [Pipes](/es/reference/pipes) para más detalles.
- **Tipo:** `Array<Constructor<IPipeTransform>>`
- **Valor predeterminado:** `[]`
- **Ejemplo:** `[ValidationPipe, TrimPipe]`

#### `environment`
Nombre del entorno para tu aplicación.
- **Tipo:** `string`
- **Valor predeterminado:** `process.env.NODE_ENV || 'development'`
- **Ejemplo:** `production`

#### `port`
Número de puerto para el servidor HTTP. Solo se usa con `createServer()`.
- **Tipo:** `number | string`
- **Valor predeterminado:** `3000`

#### `protocol`
Protocolo usado para el registro de URL del servidor. Actualmente solo se usa para fines de visualización.
- **Tipo:** `'http' | 'https'`
- **Valor predeterminado:** `'http'`

#### `debug`
Habilita el modo debug con registro adicional y seguimiento de peticiones.
- **Tipo:** `boolean`
- **Valor predeterminado:** `false`

#### `injections`
Tokens de inyección personalizados para inyección de dependencias. Ver [Inyección de Dependencias](/es/reference/dependency-injection) para más detalles.
- **Tipo:** `Array<{ token: string, provide: any }>`
- **Valor predeterminado:** `[]`
- **Ejemplo:**
```typescript
[
  { token: 'DATABASE_URL', provide: 'postgresql://localhost:5432/mydb' },
  { token: 'CONFIG', provide: { apiKey: 'secret' } }
]
```

#### `swagger`
Configuración de documentación Swagger. Ver [Swagger](/es/reference/swagger) para más detalles.
- **Tipo:** `SwaggerConfig | undefined`
- **Valor predeterminado:** `undefined`
- **Ejemplo:**
```typescript
{
  enabled: true,
  path: '/api-docs',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation'
  }
}
```

#### `enableDecoratorValidation`
Habilita la validación de decoradores al inicio para detectar errores de configuración.
- **Tipo:** `boolean`
- **Valor predeterminado:** `true`

## createServer() vs createApp()

### createServer()

Crea un servidor HTTP e inicia la escucha automáticamente:

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController],
  port: 3000,
  debug: true
});
```

**Usar cuando:**
- Quieres iniciar tu servidor inmediatamente
- No necesitas configuración adicional de Express
- Estás construyendo una API simple

### createApp()

Devuelve una aplicación Express para configuración manual:

```typescript
import yasui from 'yasui';

const app = yasui.createApp({
  controllers: [UserController]
});

// Agregar middleware personalizado de Express
app.use('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Agregar rutas personalizadas
app.get('/custom', (req, res) => {
  res.json({ message: 'Custom route' });
});

// Iniciar el servidor manualmente
app.listen(3000, () => {
  console.log('Servidor ejecutándose en el puerto 3000');
});
```

**Usar cuando:**
- Necesitas configuración personalizada de Express
- Quieres agregar rutas o middleware personalizados
- Necesitas más control sobre el inicio del servidor
- Estás integrando con aplicaciones Express existentes

## Ejemplos de Configuración

### Configuración Básica de API

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  port: 3000,
  debug: true
});
```

### Configuración Completa

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  middlewares: [LoggingMiddleware, AuthMiddleware],
  globalPipes: [ValidationPipe, TrimPipe],
  port: 3000,
  protocol: 'http',
  debug: false,
  environment: 'production',
  enableDecoratorValidation: true,
  injections: [
    { token: 'DATABASE_URL', provide: process.env.DATABASE_URL },
    { token: 'JWT_SECRET', provide: process.env.JWT_SECRET }
  ],
  swagger: {
    enabled: true,
    path: '/api-docs',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API completa con todas las características'
    }
  }
});
```

### Integración con Express

```typescript
import yasui from 'yasui';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = yasui.createApp({
  controllers: [UserController],
  middlewares: [LoggingMiddleware]
});

// Agregar middleware de Express
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Agregar rutas personalizadas
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '¡Algo salió mal!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
```

## Modo Debug

Habilita el modo debug para ver información detallada:

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true
});
```

El modo debug proporciona:
- Registro de peticiones/respuestas
- Detalles de inyección de dependencias
- Información de registro de rutas
- Trazas de errores
