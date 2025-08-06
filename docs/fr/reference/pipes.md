# Pipes

Les pipes transforment et valident les données de requête entrantes avant qu'elles n'atteignent vos méthodes de contrôleur. Ils sont exécutés après les middleware et avant vos contrôleurs de route, et opèrent sur des paramètres de route individuels.

## Vue d'ensemble

Les pipes YasuiJS peuvent être utiles pour :
- **Validation** - Vérifier si les données entrantes répondent aux critères attendus
- **Transformation** - Convertir les données aux formats ou types souhaités
- **Assainissement** - Nettoyer et normaliser les données d'entrée

Les pipes peuvent être appliqués à trois niveaux :
1. **Niveau global** - Appliqué à tous les paramètres de votre application
2. **Niveau contrôleur** - Appliqué à tous les paramètres d'un contrôleur
3. **Niveau méthode** - Appliqué aux paramètres dans des méthodes de route spécifiques

```typescript
import { PipeTransform, IParamMetadata } from 'yasui';

@PipeTransform()
export class ValidationPipe implements IPipeTransform {
  transform(value: any, metadata: IParamMetadata) {
    // Logique de validation ici
    return value;
  }
}
```

## Création de Pipes

### Interface Pipe

Tous les pipes doivent implémenter l'interface `IPipeTransform` avec une seule méthode `transform` :

```typescript
import { PipeTransform, IPipeTransform, IParamMetadata } from 'yasui';

@PipeTransform()
export class ParseIntPipe implements IPipeTransform {

  transform(value: any, metadata: IParamMetadata): number {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      throw new HttpError(400, `Nombre attendu, reçu "${value}"`);
    }
    return parsed;
  }
}
```

### IParamMetadata

La méthode `transform` reçoit les métadonnées sur le paramètre en cours de traitement :

- `type`: Source du paramètre (body, query, param, headers etc)
- `name?`: Nom de la propriété dans l'objet source de la requête
- `metatype?`: Type sous-jacent du paramètre, basé sur la définition du type dans le gestionnaire de route

Voir l'exemple dans la section [Intégration avec Class Validator](#integration-with-class-validator) pour voir les métadonnées en utilisation.

Les pipes reçoivent des **valeurs typées** après la conversion automatique de type.

## Utilisation des Pipes

### Niveau Méthode

Appliquez les pipes aux méthodes de route spécifiques en utilisant `@UsePipes()` :

```typescript
@Controller('/users')
export class UserController {

  @Get('/:id')
  @UsePipes(ParseIntPipe)
  getUser(@Param('id') id: number) {
    // id est garanti d'être un nombre
    return this.userService.findById(id);
  }
}
```

### Niveau Contrôleur

Appliquez les pipes à toutes les méthodes d'un contrôleur :

```typescript
@Controller('/users')
@UsePipes(ValidationPipe, LoggingPipe)
export class UserController {
  @Post('/')
  createUser(@Body() createUserDto: CreateUserDto) {
    // Tous les paramètres sont validés et journalisés pour toutes les routes
  }
}
```

### Niveau Global

Appliquez les pipes à tous les paramètres dans toute votre application :

```typescript
yasui.createServer({
  controllers: [UserController],
  globalPipes: [ValidationPipe, TrimPipe]
});
```

## Ordre d'Exécution

Les pipes s'exécutent dans cet ordre :

1. **Pipes globaux** (dans l'ordre d'enregistrement)
2. **Pipes de contrôleur** (dans l'ordre de déclaration)
3. **Pipes de méthode** (dans l'ordre de déclaration)

```typescript
// Configuration
yasui.createServer({
  globalPipes: [GlobalPipe] // 1. Premier
});

@Controller('/users')
@UsePipes(ControllerPipe) // 2. Deuxième
export class UserController {
  @Post('/')
  @UsePipes(MethodPipe) // 3. Troisième
  createUser(@Body() data: any) {
    // les données ont été traitées par les trois pipes
  }
}
```

## Gestion des Erreurs

Les pipes peuvent lancer des erreurs pour rejeter les requêtes invalides, comme à tous les autres niveaux, celles-ci seront automatiquement capturées par Yasui :

```typescript
@PipeTransform()
export class RequiredPipe implements IPipeTransform {
  transform(value: any, metadata: IParamMetadata) {
    if (value === undefined || value === null || value === '') {
      const paramName = metadata.name || metadata.type;
      throw new HttpError(HttpCode.BAD_REQUEST, `${paramName} est requis`);
    }
    return value;
  }
}
```

## Intégration avec Class Validator

Les pipes YasuiJS peuvent fonctionner parfaitement avec class-validator et class-transformer :

<details>
<summary>Voir l'exemple complet</summary>

```typescript
import { validate, IsEmail, IsString, MinLength  } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PipeTransform, IPipeTransform, ParamMetadata, HttpError } from 'yasui';

export class CreateUserDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @MinLength(3)
  name: string;
}

@Controller('/users')
export class UserController {
  @Post('/')
  @UsePipes(ValidationPipe) // Utilise les décorateurs class-validator
  createUser(@Body() createUserDto: CreateUserDto) {
    // createUserDto est validé et typé
    return this.userService.create(createUserDto);
  }
}

@PipeTransform()
export class ValidationPipe implements IPipeTransform {
  async transform(value: any, metadata: ParamMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query') {
      return value;
    }
    // Ignore la validation pour les types primitifs
    if (!metadata.metatype || this.isPrimitiveType(metadata.metatype)) {
      return value;
    }

    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map(err => 
        Object.values(err.constraints || {}).join(', ')
      ).join('; ');

      throw new HttpError(400, `Échec de la validation : ${messages}`);
    }
    return object;
  }

  private isPrimitiveType(type: Function): boolean {
    return [String, Boolean, Number, Array, Object].includes(type);
  }
}
```
</details>
