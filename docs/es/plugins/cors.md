# CORS

Middleware CORS (Cross-Origin Resource Sharing) listo para producción para aplicaciones YasuiJS. Maneja solicitudes preflight, validación de orígenes, credenciales y características de seguridad modernas.

## Instalación

::: code-group
```bash [npm]
npm install @yasui/cors
```

```bash [pnpm]
pnpm add @yasui/cors
```

```bash [bun]
bun add @yasui/cors
```

```bash [deno]
deno add jsr:@yasui/cors
```
:::

## Descripción general

El paquete `@yasui/cors` proporciona un middleware CORS compatible con los estándares con características avanzadas que incluyen:

- **Validación de orígenes** - Coincidencia exacta, comodín o patrones regex
- **Manejo de preflight** - Procesamiento automático de solicitudes OPTIONS
- **Soporte de credenciales** - Manejo de cookies y encabezados de autorización
- **Optimización de caché** - Gestión adecuada del encabezado `Vary`
- **Private Network Access** - Soporte para la especificación CORS-RFC1918
- **Seguridad primero** - Valores predeterminados y validación conforme a los estándares de la industria

**Importante:** Este es un middleware funcional (no basado en clases). Funciona junto con los middlewares de clase de YasuiJS y debe registrarse en el array global `middlewares`.

## Inicio rápido

### Uso básico

```typescript
import yasui from 'yasui';
import { cors } from '@yasui/cors';

yasui.createServer({
  middlewares: [
    cors({
      origins: ['https://app.example.com', 'https://admin.example.com']
    })
  ],
  controllers: [UserController]
});
```

### Comodín (Solo desarrollo)

```typescript
import { cors } from '@yasui/cors';

yasui.createServer({
  middlewares: [
    cors({
      origins: '*'  // ⚠️ No recomendado para producción
    })
  ],
  controllers: [UserController]
});
```

**Advertencia:** No se recomienda usar `origins: '*'` en producción. Siempre especifica orígenes exactos o usa patrones regex para mejor seguridad.

## Configuración

La función `cors()` acepta un objeto de configuración con las siguientes opciones:

### `origins` (requerido)

Orígenes permitidos para solicitudes cross-origin. Puede ser un comodín, un array de orígenes exactos o un array que incluya patrones regex.

- **Tipo:** `string[] | RegExp[] | (string | RegExp)[] | '*'`
- **Requerido:** Sí
- **Ejemplos:**

```typescript
// Orígenes exactos
cors({
  origins: ['https://app.example.com', 'https://admin.example.com']
})

// Comodín (solo desarrollo)
cors({
  origins: '*'
})

// Patrones regex para subdominios dinámicos
cors({
  origins: [
    'https://app.example.com',
    /^https:\/\/.*\.example\.com$/  // Coincide con cualquier subdominio
  ]
})
```

### `methods`

Métodos HTTP permitidos en solicitudes cross-origin.

- **Tipo:** `string`
- **Por defecto:** `'GET,POST,PUT,DELETE,PATCH,OPTIONS'`
- **Ejemplo:**

```typescript
cors({
  origins: ['https://app.example.com'],
  methods: 'GET,POST,DELETE'
})
```

### `headers`

Encabezados de solicitud permitidos en solicitudes cross-origin.

- **Tipo:** `string`
- **Por defecto:** `'Content-Type,Authorization'`
- **Ejemplo:**

```typescript
cors({
  origins: ['https://app.example.com'],
  headers: 'Content-Type,Authorization,X-API-Key'
})
```

### `credentials`

Permitir credenciales (cookies, encabezados de autorización) en solicitudes cross-origin.

- **Tipo:** `boolean`
- **Por defecto:** `false`
- **Importante:** No se puede usar con `origins: '*'` (arrojará error al inicio)

```typescript
cors({
  origins: ['https://app.example.com'],  // Debe especificar orígenes exactos
  credentials: true
})
```

**Nota de seguridad:** Cuando `credentials: true`, los navegadores requieren un origen exacto en el encabezado `Access-Control-Allow-Origin`. El middleware aplica esto al inicio y arrojará un error si intentas usar comodines con credenciales.

### `maxAge`

Duración del caché de respuesta preflight en segundos. Determina cuánto tiempo los navegadores almacenan en caché la respuesta preflight.

- **Tipo:** `number`
- **Por defecto:** `86400` (24 horas)
- **Ejemplo:**

```typescript
cors({
  origins: ['https://app.example.com'],
  maxAge: 3600  // 1 hora
})
```

### `exposeHeaders`

Encabezados de respuesta expuestos al cliente (accesibles vía JavaScript).

- **Tipo:** `string`
- **Por defecto:** `undefined`
- **Ejemplo:**

```typescript
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: 'X-Total-Count,X-Page-Number'
})
```

**Uso:** Por defecto, los navegadores solo exponen encabezados seguros (como `Content-Type`). Usa esta opción para exponer encabezados personalizados al JavaScript del lado del cliente.

### `allowNullOrigin`

