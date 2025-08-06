# Pipes

Los pipes transforman y validan los datos de solicitud entrantes antes de que lleguen a los métodos del controlador. Se ejecutan después del middleware y antes de los controladores de ruta, y operan en parámetros de ruta individuales.

## Descripción General

Los pipes de YasuiJS pueden ser útiles para:
- **Validación** - Verificar si los datos entrantes cumplen con los criterios esperados
- **Transformación** - Convertir datos a formatos o tipos deseados
- **Sanitización** - Limpiar y normalizar datos de entrada

Los pipes se pueden aplicar en tres niveles:
1. **Nivel global** - Aplicado a todos los parámetros en tu aplicación
2. **Nivel de controlador** - Aplicado a todos los parámetros en un controlador
3. **Nivel de método** - Aplicado a parámetros en métodos de ruta específicos

```typescript
import { PipeTransform, IParamMetadata } from 'yasui';

@PipeTransform()
export class ValidationPipe implements IPipeTransform {
  transform(value: any, metadata: IParamMetadata) {
    // Lógica de validación aquí
    return value;
  }
}
```

## Creando Pipes

### Interfaz de Pipe

Todos los pipes deben implementar la interfaz `IPipeTransform` con un único método `transform`:

```typescript
import { PipeTransform, IPipeTransform, IParamMetadata } from 'yasui';

@PipeTransform()
export class ParseIntPipe implements IPipeTransform {

  transform(value: any, metadata: IParamMetadata): number {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      throw new HttpError(400, `Se esperaba un número, se recibió "${value}"`);
    }
    return parsed;
  }
}
```

### IParamMetadata

El método `transform` recibe metadatos sobre el parámetro que se está procesando:

- `type`: Fuente del parámetro (body, query, param, headers etc)
- `name?`: Nombre de la propiedad en el objeto fuente de la solicitud
- `metatype?`: Tipo subyacente del parámetro, basado en la definición de tipo en el manejador de ruta

Ver el ejemplo en la sección [Integración con Class Validator](#integration-with-class-validator) para ver los metadatos en uso.

Los pipes reciben **valores tipados** después del casting automático de tipos.

## Usando Pipes

### Nivel de Método

Aplica pipes a métodos de ruta específicos usando `@UsePipes()`:

```typescript
@Controller('/users')
export class UserController {

  @Get('/:id')
  @UsePipes(ParseIntPipe)
  getUser(@Param('id') id: number) {
    // id está garantizado que sea un número
    return this.userService.findById(id);
  }
}
```

### Nivel de Controlador

Aplica pipes a todos los métodos en un controlador:

```typescript
@Controller('/users')
@UsePipes(ValidationPipe, LoggingPipe)
export class UserController {
  @Post('/')
  createUser(@Body() createUserDto: CreateUserDto) {
    // Todos los parámetros validados y registrados para todas las rutas
  }
}
```

### Nivel Global

Aplica pipes a todos los parámetros en toda tu aplicación:

```typescript
yasui.createServer({
  controllers: [UserController],
  globalPipes: [ValidationPipe, TrimPipe]
});
```

## Orden de Ejecución

Los pipes se ejecutan en este orden:

1. **Pipes globales** (en orden de registro)
2. **Pipes de controlador** (en orden de declaración)
3. **Pipes de método** (en orden de declaración)

```typescript
// Configuración
yasui.createServer({
  globalPipes: [GlobalPipe] // 1. Primero
});

@Controller('/users')
@UsePipes(ControllerPipe) // 2. Segundo
export class UserController {
  @Post('/')
  @UsePipes(MethodPipe) // 3. Tercero
  createUser(@Body() data: any) {
    // los datos han sido procesados por los tres pipes
  }
}
```

## Manejo de Errores

Los pipes pueden lanzar errores para rechazar solicitudes inválidas, como en todos los otros niveles, estos serán capturados automáticamente por Yasui:

```typescript
@PipeTransform()
export class RequiredPipe implements IPipeTransform {
  transform(value: any, metadata: IParamMetadata) {
    if (value === undefined || value === null || value === '') {
      const paramName = metadata.name || metadata.type;
      throw new HttpError(HttpCode.BAD_REQUEST, `${paramName} es requerido`);
    }
    return value;
  }
}
```

## Integración con Class Validator

Los pipes de YasuiJS pueden trabajar perfectamente con class-validator y class-transformer:

<details>
<summary>Ver el ejemplo completo</summary>

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
  @UsePipes(ValidationPipe) // Usa decoradores de class-validator
  createUser(@Body() createUserDto: CreateUserDto) {
    // createUserDto está validado y tipado
    return this.userService.create(createUserDto);
  }
}

@PipeTransform()
export class ValidationPipe implements IPipeTransform {
  async transform(value: any, metadata: ParamMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query') {
      return value;
    }
    // Omite validación para tipos primitivos
    if (!metadata.metatype || this.isPrimitiveType(metadata.metatype)) {
      return value;
    }

    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map(err => 
        Object.values(err.constraints || {}).join(', ')
      ).join('; ');

      throw new HttpError(400, `Validación fallida: ${messages}`);
    }
    return object;
  }

  private isPrimitiveType(type: Function): boolean {
    return [String, Boolean, Number, Array, Object].includes(type);
  }
}
```
</details>
