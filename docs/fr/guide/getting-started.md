# Commencer

Ce guide vous permettra de créer votre première API en quelques minutes seulement.

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Node.js** (version 18 ou supérieure), **Deno**, ou **Bun** - YasuiJS fonctionne sur tous les environnements d'exécution
- **npm**, **pnpm**, **yarn**, ou votre gestionnaire de paquets préféré
- Connaissances de base de **TypeScript**

Vous pouvez vérifier la version de votre environnement d'exécution avec :
```bash
node --version  # Node.js
deno --version  # Deno
bun --version   # Bun
```

Ce guide utilise Node.js, mais le même code fonctionne sur :
- Environnements d'exécution traditionnels : Node.js, Deno, Bun
- Environnements d'exécution edge : Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy
- Serverless : AWS Lambda, Vercel Functions, Netlify Functions

## Démarrage Rapide

Créons votre première API YasuiJS en 3 étapes simples.

### Étape 1 : Installer YasuiJS

Créez un nouveau répertoire et installez YasuiJS :

```bash
mkdir my-yasui-api
cd my-yasui-api
npm init -y
npm install yasui
npm install -D typescript @types/node
```

### Étape 2 : Configurer TypeScript

Créez un fichier `tsconfig.json` :

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

### Étape 3 : Créer Votre Première API

Créez `app.ts` :

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

### Étape 4 : Exécuter Votre API

Ajoutez des scripts à votre `package.json` :

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "tsc && node dist/app.js"
  }
}
```

Compilez et exécutez votre API :

```bash
npm run dev
```

Visitez `http://localhost:3000` et vous verrez :
```json
{ "message": "Hello World!" }
```

Félicitations ! Vous avez une API YasuiJS fonctionnelle.

## Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Assurez-vous que votre `tsconfig.json` contient `experimentalDecorators: true`
2. Vérifiez que vous utilisez la syntaxe d'importation correcte
3. Vérifiez vos versions de TypeScript et Node.js
4. Consultez la sortie de la console pour des messages d'erreur détaillés