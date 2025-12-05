# Rate Limiting

Middleware de limitación de velocidad listo para producción para aplicaciones YasuiJS. Protege tu API del abuso limitando el número de solicitudes por ventana de tiempo, con soporte para backends de almacenamiento personalizados y generación flexible de claves.

## Instalación

::: code-group
```bash [npm]
npm install @yasui/rate-limit
```

```bash [pnpm]
pnpm add @yasui/rate-limit
```

```bash [bun]
bun add @yasui/rate-limit
```

```bash [deno]
deno add jsr:@yasui/rate-limit
```
:::

## Descripción general

El paquete `@yasui/rate-limit` proporciona un middleware de limitación de velocidad flexible con características avanzadas que incluyen:

- **Límites configurables** - Establece solicitudes máximas por ventana de tiempo
- **Almacenamiento en memoria** - Almacenamiento integrado con limpieza automática
- **Almacenamiento extensible** - Soporte para Redis, base de datos o almacenamiento personalizado
- **Generación de claves personalizada** - Limita por IP, clave API, ID de usuario o lógica personalizada
- **Encabezados estándar** - Encabezados de limitación de velocidad compatibles con RFC 6585
- **Lógica de omisión** - Lista blanca de solicitudes específicas
- **Manejadores personalizados** - Anula respuestas 429 predeterminadas

**Importante:** Este es un middleware funcional (no basado en clases). Funciona junto con los middlewares de clase de YasuiJS y debe registrarse en el array global `middlewares`.

## Inicio rápido

### Uso básico

```typescript
import yasui from 'yasui';
import { rateLimit } from '@yasui/rate-limit';

yasui.createServer({
  middlewares: [
    rateLimit({
      max: 100,       // 100 solicitudes
      windowMs: 60000 // por minuto
    })
  ],
  controllers: [UserController]
});
```

### Límites de velocidad por ruta

```typescript
import { rateLimit } from '@yasui/rate-limit';

const strictLimit = rateLimit({ max: 10, windowMs: 60000 });
const normalLimit = rateLimit({ max: 100, windowMs: 60000 });

@Controller('/api')
export class ApiController {
  @Post('/login', strictLimit)
  login() {
    // Estricto: 10 solicitudes por minuto
  }

  @Get('/data', normalLimit)
  getData() {
    // Normal: 100 solicitudes por minuto
  }
}
```

## Configuración

La función `rateLimit()` acepta un objeto de configuración con las siguientes opciones:

### `max`

Número máximo de solicitudes permitidas por ventana de tiempo.

- **Tipo:** `number`
- **Predeterminado:** `100`

### `windowMs`

Duración de la ventana de tiempo en milisegundos.

- **Tipo:** `number`
- **Predeterminado:** `60000` (1 minuto)

### `keyGenerator`

Función personalizada para generar claves de limitación de velocidad. Por defecto, usa la dirección IP del cliente.

- **Tipo:** `(req: YasuiRequest) => string`

```typescript
// Limitar por clave API
rateLimit({
  max: 1000,
  windowMs: 3600000,
  keyGenerator: (req) => {
    return req.rawHeaders.get('x-api-key') ?? 'anonymous';
  }
})
```

### `handler`

Manejador personalizado para respuestas de límite de velocidad excedido. Sigue los patrones de YasuiJS: lanza `HttpError`, devuelve datos (convierte automáticamente a JSON) o devuelve `Response` para formatos personalizados.

- **Tipo:** `(req: YasuiRequest, limit: number, remaining: number, resetTime: number) => Response | unknown | Promise<Response | unknown>`

```typescript
import { HttpError } from 'yasui';

// Lanzar HttpError (recomendado para errores JSON)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req, limit) => {
    throw new HttpError(429, 'Demasiadas solicitudes. Por favor, reduzca la velocidad.');
  }
})

// Devolver objeto (convierte automáticamente a JSON con estado 429)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req, limit, remaining, resetTime) => {
    return {
      error: 'Límite de velocidad excedido',
      limit,
      remaining,
      resetTime: Math.ceil(resetTime / 1000)
    };
  }
})

// Devolver Response para formato personalizado (HTML, XML, etc.)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req) => {
    const acceptsHtml = req.rawHeaders.get('accept')?.includes('text/html');

    if (acceptsHtml) {
      return new Response(
        '<h1>Demasiadas solicitudes</h1><p>Por favor, inténtelo de nuevo más tarde.</p>',
        {
          status: 429,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    throw new HttpError(429, 'Límite de velocidad excedido');
  }
})
```