Permitir solicitudes con origen `null` (file://, iframes en sandbox, contextos que preservan privacidad).

- **Tipo:** `boolean`
- **Por defecto:** `false`
- **Ejemplo:**

```typescript
cors({
  origins: ['https://app.example.com'],
  allowNullOrigin: true  // Permitir file:// y contextos en sandbox
})
```

**Casos de uso:**
- Pruebas desde archivos HTML locales (protocolo `file://`)
- Iframes en sandbox (`<iframe sandbox>`)
- Características del navegador que preservan privacidad

### `allowPrivateNetwork`

Habilitar soporte de Private Network Access (CORS-RFC1918) para solicitudes de redes públicas a redes privadas/locales.

- **Tipo:** `boolean`
- **Por defecto:** `false`
- **Ejemplo:**

```typescript
cors({
  origins: ['https://app.example.com'],
  allowPrivateNetwork: true
})
```

**Caso de uso:** Permite que las aplicaciones web accedan a recursos de red local (ej: `http://192.168.1.100`) cuando el navegador lo solicita mediante el encabezado preflight `Access-Control-Request-Private-Network`.

**Nota de seguridad:** El middleware solo envía `Access-Control-Allow-Private-Network: true` si la solicitud preflight incluye explícitamente `Access-Control-Request-Private-Network: true`, siguiendo la especificación CORS-RFC1918.

## Cómo funciona

### Solicitudes preflight

Cuando un navegador realiza una solicitud cross-origin con encabezados o métodos personalizados, primero envía una solicitud preflight `OPTIONS`.

El middleware CORS intercepta esto y responde con los encabezados apropiados.

### Solicitudes reales

Para solicitudes reales, el middleware agrega los encabezados CORS a la respuesta.

### Rechazo de origen

Cuando un origen no está permitido, el middleware:
1. **Preflight (OPTIONS):** Retorna `204 No Content` sin encabezados CORS (estándar de la industria)
2. **Solicitudes reales:** Pasa sin agregar encabezados CORS

El navegador entonces bloquea la respuesta, previniendo el acceso JavaScript.

**¿Por qué 204 en lugar de 403?** Retornar 204 sin encabezados CORS es el estándar de la industria (usado por Express, Fastify, etc.) porque evita filtrar información sobre la existencia de un endpoint.

### Gestión de caché

El middleware gestiona automáticamente el encabezado `Vary: Origin`:

- **Cuando `origins: '*'` sin credenciales:** Sin encabezado `Vary` (respuesta idéntica para todos los orígenes)
- **Cuando lista de orígenes o credenciales:** Agrega encabezado `Vary: Origin`
- **Cuando encabezado `Vary` existente:** Fusiona `Origin` con valores existentes

Esto garantiza que los CDN y navegadores almacenen en caché las respuestas CORS correctamente.

## Mejores prácticas de seguridad

### 1. Nunca usar comodines con credenciales

```typescript
// ❌ MALO - Arrojará error al inicio
cors({
  origins: '*',
  credentials: true  // Error: no se puede usar credenciales con comodín
})

// ✅ BUENO
cors({
  origins: ['https://app.example.com'],
  credentials: true
})
```

### 2. Validar orígenes estrictamente

```typescript
// ❌ ARRIESGADO - Demasiado permisivo
cors({
  origins: '*'
})

// ✅ MEJOR - Orígenes explícitos
cors({
  origins: ['https://app.example.com']
})

// ✅ BUENO - Regex para comodines controlados
cors({
  origins: [/^https:\/\/[a-z0-9-]+\.example\.com$/]
})
```

### 3. Minimizar encabezados expuestos

```typescript
// ❌ ARRIESGADO - Expone todos los encabezados
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: '*'  // No recomendado
})

// ✅ BUENO - Solo exponer encabezados necesarios
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: 'X-Total-Count,X-Page-Number'
})
```

### 4. Usar configuración basada en entorno

```typescript
// ✅ BUENO - Configs diferentes para dev/prod
const corsConfig = {
  origins: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000'],
  credentials: true
};

yasui.createServer({
  middlewares: [cors(corsConfig)],
  controllers: [UserController]
});
```

## Detalles técnicos

**Importante:** El middleware CORS debe registrarse en el array global `middlewares` para interceptar solicitudes OPTIONS:

```typescript
yasui.createServer({
  middlewares: [cors({ origins: [...] })],  // ✅ Registrado globalmente
  controllers: [UserController]
});
```

Si obtienes un 404 en solicitudes preflight, verifica que el middleware esté registrado a nivel de aplicación, no a nivel de controlador o ruta.

### Validación al inicio

El middleware valida la configuración al inicio de la aplicación (no por solicitud):
- ❌ Arroja error si `credentials: true` con `origins: '*'`

### Fusión de encabezados

Al inyectar encabezados CORS en las respuestas:
- Preserva encabezados de respuesta existentes
- Fusiona encabezado `Vary` inteligentemente (no sobrescribe `Vary: Accept-Encoding`)
- Usa `Headers.set()` para encabezados CORS (insensible a mayúsculas)

### Optimizaciones de rendimiento

- Validación de origen usa `Array.some()` (se detiene en la primera coincidencia)
- Patrones regex compilados una vez en la creación del middleware
- Sin análisis de body para solicitudes OPTIONS (respuesta inmediata)

### Cumplimiento

- **Especificación CORS:** Cumplimiento completo con la especificación CORS del W3C
- **RFC1918:** Soporte Private Network Access
- **Estándares de la industria:** Sigue patrones Express/Fastify (204 para preflight rechazado)

## Ver también

- [Referencia Middlewares](/es/reference/middlewares) - Aprende más sobre el sistema de middlewares de YasuiJS
- [Configuración](/es/reference/config) - Configuración a nivel de aplicación
- [Manejo de Errores](/es/reference/error-handling) - Manejar errores CORS correctamente
