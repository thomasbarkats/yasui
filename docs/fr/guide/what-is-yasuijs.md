# Qu'est-ce que YasuiJS?

YasuiJS est un framework d'API REST moderne et léger conçu spécifiquement pour les développeurs TypeScript. Il prend la simplicité d'Express.js et l'améliore avec des décorateurs puissants et l'injection de dépendances, rendant le développement d'API plus intuitif et maintenable.

## Pourquoi YasuiJS?

La création d'API REST peut être répétitive et sujette aux erreurs. Les applications Express.js traditionnelles nécessitent beaucoup de code standard pour l'enregistrement des routes, l'extraction des paramètres et la gestion des dépendances. YasuiJS élimine cette complexité en fournissant une approche déclarative du développement d'API.

### Le problème des approches traditionnelles

Lors de la création d'API avec Express.js simple, vous vous retrouvez souvent avec un code comme celui-ci:

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

Cette approche fonctionnelle présente plusieurs limitations:
- Extraction et validation manuelle des paramètres
- Gestion des erreurs répétitive
- Difficile à tester en raison d'un couplage fort
- Pas de génération automatique de documentation
- Difficile à organiser et à faire évoluer à mesure que les applications grandissent

### L'approche YasuiJS

YasuiJS adopte une approche orientée objet basée sur les classes avec des décorateurs:

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

Bien que cela puisse sembler plus verbeux à première vue, l'approche basée sur les classes apporte des avantages architecturaux significatifs.

## Philosophie fondamentale

YasuiJS est construit autour de ces principes fondamentaux:

### Architecture orientée objet
Les classes et les décorateurs offrent une meilleure organisation, encapsulation et maintenabilité. Cette approche soutient naturellement les modèles architecturaux établis comme l'architecture en oignon, l'architecture hexagonale et l'architecture propre.

### Injection de dépendances
L'injection de dépendances intégrée permet un couplage faible, une meilleure testabilité et une séparation plus nette des préoccupations. Les dépendances sont explicitement déclarées et automatiquement résolues.

### Déclaratif plutôt qu'impératif
Au lieu d'enregistrer manuellement les routes et d'extraire les paramètres, vous déclarez ce que vous voulez en utilisant des décorateurs. Le framework gère les détails d'implémentation.

### TypeScript d'abord
Chaque fonctionnalité est conçue en pensant à TypeScript, offrant une sécurité de type complète et un excellent support IDE.

### Dépendances minimales
Garder les choses légères avec des dépendances externes minimales, en se concentrant sur l'essentiel.

## Avantages architecturaux

### Meilleure organisation du code
L'approche basée sur les classes organise naturellement les fonctionnalités connexes ensemble. Les contrôleurs regroupent les points de terminaison associés, les services encapsulent la logique métier, et les dépendances sont clairement définies.

### Testabilité
L'injection de dépendances rend les tests unitaires simples. Vous pouvez facilement simuler des dépendances et tester des composants de manière isolée.

### Évolutivité
À mesure que les applications grandissent, l'approche structurée aide à maintenir la qualité du code. Une séparation claire entre les contrôleurs, les services et les couches de données empêche le code spaghetti.

### Adaptabilité aux modèles classiques
YasuiJS prend naturellement en charge les modèles architecturaux établis:
- **Architecture en oignon**: Séparation claire entre les couches de domaine, d'application et d'infrastructure
- **Architecture hexagonale**: Modèle de ports et adaptateurs avec inversion de dépendance
- **Architecture propre**: Indépendance des frameworks, des bases de données et des agences externes

### Maintenabilité
Des frontières claires entre les composants, des dépendances explicites et un routage déclaratif rendent la base de code plus facile à comprendre et à modifier.

## Quand choisir YasuiJS

YasuiJS est parfait lorsque vous avez besoin de:

- **Architecture structurée**: Construire des applications qui vont grandir et nécessitent une organisation claire
- **Développement en équipe**: Plusieurs développeurs travaillant sur la même base de code
- **Applications d'entreprise**: Applications nécessitant maintenabilité et testabilité
- **Conception pilotée par le domaine**: Applications avec une logique métier complexe
- **Microservices**: Services qui doivent être déployables et testables indépendamment

## Fondation Express.js

YasuiJS est construit sur Express.js, vous obtenez donc:
- Tous les avantages de performance et d'écosystème d'Express.js
- Compatibilité avec les middleware Express.js existants
- Chemin de migration progressif depuis les applications Express.js existantes
- Concepts familiers pour les développeurs Express.js

YasuiJS ne remplace pas Express.js—il l'améliore avec des modèles architecturaux modernes tout en conservant tous les avantages de l'écosystème Express.js.