### `skip`

Función para omitir la limitación de velocidad para solicitudes específicas.

- **Tipo:** `(req: YasuiRequest) => boolean | Promise<boolean>`

```typescript
// Omitir solicitudes internas
rateLimit({
  max: 100,
  windowMs: 60000,
  skip: (req) => {
    return req.rawHeaders.get('x-internal-request') === 'true';
  }
})
```

## Cómo funciona

### Seguimiento de solicitudes

El middleware rastrea solicitudes usando un algoritmo de ventana deslizante:

1. **Extraer clave:** Usa `keyGenerator` para identificar al solicitante (IP, clave API, etc.)
2. **Incrementar contador:** Almacena marca de tiempo de solicitud en el almacén configurado
3. **Verificar límite:** Compara el conteo de solicitudes con `max`
4. **Permitir o denegar:** Devuelve 429 si se excede, de lo contrario continúa

### Encabezados de respuesta

Cuando `standardHeaders: true`, las respuestas incluyen:

```http
HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1699564800
Content-Type: application/json
```

Cuando se excede el límite de velocidad:

```http
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1699564800
Retry-After: 45
Content-Type: application/json

{"error":"Too Many Requests","message":"Rate limit exceeded. Try again in 45 seconds."}
```

## Buenas prácticas de seguridad

### 1. Usar límites conservadores

```typescript
// ✅ RAZONABLE
rateLimit({ max: 100, windowMs: 60000 })
```

### 2. Proteger endpoints sensibles

```typescript
const authLimit = rateLimit({ max: 5, windowMs: 15 * 60 * 1000 });

@Controller('/auth')
export class AuthController {
  @Post('/login', authLimit)
  login() {}
}
```

### 3. Validar entrada del generador de claves

**Comportamiento predeterminado:** Usa `X-Forwarded-For` → `X-Real-IP` → hash de firma de solicitud. Detrás de un proxy inverso, asegúrate de que los encabezados estén configurados correctamente.

**Nota:** El generador de claves predeterminado usa firma de solicitud (User-Agent + Accept-Language) como respaldo para evitar que todas las solicitudes desconocidas compartan el mismo límite de velocidad.

### 4. Usar almacenamiento persistente en producción

```typescript
// ✅ PRODUCCIÓN - Almacén Redis (persistente)
rateLimit({
  max: 100,
  windowMs: 60000,
  store: new RedisStore(redisClient, 60000)
})
```

## Detalles técnicos

El middleware de limitación de velocidad se puede aplicar en todos los niveles (aplicación, controlador, endpoint). Consulta [Referencia de Middlewares](/es/reference/middlewares) para obtener detalles sobre niveles de uso y orden de ejecución de middlewares.

### Optimizaciones de rendimiento

- Marcas de tiempo filtradas eficientemente (solo se conservan entradas válidas)
- Estrategia de limpieza dual: basada en tiempo (cada 60s) + basada en tamaño (>10k claves)
- Expulsión LRU cuando se excede el tamaño máximo (elimina el 20% de entradas más antiguas)
- Incremento sincrónico para almacén en memoria (sin sobrecarga de await)
- Encabezados inyectados sin clonar el cuerpo de respuesta

**Seguridad de memoria:** El almacén en memoria está limitado a un máximo de 10,000 claves con expulsión LRU automática. Para producción de alto tráfico (>10k IPs únicas/hora), use almacén Redis.

### Cumplimiento

- **RFC 6585:** Código de estado 429 Too Many Requests
- **Draft RFC:** Encabezados RateLimit-* (estándar borrador de IETF)
- **Estándares de la industria:** Encabezado Retry-After para lógica de reintento del cliente

## Ver también

- [Referencia de Middlewares](/es/reference/middlewares) - Aprende sobre el sistema de middleware de YasuiJS
- [Plugin CORS](/es/plugins/cors) - Compartir recursos de origen cruzado
- [Manejo de errores](/es/reference/error-handling) - Maneja errores de límite de velocidad correctamente
