# Configuración

Referencia completa de configuración para aplicaciones YasuiJS usando `yasui.createServer()` y `yasui.createApp()`.

## Descripción General

YasuiJS proporciona dos formas principales de crear tu aplicación:

- **`yasui.createServer(config)`** - Crea e inicia un servidor automáticamente
- **`yasui.createApp(config)`** - Devuelve un manejador fetch para configuración manual del servidor

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
Array de middlewares globales para aplicar a todas las solicitudes. Deben ser clases middleware de YasuiJS decoradas con `@Middleware()`.
- **Tipo:** `Array<Constructor>`
- **Por defecto:** `[]`
- **Valor de ejemplo:** `[LoggingMiddleware, AuthMiddleware]`
- **Nota:** Los middlewares de Express (como `cors()`, `helmet()`) no son compatibles con YasuiJS 4.x

#### `globalPipes`
Array de pipes globales para aplicar a todos los parámetros de ruta. Ver [Pipes](/es/reference/pipes) para detalles.  
- **Tipo:** `Array<Constructor<IPipeTransform>>`
- **Por defecto:** `[]`
- **Valor de ejemplo:** `[ValidationPipe, TrimPipe]`

#### `environment`
Nombre del entorno para tu aplicación.
- **Tipo:** `string`
- **Por defecto:** `undefined`
- **Valor de ejemplo:** `production`

#### `port`
Número de puerto para el servidor. Solo se usa con `createServer()`.
- **Tipo:** `number | string`
- **Por defecto:** `3000`

#### `hostname`
Nombre del host al cual vincular el servidor.
- **Tipo:** `string | undefined`
- **Por defecto:** `'localhost'` en desarrollo, undefined en producción

#### `tls`
Configuración TLS/HTTPS. Cuando se proporciona, el servidor usa HTTPS automáticamente.
- **Tipo:** `TLSConfig | undefined`
- **Por defecto:** `undefined` (HTTP)
- **Valor de ejemplo:**
```typescript
{
  cert: './path/to/cert.pem',  // o string PEM
  key: './path/to/key.pem',    // o string PEM
  passphrase: 'optional',      // frase de contraseña opcional de la clave
  ca: './path/to/ca.pem'       // certificados CA opcionales
}
```

#### `runtimeOptions`
Opciones de configuración específicas del runtime.
- **Tipo:** `RuntimeOptions | undefined`
- **Por defecto:** `undefined`
- **Valor de ejemplo:**
```typescript
{
  node: {
    http2: true,              // Habilitar HTTP/2 (por defecto: true con TLS)
    maxHeaderSize: 16384,     // Personalizar tamaño de encabezado
    ipv6Only: false           // Modo solo IPv6
  }
}
```

#### `debug`
Habilitar modo debug con logging adicional y rastreo de solicitudes.
- **Tipo:** `boolean`
- **Por defecto:** `false`

#### `injections`
Tokens de inyección personalizados para inyección de dependencias. Ver [Inyección de Dependencias](/es/reference/dependency-injection) para detalles.
- **Tipo:** `Array<Injection>`
- **Por defecto:** `[]`

Donde `Injection` es:
```typescript
{ token: string; provide: any } | // Valor directo
{ token: string; factory: () => Promise<any>; deferred?: boolean } // Factory
```

- **Valores de ejemplo:**
```typescript
[
  // Valor directo
  { token: 'API_KEY', provide: 'value' },

  // Factory asíncrona (construida antes de que el servidor inicie)
  {
    token: 'DATABASE',
    factory: async () => {
      const db = new Database();
      await db.connect();
      return db;
    }
  },
  // Factory no bloqueante (el servidor inicia sin ella y acepta errores)
  {
    token: 'ANALYTICS',
    deferred: true,
    factory: async () => {
      const analytics = new AnalyticsClient();
      await analytics.connect();
      return analytics;
    },
  }
]
```

#### `swagger`
Configuración de documentación Swagger. Ver [Swagger](/es/reference/swagger) para detalles.
- **Tipo:** `SwaggerConfig | undefined`
- **Por defecto:** `undefined`
- **Valor de ejemplo:**
```typescript
{
  enabled: true,
  path: '/api-docs',
  info: {
    title: 'Mi API',
    version: '1.0.0',
    description: 'Documentación de la API'
  }
}
```

#### `enableDecoratorValidation`
Habilitar validación de decoradores al inicio para detectar errores de configuración.
- **Tipo:** `boolean`
- **Por defecto:** `true`

## createServer() vs createApp()

### createServer()

Crea un servidor y comienza a escuchar automáticamente:

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
- Estás construyendo una API estándar
- No necesitas configuración personalizada del servidor

### createApp()

Devuelve un manejador fetch compatible con cualquier servidor o plataforma basada en Web Standards:

```typescript
import yasui from 'yasui';

const app = yasui.createApp({
  controllers: [UserController]
});

// app.fetch es un manejador fetch estándar - usar con CUALQUIER servidor compatible

// Opción 1: SRVX (multi-runtime)
import { serve } from 'srvx';
serve({
  fetch: app.fetch,
  port: 3000
});

// Opción 2: Deno Nativo
Deno.serve({ port: 3000 }, app.fetch);

// Opción 3: Bun Nativo
Bun.serve({
  port: 3000,
  fetch: app.fetch
});

// Opción 4: Cloudflare Workers
export default {
  fetch: app.fetch
};

// Opción 5: Vercel Edge Functions
export const GET = app.fetch;
export const POST = app.fetch;

// Opción 6: Servidor http de Node.js
import { createServer } from 'http';
createServer(async (req, res) => {
  const response = await app.fetch(req);
  // Convertir Response a respuesta de Node.js
});
```

**Usar cuando:**
- Necesitas configuración personalizada del servidor
- Quieres más control sobre el inicio del servidor
- Estás desplegando en runtimes edge (Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy)
- Estás desplegando en plataformas serverless
- Estás integrando con características específicas de la plataforma

### Despliegue en Runtime Edge

Para runtimes edge, usa `createApp()` para obtener un manejador fetch estándar:

```typescript
const app = yasui.createApp({
  controllers: [UserController],
  middlewares: [CorsMiddleware]
});

// Desplegar en Cloudflare Workers
export default { fetch: app.fetch };

// Desplegar en Vercel Edge
export const GET = app.fetch;
export const POST = app.fetch;

// Desplegar en Deno Deploy
Deno.serve(app.fetch);
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
- Logging de solicitudes/respuestas
- Detalles de inyección de dependencias
- Información de registro de rutas
- Trazas de pila de errores

## Environment

YasuiJS proporciona acceso a variables de entorno que es independiente del runtime. Úsalo en lugar de `process.env` para asegurar compatibilidad en Node.js, Deno y Bun.

- `getEnv(name: string, fallback?: string): string` - Leer variable de entorno con valor de respaldo opcional

```typescript
import { getEnv, Injectable } from 'yasui';

@Injectable()
export class DatabaseService {
  private readonly dbUrl = getEnv('DATABASE_URL', 'localhost');
  private readonly port = getEnv('DB_PORT', '5432');

  connect() {
    console.log(`Conectando a ${this.dbUrl}:${this.port}`);
  }
}
```