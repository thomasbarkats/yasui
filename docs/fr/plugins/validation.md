# Validation

Validation automatique des DTO pour les applications YasuiJS utilisant [class-validator](https://github.com/typestack/class-validator). Valide les données de requête par rapport aux classes DTO avec des décorateurs, transforme les objets simples en instances de classe et fournit des réponses d'erreur structurées.

## Installation

::: code-group
```bash [npm]
npm install class-validator class-transformer @yasui/validation
```

```bash [pnpm]
pnpm add class-validator class-transformer @yasui/validation
```

```bash [bun]
bun add class-validator class-transformer @yasui/validation
```

```bash [deno]
deno add npm:class-validator npm:class-transformer jsr:@yasui/validation
```
:::

## Vue d'ensemble

Le package `@yasui/validation` fournit une validation automatique pour les DTO utilisant les décorateurs class-validator :

- **Validation automatique** - Valide les paramètres `@Body()` et `@Query()`
- **Transformation de type** - Convertit les objets simples en instances de classe
- **Sécurité d'abord** - Mode whitelist activé par défaut (empêche l'assignation de masse)
- **Erreurs structurées** - Réponses d'erreur de validation détaillées
- **Groupes de validation** - Règles de validation conditionnelles
- **Validation imbriquée** - Support de validation d'objets profonds
- **Options de performance** - Arrêt à la première erreur pour les scénarios de fail-fast

**Important :** Il s'agit d'une transformation de pipe qui s'intègre au système de pipes de YasuiJS. Elle peut être appliquée globalement via `globalPipes`, au niveau du contrôleur, ou par route en utilisant `@UsePipes()`.

## Démarrage rapide

### 1. Définir votre DTO

Créez une classe DTO avec des décorateurs class-validator :

```typescript
import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### 2. Appliquer globalement

Enregistrez le pipe de validation globalement pour valider tous les DTO :

```typescript
import yasui from 'yasui';
import { validation } from '@yasui/validation';
import { ProductController } from './controllers/product.controller';

yasui.createServer({
  globalPipes: [validation()],
  controllers: [ProductController]
});
```

### 3. Utiliser dans les contrôleurs

Le DTO est automatiquement validé et transformé :

```typescript
import { Controller, Post, Body } from 'yasui';
import { CreateProductDto } from './dtos/product.dto';

@Controller('/products')
export class ProductController {

  @Post()
  async create(@Body() dto: CreateProductDto) {
    // dto est déjà validé et transformé en instance CreateProductDto
    return { message: 'Product created', data: dto };
  }
}
```

## Configuration

La fonction `validation()` accepte un objet de configuration avec les options suivantes :

### `whitelist`

Supprime les propriétés sans décorateurs (empêche les vulnérabilités d'assignation de masse).

- **Type :** `boolean`
- **Défaut :** `true`
- **Exemple :**

```typescript
validation({
  whitelist: true  // Supprime les propriétés inconnues
})
```

**Note de sécurité :** Activé par défaut pour empêcher les attaques d'assignation de masse. Lorsque `true`, seules les propriétés avec des décorateurs class-validator sont conservées. Les propriétés inconnues sont supprimées silencieusement.

### `forbidNonWhitelisted`

Lance une erreur si des propriétés non whitelistées sont présentes (mode strict).

- **Type :** `boolean`
- **Défaut :** `false`
- **Exemple :**

```typescript
validation({
  whitelist: true,
  forbidNonWhitelisted: true  // Lance une erreur au lieu de supprimer
})
```

**Cas d'usage :** API strictes où les clients doivent envoyer des DTO exacts. Retourne une erreur 400 si des propriétés inconnues sont présentes au lieu de les supprimer silencieusement. Utile pour détecter les bugs clients tôt.

### `stopAtFirstError`

Arrête la validation à la première erreur (optimisation de performance).

- **Type :** `boolean`
- **Défaut :** `false`
- **Exemple :**

```typescript
validation({
  stopAtFirstError: true  // Mode fail-fast
})
```

**Cas d'usage :** À utiliser pour les endpoints à fort trafic où les détails complets des erreurs ne sont pas requis. Les clients reçoivent des messages d'erreur moins détaillés (seulement la première erreur), mais la validation est plus rapide.

### `groups`

Groupes de validation pour les règles de validation conditionnelles.

- **Type :** `string[]`
- **Défaut :** `undefined`
- **Exemple :**

```typescript
// DTO avec groupes
class UpdateUserDto {
  @IsEmail({ groups: ['admin'] })
  email?: string;

  @IsString({ groups: ['user', 'admin'] })
  name?: string;
}

// Appliquer la validation spécifique au groupe
validation({ groups: ['admin'] })
```

**Cas d'usage :** Passe les groupes à class-validator pour la validation conditionnelle. Voir la [documentation des groupes class-validator](https://github.com/typestack/class-validator#validation-groups) pour plus de détails.

## Configuration par défaut

Le pipe utilise des valeurs par défaut prêtes pour la production :

```typescript
{
  whitelist: true,              // Supprime les propriétés inconnues
  forbidNonWhitelisted: false,  // Mode permissif (suppression au lieu d'erreur)
  stopAtFirstError: false,      // Obtenir toutes les erreurs
  groups: []                    // Pas de groupes
}
```

## Fonctionnement

Le pipe de validation s'exécute automatiquement pour les paramètres `@Body()` et `@Query()` :

1. **Ignore les types natifs** - Contourne `String`, `Number`, `Boolean`, `Array`, `Object` (déjà type-castés par YasuiJS)
2. **Transforme** - Convertit l'objet simple en instance de classe DTO en utilisant `class-transformer`
3. **Valide** - Exécute les décorateurs class-validator sur l'instance
4. **Whitelist** - Supprime les propriétés sans décorateurs (si `whitelist: true`)
5. **Lance ou retourne** - Lance `ValidationException` (statut 400) en cas d'échec, retourne l'instance en cas de succès

Le pipe ignore automatiquement `@Param()`, `@Header()`, etc. car YasuiJS les type-caste déjà en utilisant les métadonnées TypeScript.

## Détails techniques

Le pipe s'intègre au système de pipes de YasuiJS. Voir la [référence Pipes](/fr/reference/pipes) pour les modèles d'utilisation (pipes globaux, par route avec `@UsePipes()`, etc.).

Lorsque la validation échoue, le pipe lance `ValidationException` (étend `HttpError`) avec le code de statut 400. YasuiJS gère automatiquement l'exception et retourne une réponse d'erreur.

## Voir aussi

- [Référence Pipes](/fr/reference/pipes) - En savoir plus sur le système de pipes YasuiJS
- [Gestion des erreurs](/fr/reference/error-handling) - Gérer correctement les erreurs de validation
- [class-validator](https://github.com/typestack/class-validator) - Documentation des décorateurs de validation
- [class-transformer](https://github.com/typestack/class-transformer) - Documentation de transformation de type
