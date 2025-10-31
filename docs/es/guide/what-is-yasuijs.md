# ¿Qué es YasuiJS?

YasuiJS es un framework moderno y ligero para APIs REST diseñado específicamente para desarrolladores de TypeScript. Construido sobre Estándares Web con soporte multi-runtime (Node.js, Deno y Bun), proporciona decoradores potentes e inyección de dependencias, haciendo el desarrollo de APIs más intuitivo y mantenible.

## ¿Por qué YasuiJS?

Construir APIs REST puede ser repetitivo y propenso a errores. Las aplicaciones tradicionales de Express.js requieren mucho código repetitivo para el registro de rutas, extracción de parámetros y gestión de dependencias. YasuiJS elimina esta complejidad proporcionando un enfoque declarativo para el desarrollo de APIs.

### El Problema con los Enfoques Tradicionales

Al construir APIs con Express.js puro, a menudo terminas con código como este:

```typescript
// Enfoque tradicional de Express.js
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

Este enfoque funcional tiene varias limitaciones:
- Extracción y validación manual de parámetros
- Manejo de errores repetitivo
- Difícil de probar debido al acoplamiento fuerte
- Sin generación automática de documentación
- Difícil de organizar y escalar a medida que las aplicaciones crecen

### El Enfoque de YasuiJS

YasuiJS adopta un enfoque basado en clases, orientado a objetos con decoradores:

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

Aunque esto pueda parecer más verboso a primera vista, el enfoque basado en clases aporta ventajas arquitectónicas significativas.

## Filosofía Central

YasuiJS está construido alrededor de estos principios fundamentales:

### Arquitectura Orientada a Objetos
Las clases y decoradores proporcionan mejor organización, encapsulación y mantenibilidad. Este enfoque soporta naturalmente patrones arquitectónicos establecidos como arquitectura cebolla, arquitectura hexagonal y arquitectura limpia.

### Inyección de Dependencias
La inyección de dependencias integrada permite acoplamiento débil, mejor capacidad de prueba y separación más limpia de responsabilidades. Las dependencias se declaran explícitamente y se resuelven automáticamente.

### Declarativo Sobre Imperativo
En lugar de registrar manualmente rutas y extraer parámetros, declaras lo que quieres usando decoradores. El framework maneja los detalles de implementación.

### TypeScript Primero
Cada característica está diseñada con TypeScript en mente, proporcionando seguridad de tipos completa y excelente soporte de IDE.

### Dependencias Mínimas
Mantener las cosas ligeras con dependencias externas mínimas, enfocándose en lo esencial.

## Beneficios Arquitectónicos

### Mejor Organización del Código
El enfoque basado en clases organiza naturalmente la funcionalidad relacionada. Los controladores agrupan endpoints relacionados, los servicios encapsulan la lógica de negocio, y las dependencias están claramente definidas.

### Capacidad de Prueba
La inyección de dependencias hace que las pruebas unitarias sean directas. Puedes simular fácilmente las dependencias y probar componentes de forma aislada.

### Escalabilidad
A medida que las aplicaciones crecen, el enfoque estructurado ayuda a mantener la calidad del código. La separación clara entre controladores, servicios y capas de datos previene el código espagueti.

### Adaptabilidad a Patrones Clásicos
YasuiJS soporta naturalmente patrones arquitectónicos establecidos:
- **Arquitectura Cebolla**: Separación clara entre capas de dominio, aplicación e infraestructura
- **Arquitectura Hexagonal**: Patrón de puertos y adaptadores con inversión de dependencias
- **Arquitectura Limpia**: Independencia de frameworks, bases de datos y agencias externas

### Mantenibilidad
Límites claros entre componentes, dependencias explícitas y enrutamiento declarativo hacen que el código base sea más fácil de entender y modificar.

## Cuándo Elegir YasuiJS

YasuiJS es perfecto cuando necesitas:

- **Arquitectura Estructurada**: Construir aplicaciones que crecerán y necesitan organización clara
- **Desarrollo en Equipo**: Múltiples desarrolladores trabajando en la misma base de código
- **Aplicaciones Empresariales**: Aplicaciones que requieren mantenibilidad y capacidad de prueba
- **Diseño Dirigido por Dominio**: Aplicaciones con lógica de negocio compleja
- **Microservicios**: Servicios que necesitan ser desplegables y probables independientemente

## Multi-Runtime y Base Agnóstica de Plataforma

YasuiJS está construido sobre Estándares Web, proporcionando verdadera flexibilidad de despliegue:

### Con createServer() (srvx)
- **Soporte Multi-Runtime**: Node.js, Deno y Bun
- **Configuración Simple**: Un comando inicia tu servidor
- **Características Integradas**: TLS/HTTPS, HTTP/2, archivos estáticos

### Con createApp() (manejador fetch)
- **Agnóstico de Plataforma**: Devuelve un manejador fetch estándar
- **Compatible con Edge Runtime**: Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy
- **Listo para Serverless**: AWS Lambda, Vercel Functions, Netlify Functions
- **Flexible**: Usa cualquier servidor o plataforma compatible con Estándares Web

### Beneficios Centrales
- **Estándares Modernos**: Construido sobre la API fetch y Request/Response de Estándares Web
- **Rendimiento**: Optimizado para las fortalezas de cada runtime
- **A Prueba de Futuro**: Basado en estándares de plataforma web, no APIs específicas de framework
- **Propiedades Compatibles con Express**: YasuiJS Request incluye propiedades familiares (req.query, req.params, req.body) para migración más fácil

YasuiJS abraza los estándares web modernos mientras proporciona una experiencia de desarrollador familiar. Despliega en cualquier lugar - desde servidores tradicionales hasta runtimes edge.