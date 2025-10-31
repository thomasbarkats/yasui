# Guía de Migración: v3.x a v4.x

Esta guía te ayuda a migrar de YasuiJS 3.x (basado en Express) a YasuiJS 4.x (Web Standards con [SRVX](https://srvx.h3.dev)).

## Resumen de Cambios

YasuiJS 4.x representa un cambio arquitectónico importante:

- **Eliminada la dependencia de Express** - Ahora usa Web Standards
- **createServer()** - Usa [srvx](https://srvx.h3.dev) para Node.js, Deno y Bun
- **createApp()** - Devuelve un manejador fetch estándar para cualquier plataforma Web Standards
- **Listo para Edge** - Despliega en Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy (vía createApp)
- **Compatible con Serverless** - Funciona con AWS Lambda, Vercel Functions, Netlify Functions (vía createApp)
- **Cambios incompatibles** - Los middlewares de Express ya no son compatibles
- **Nuevas características** - Soporte TLS/HTTPS, HTTP/2 en Node.js

## Cambios Incompatibles

### 1. Los Middlewares de Express No Son Compatibles

**Antes (v3.x):**
```typescript
import cors from 'cors';
import helmet from 'helmet';

yasui.createServer({
  middlewares: [cors(), helmet()]
});
```

**Después (v4.x):**
Los middlewares de Express **no son compatibles**. Debes:
1. Encontrar alternativas compatibles con Web Standards
2. Escribir middlewares nativos de YasuiJS

```typescript
@Middleware()
export class CorsMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const response = await next();

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

yasui.createServer({
  middlewares: [CorsMiddleware]
});
```

### 2. El Objeto Response Ya No Es Compatible

`@Res()` está **eliminado** - ya no es compatible.

**Antes (v3.x):**
```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Res() res: Response) {
    if (!req.headers.authorization) {
      // Usar @Res() era posible pero no recomendado
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }
}
```

**Después (v4.x):**
```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request) {
    if (!req.headers.get('authorization')) {
      // Lanza errores o devuelve objetos Response
      throw new HttpError(401, 'Unauthorized');
    }
    // Continuará al siguiente middleware o controlador si no devuelves nada/void
  }
}
```

### 3. Cambios en el Objeto Request

`@Req()` proporciona un objeto Request estándar web, en lugar de Express; solo algunas propiedades siguen siendo compatibles.

**Propiedades compatibles con Express** (aún disponibles):
- `req.path` - Pathname sin query string
- `req.hostname` - Host sin puerto
- `req.protocol` - "http" o "https"
- `req.ip` - Dirección IP del cliente
- `req.query` - Objeto query parseado
- `req.cookies` - Objeto cookies parseado
- `req.body` - Cuerpo de la petición parseado
- `req.headers` - Devuelve objeto plano para acceso a propiedades

**Después (v4.x):**
```typescript
@Get('/users')
getUsers(@Req() req: Request) {
  // Headers vía .get() en el objeto Headers nativo
  const auth = req.headers.get('authorization');

  // Las propiedades compatibles con Express aún funcionan
  const auth = req.headers.authorization;
  const page = req.query.page;
  const path = req.path;
}
```

### 4. Cambios en el Manejo de Respuestas Personalizadas

**Antes (v3.x):**
```typescript
@Get('/custom')
customResponse(@Res() res: Response) {
  res.status(418).json({ message: "I'm a teapot" });
}
```

**Después (v4.x):**
```typescript
@Get('/custom')
customResponse() {
  // Opción 1: Devolver Response de Web Standards
  return new Response(JSON.stringify({ message: "I'm a teapot" }), {
    status: 418,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 5. Tipo de Retorno de createApp()

**Antes (v3.x):**
```typescript
import express from 'express';

const app = yasui.createApp({ controllers: [UserController] });
// app es una Aplicación Express

app.use(express.json());
app.listen(3000);
```

**Después (v4.x):**
```typescript
import { serve } from 'srvx';

const app = yasui.createApp({ controllers: [UserController] });
// app es FetchHandler { fetch: Function }

serve({
  fetch: app.fetch,
  port: 3000
});
```

### 6. Cambios en la Configuración

**Antes (v3.x):**
```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [cors(), helmet()],
  protocol: 'http',
  port: 3000
});
```

**Después (v4.x):**
```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [CorsMiddleware],  // Solo middlewares de YasuiJS
  port: 3000,
  tls: {  // Nuevo: soporte TLS/HTTPS
    cert: './cert.pem',
    key: './key.pem'
  },
  runtimeOptions: {  // Nuevo: opciones específicas del runtime
    node: {
      http2: true
    }
  }
});
```

**Nuevas opciones:**
- `tls` - Configuración TLS/HTTPS
- `hostname` - Hostname del servidor
- `runtimeOptions` - Configuración específica del runtime

**Obsoleto:**
- `protocol` - Auto-determinado por la configuración `tls`

## Pasos de Migración

### Paso 1: Actualizar Dependencias

```bash
npm install yasui@latest
# o
pnpm update yasui
```

### Paso 2: Eliminar Middlewares de Express

Identifica todos los middlewares de Express en tu código:

```typescript
// ELIMINAR estos
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

