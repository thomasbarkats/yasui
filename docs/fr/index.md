---
layout: home

hero:
  name: "YasuiJS"
  text: "Un framework REST API léger"
  tagline: Construisez des APIs puissantes avec des décorateurs et l'injection de dépendances
  image:
    src: /logo.png
    alt: YasuiJS
  actions:
    - theme: brand
      text: Qu'est-ce que YasuiJS ?
      link: /fr/guide/what-is-yasuijs
    - theme: alt
      text: Démarrage rapide
      link: /fr/guide/getting-started

features:
  - icon: 🎯
    title: Routage basé sur les décorateurs
    details: Utilisez des décorateurs intuitifs comme @Get, @Post, @Put, @Delete pour définir vos endpoints API avec enregistrement automatique des routes
  - icon: 🔧
    title: Injection de dépendances
    details: Système d'injection de dépendances intégré avec les décorateurs @Injectable et @Inject pour une architecture de code propre et testable
  - icon: 📚
    title: Documentation Swagger auto-générée
    details: Génération automatique de documentation OpenAPI/Swagger avec les décorateurs @ApiOperation, @ApiResponse et @ApiBody
  - icon: 🛡️
    title: Support des middlewares
    details: Système de middleware flexible avec support des middlewares au niveau contrôleur et route en utilisant le décorateur @Middleware
  - icon: 🔍
    title: Extraction de paramètres
    details: Liaison facile des paramètres avec les décorateurs @Param, @Query, @Body, @Header pour une gestion propre des requêtes
  - icon: ⚡
    title: Léger et rapide
    details: Surcharge minimale avec la base Express.js, optimisé pour les performances et l'expérience développeur
  - icon: 🎨
    title: TypeScript en premier
    details: Support complet de TypeScript avec sécurité des types, IntelliSense et fonctionnalités ES6+ modernes
  - icon: 🔐
    title: Sécurité intégrée
    details: Authentification par clé API, gestion d'erreurs et validation des requêtes prêtes à l'emploi
  - icon: 🚀
    title: Configuration facile
    details: Configuration zéro pour commencer, avec des fonctionnalités avancées optionnelles comme le mode debug et les injections personnalisées
---
