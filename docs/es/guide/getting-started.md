# Primeros Pasos

Esta guía te ayudará a poner en marcha tu primera API en solo unos minutos.

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- Gestor de paquetes **npm** o **yarn**
- Conocimientos básicos de **TypeScript**

Puedes verificar tu versión de Node.js con:
```bash
node --version
```

## Inicio Rápido

Vamos a crear tu primera API YasuiJS en 3 simples pasos.

### Paso 1: Instalar YasuiJS

Crea un nuevo directorio e instala YasuiJS:

```bash
mkdir my-yasui-api
cd my-yasui-api
npm init -y
npm install yasui
npm install -D typescript @types/node
```

### Paso 2: Configurar TypeScript

Crea un archivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Paso 3: Crear Tu Primera API

Crea `app.ts`:

```typescript
import yasui, { Controller, Get } from 'yasui';

@Controller('/')
export class AppController {
  @Get('/')
  hello() {
    return { message: 'Hello World!' };
  }
}

yasui.createServer({
  controllers: [AppController]
});
```

### Paso 4: Ejecutar Tu API

Agrega scripts a tu `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "tsc && node dist/app.js"
  }
}
```

Compila y ejecuta tu API:

```bash
npm run dev
```

Visita `http://localhost:3000` y verás:
```json
{ "message": "Hello World!" }
```

¡Felicitaciones! Tienes una API YasuiJS funcionando.

## ¿Necesitas Ayuda?

Si encuentras algún problema:

1. Asegúrate de que tu `tsconfig.json` tenga `experimentalDecorators: true`
2. Verifica que estés usando la sintaxis correcta de importación
3. Comprueba tus versiones de TypeScript y Node.js
4. Revisa la salida de la consola para mensajes de error detallados