yasui.createServer({
  middlewares: [cors(), helmet(), morgan('dev')]  // ❌ Ya no funciona
});
```

### Paso 3: Reemplazar con Middlewares Nativos

Escribe middlewares de YasuiJS para cada característica:

```typescript
// Crear middleware CORS nativo
@Middleware()
export class CorsMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  }
}

// Crear middleware de logging nativo
@Middleware()
export class LoggingMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Logger() logger: LoggerService, @Next() next: NextFunction) {
    logger.log(`${req.method} ${req.path}`);
    return await next();
  }
}

yasui.createServer({
  middlewares: [CorsMiddleware, LoggingMiddleware]  // ✅ Funciona
});
```

### Paso 4: Actualizar Firmas de Middlewares

Elimina el uso de `@Res()` de todos los middlewares: lanza new HttpError para estado de error, o devuelve valor.

Recuerda: Los middlewares funcionan como métodos de controlador. No necesitas llamar `next()` a menos que quieras modificar la respuesta.

### Paso 6: Actualizar Manejo Manual de Respuestas

Reemplaza los métodos de respuesta de Express con Web Standards:

**Antes:**
```typescript
@Get('/file')
downloadFile(@Res() res: Response) {
  res.sendFile('/path/to/file.pdf');
}

@Get('/redirect')
redirect(@Res() res: Response) {
  res.redirect('/new-location');
}
```

**Después:**
```typescript
@Get('/file')
async downloadFile() {
  const file = await Deno.readFile('/path/to/file.pdf'); // o fs.readFile
  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="file.pdf"'
    }
  });
}

@Get('/redirect')
redirect() {
  return new Response(null, {
    status: 302,
    headers: { 'Location': '/new-location' }
  });
}
```

### Paso 7: Actualizar Uso de createApp()

Si estabas usando `createApp()` para configuración personalizada del servidor:

**Antes:**
```typescript
const app = yasui.createApp({ controllers: [UserController] });

app.use(express.static('public'));
app.listen(3000);
```

**Después:**
```typescript
import { serve } from 'srvx';

const app = yasui.createApp({ controllers: [UserController] });

serve({
  fetch: app.fetch,
  port: 3000,
  static: {  // servir archivos estáticos con srvx
    '/': './public'
  }
});
```

### Paso 8: Probar Tu Aplicación

1. Inicia tu servidor
2. Prueba todos los endpoints
3. Verifica el comportamiento de los middlewares
4. Comprueba el manejo de errores
5. Prueba con diferentes runtimes (Node.js, Deno, Bun)

## Nuevas Características en v4.x

### Soporte TLS/HTTPS

```typescript
yasui.createServer({
  controllers: [UserController],
  port: 443,
  tls: {
    cert: './certs/cert.pem',
    key: './certs/key.pem',
    passphrase: 'opcional'
  }
});
```

### Soporte HTTP/2 (Node.js)

```typescript
yasui.createServer({
  controllers: [UserController],
  tls: {
    cert: './cert.pem',
    key: './key.pem'
  },
  runtimeOptions: {
    node: {
      http2: true  // Habilitado por defecto con TLS
    }
  }
});
```

### Multi-Runtime y Despliegue Edge

El mismo código funciona en diferentes runtimes y plataformas:

```typescript
// Runtimes tradicionales
// Funciona en Node.js, Deno y Bun
yasui.createServer({
  controllers: [UserController],
  port: 3000
});

// Runtimes Edge - usa createApp()
const app = yasui.createApp({
  controllers: [UserController]
});

// Cloudflare Workers
export default {
  fetch: app.fetch
};

// Vercel Edge Functions
export const GET = app.fetch;
export const POST = app.fetch;

// Deno Deploy
Deno.serve(app.fetch);

// Netlify Edge Functions
export default app.fetch;
```

### Despliega en Cualquier Lugar

Dado que YasuiJS devuelve un manejador fetch estándar, puedes desplegar en:
- **Servidores tradicionales**: Node.js, Deno, Bun
- **Runtimes Edge**: Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy
- **Serverless**: AWS Lambda (con adaptadores), Vercel Functions, Netlify Functions
- **Cualquier plataforma** que soporte manejadores fetch de Web Standards

## Obtener Ayuda

Si encuentras problemas durante la migración:

1. Consulta la [documentación](/es/reference/config)
2. Revisa los [ejemplos](https://github.com/thomasbarkats/yasui/tree/main/src/example)
3. Abre un issue en [GitHub](https://github.com/thomasbarkats/yasui/issues)