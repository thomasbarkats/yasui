# Documentación de API (Swagger)

YasuiJS proporciona generación de documentación OpenAPI con integración opcional de Swagger UI. Genera automáticamente documentación a partir de tus decoradores existentes y te permite mejorarla con metadatos adicionales.

## Configuración

### Configuración Básica

Habilita Swagger agregando configuración a tu aplicación. YasuiJS genera automáticamente documentación de tus controladores, rutas y decoradores.

**Nota**: Necesitas instalar `swagger-ui-express` por separado:
```bash
npm install swagger-ui-express
```

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    enabled: true,
    info: {
      title: 'Mi API',
      version: '1.0.0'
    }
  }
});
```

La documentación estará accesible en `/api-docs` (ruta predeterminada) y la especificación JSON en `/api-docs.json`.

### Configuración Completa

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    enabled: true,
    path: '/docs', // Ruta personalizada
    info: {
      title: 'API de Gestión de Usuarios',
      version: '2.1.0',
      description: 'API completa para operaciones de gestión de usuarios',
      contact: {
        name: 'Soporte API',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: 'Servidor de producción'
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ]
  }
});
```

## Documentación Mejorada

Enriquece la documentación API predeterminada con decoradores opcionales. Todos los decoradores se adjuntan al método del endpoint:

### Operación API

- `@ApiOperation(summary, description?, tags?)` - Describe el endpoint

```typescript
import { ApiOperation } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/')
  @ApiOperation('Obtener todos los usuarios', 'Recuperar una lista de todos los usuarios en el sistema', ['usuarios'])
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/')
  @ApiOperation('Crear usuario', 'Crear una nueva cuenta de usuario')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### Documentación de Parámetros

- `@ApiParam(name, description?, required?, schema?)` - Documenta parámetros de ruta
- `@ApiQuery(name, description?, required?, schema?)` - Documenta parámetros de consulta
- `@ApiHeader(name, description?, required?, schema?)` - Documenta encabezados

```typescript
import { ApiParam, ApiQuery, ApiHeader } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiParam('id', 'Identificador único del usuario', true, { type: 'string' })
  @ApiHeader('Authorization', 'Token Bearer para autenticación', true)
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('/')
  @ApiQuery('page', 'Número de página para paginación', false, { type: 'number', default: 1 })
  @ApiQuery('limit', 'Número de elementos por página', false, { type: 'number', default: 10 })
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getUsers({ page, limit });
  }
}
```

### Documentación del Cuerpo de la Solicitud

- `@ApiBody(description?, schema?)` - Documenta el cuerpo de la solicitud

```typescript
import { ApiBody } from 'yasui';

@Controller('/users')
export class UserController {
  @Post('/')
  @ApiBody('Datos de creación de usuario', {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Nombre completo del usuario' },
      email: { type: 'string', format: 'email', description: 'Dirección de correo electrónico del usuario' },
      age: { type: 'number', minimum: 18, description: 'Edad del usuario (debe ser mayor de 18)' }
    },
    required: ['name', 'email']
  })
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### Documentación de Respuestas

- `@ApiResponse(statusCode, description, schema?)` - Documenta respuestas

```typescript
import { ApiResponse } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiResponse(200, 'Usuario encontrado exitosamente', {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' }
    }
  })
  @ApiResponse(404, 'Usuario no encontrado')
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('/')
  @ApiResponse(201, 'Usuario creado exitosamente')
  @ApiResponse(400, 'Datos de usuario inválidos')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

## Respuestas de Error

`ErrorResourceSchema` genera un esquema para el formato de envoltorio de error de YasuiJS. Opcionalmente puedes definir campos adicionales que se incluirán en la propiedad `data` para tus errores personalizados:

```typescript
import { ApiResponse, ErrorResourceSchema } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiResponse(404, 'Usuario no encontrado', ErrorResourceSchema())
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('/')
  @ApiResponse(400, 'Validación fallida', ErrorResourceSchema({
    fields: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Lista de campos inválidos' 
    }
  }, {
    fields: ['email', 'password']
  }))
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```