# Qu'est-ce que YasuiJS ?

YasuiJS est un framework d'API REST moderne et léger conçu spécifiquement pour les développeurs TypeScript. Construit sur les standards Web avec un support multi-runtime (Node.js, Deno et Bun), il fournit des décorateurs puissants et l'injection de dépendances, rendant le développement d'API plus intuitif et maintenable.

## Pourquoi YasuiJS ?

Construire des API REST peut être répétitif et source d'erreurs. Les applications Express.js traditionnelles nécessitent beaucoup de code passe-partout pour l'enregistrement des routes, l'extraction des paramètres et la gestion des dépendances. YasuiJS élimine cette complexité en fournissant une approche déclarative au développement d'API.

### Le problème avec les approches traditionnelles

Lors de la construction d'API avec Express.js simple, vous vous retrouvez souvent avec du code comme celui-ci :

```typescript
// Traditional Express.js approach
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const users = getUsersList(page);
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const id = req.params.id;
  const user = getUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});
```

Cette approche fonctionnelle a plusieurs limitations :
- Extraction et validation manuelles des paramètres
- Gestion d'erreurs répétitive
- Difficile à tester en raison du couplage fort
- Pas de génération automatique de documentation
- Difficile à organiser et faire évoluer à mesure que les applications grandissent

### L'approche YasuiJS

YasuiJS adopte une approche orientée objet basée sur les classes avec des décorateurs :

```typescript
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers(@Query('page') page: number = 1) {
    return this.userService.getUsers(page);
  }

  @Get('/:id')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
```

Bien que cela puisse sembler plus verbeux au premier coup d'œil, l'approche basée sur les classes apporte des avantages architecturaux significatifs.

## Philosophie fondamentale

YasuiJS est construit autour de ces principes fondamentaux :

### Architecture orientée objet
Les classes et décorateurs fournissent une meilleure organisation, encapsulation et maintenabilité. Cette approche supporte naturellement les modèles architecturaux établis comme l'architecture en oignon, l'architecture hexagonale et l'architecture propre.

### Injection de dépendances
L'injection de dépendances intégrée permet un couplage lâche, une meilleure testabilité et une séparation plus propre des préoccupations. Les dépendances sont explicitement déclarées et automatiquement résolues.

### Déclaratif plutôt qu'impératif
Au lieu d'enregistrer manuellement les routes et d'extraire les paramètres, vous déclarez ce que vous voulez en utilisant des décorateurs. Le framework gère les détails d'implémentation.

### TypeScript d'abord
Chaque fonctionnalité est conçue avec TypeScript à l'esprit, fournissant une sécurité de type complète et un excellent support IDE.

### Dépendances minimales
Garder les choses légères avec des dépendances externes minimales, en se concentrant sur l'essentiel.

## Avantages architecturaux

### Meilleure organisation du code
L'approche basée sur les classes organise naturellement les fonctionnalités liées ensemble. Les contrôleurs regroupent les points de terminaison liés, les services encapsulent la logique métier, et les dépendances sont clairement définies.

### Testabilité
L'injection de dépendances rend les tests unitaires simples. Vous pouvez facilement simuler les dépendances et tester les composants de manière isolée.

### Évolutivité
À mesure que les applications grandissent, l'approche structurée aide à maintenir la qualité du code. La séparation claire entre les contrôleurs, services et couches de données prévient le code spaghetti.

### Adaptabilité aux modèles classiques
YasuiJS supporte naturellement les modèles architecturaux établis :
- **Architecture en oignon** : Séparation claire entre les couches domaine, application et infrastructure
- **Architecture hexagonale** : Modèle ports et adaptateurs avec inversion de dépendances
- **Architecture propre** : Indépendance des frameworks, bases de données et agences externes

### Maintenabilité
Des frontières claires entre les composants, des dépendances explicites et un routage déclaratif rendent la base de code plus facile à comprendre et modifier.

## Quand choisir YasuiJS

YasuiJS est parfait quand vous avez besoin de :

- **Architecture structurée** : Construire des applications qui vont grandir et ont besoin d'une organisation claire
- **Développement en équipe** : Plusieurs développeurs travaillant sur la même base de code
- **Applications d'entreprise** : Applications nécessitant maintenabilité et testabilité
- **Conception pilotée par le domaine** : Applications avec une logique métier complexe
- **Microservices** : Services qui doivent être déployables et testables indépendamment

## Multi-Runtime et fondation agnostique de plateforme

YasuiJS est construit sur les standards Web, fournissant une véritable flexibilité de déploiement :

### Avec createServer() (srvx)
- **Support multi-runtime** : Node.js, Deno et Bun
- **Configuration simple** : Une commande démarre votre serveur
- **Fonctionnalités intégrées** : TLS/HTTPS, HTTP/2, fichiers statiques

### Avec createApp() (gestionnaire fetch)
- **Agnostique de plateforme** : Retourne un gestionnaire fetch standard
- **Compatible runtime Edge** : Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy
- **Prêt pour le serverless** : AWS Lambda, Vercel Functions, Netlify Functions
- **Flexible** : Utilisez n'importe quel serveur ou plateforme compatible avec les standards Web

### Avantages principaux
- **Standards modernes** : Construit sur l'API fetch et les Request/Response des standards Web
- **Performance** : Optimisé pour les forces de chaque runtime
- **À l'épreuve du futur** : Basé sur les standards de la plateforme web, pas sur des API spécifiques au framework
- **Propriétés compatibles Express** : YasuiJS Request inclut des propriétés familières (req.query, req.params, req.body) pour une migration plus facile

YasuiJS embrasse les standards web modernes tout en fournissant une expérience développeur familière. Déployez n'importe où - des serveurs traditionnels aux runtimes edge.