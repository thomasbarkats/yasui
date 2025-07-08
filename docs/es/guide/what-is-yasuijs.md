# ¿Qué es YasuiJS?

YasuiJS es un framework moderno y ligero de API REST diseñado específicamente para desarrolladores de TypeScript. Toma la simplicidad de Express.js y la mejora con poderosos decoradores e inyección de dependencias, haciendo el desarrollo de APIs más intuitivo y mantenible.

## ¿Por qué YasuiJS?

Construir APIs REST puede ser repetitivo y propenso a errores. Las aplicaciones tradicionales de Express.js requieren mucho código repetitivo para el registro de rutas, extracción de parámetros y gestión de dependencias. YasuiJS elimina esta complejidad proporcionando un enfoque declarativo al desarrollo de APIs.

### El Problema con los Enfoques Tradicionales

Cuando se construyen APIs con Express.js puro, a menudo terminas con código como este:

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

Este enfoque funcional tiene varias limitaciones:
- Extracción y validación manual de parámetros
- Manejo de errores repetitivo
- Difícil de probar debido al acoplamiento estrecho
- Sin generación automática de documentación
- Difícil de organizar y escalar a medida que crecen las aplicaciones

### El Enfoque de YasuiJS

YasuiJS adopta un enfoque orientado a objetos basado en clases con decoradores:

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

Aunque esto pueda parecer más verboso a primera vista, el enfoque basado en clases trae ventajas arquitectónicas significativas.

## Filosofía Central

YasuiJS está construido alrededor de estos principios fundamentales:

### Arquitectura Orientada a Objetos
Las clases y decoradores proporcionan mejor organización, encapsulación y mantenibilidad. Este enfoque naturalmente soporta patrones arquitectónicos establecidos como arquitectura de cebolla, arquitectura hexagonal y arquitectura limpia.

### Inyección de Dependencias
La inyección de dependencias incorporada permite un acoplamiento flexible, mejor capacidad de prueba y una separación más limpia de preocupaciones. Las dependencias se declaran explícitamente y se resuelven automáticamente.

### Declarativo Sobre Imperativo
En lugar de registrar rutas y extraer parámetros manualmente, declaras lo que quieres usando decoradores. El framework maneja los detalles de implementación.

### TypeScript Primero
Cada característica está diseñada pensando en TypeScript, proporcionando seguridad total de tipos y excelente soporte de IDE.

### Dependencias Mínimas
Mantiene las cosas ligeras con dependencias externas mínimas, enfocándose en lo esencial.

## Beneficios Arquitectónicos

### Mejor Organización del Código
El enfoque basado en clases organiza naturalmente la funcionalidad relacionada. Los controladores agrupan endpoints relacionados, los servicios encapsulan la lógica de negocio y las dependencias están claramente definidas.

### Capacidad de Prueba
La inyección de dependencias hace que las pruebas unitarias sean sencillas. Puedes simular dependencias fácilmente y probar componentes de forma aislada.

### Escalabilidad
A medida que las aplicaciones crecen, el enfoque estructurado ayuda a mantener la calidad del código. La clara separación entre controladores, servicios y capas de datos previene el código espagueti.

### Adaptabilidad a Patrones Clásicos
YasuiJS soporta naturalmente patrones arquitectónicos establecidos:
- **Arquitectura de Cebolla**: Clara separación entre capas de dominio, aplicación e infraestructura
- **Arquitectura Hexagonal**: Patrón de puertos y adaptadores con inversión de dependencias
- **Arquitectura Limpia**: Independencia de frameworks, bases de datos y agencias externas

### Mantenibilidad
Los límites claros entre componentes, dependencias explícitas y enrutamiento declarativo hacen que la base de código sea más fácil de entender y modificar.

## Cuándo Elegir YasuiJS

YasuiJS es perfecto cuando necesitas:

- **Arquitectura Estructurada**: Construir aplicaciones que crecerán y necesitan una organización clara
- **Desarrollo en Equipo**: Múltiples desarrolladores trabajando en la misma base de código
- **Aplicaciones Empresariales**: Aplicaciones que requieren mantenibilidad y capacidad de prueba
- **Diseño Dirigido por Dominio**: Aplicaciones con lógica de negocio compleja
- **Microservicios**: Servicios que necesitan ser desplegables y probables de forma independiente

## Base de Express.js

YasuiJS está construido sobre Express.js, por lo que obtienes:
- Todos los beneficios de rendimiento y ecosistema de Express.js
- Compatibilidad con middleware existente de Express.js
- Ruta de migración gradual desde aplicaciones Express.js existentes
- Conceptos familiares para desarrolladores de Express.js

YasuiJS no reemplaza Express.js—lo mejora con patrones arquitectónicos modernos mientras mantiene todos los beneficios del ecosistema Express.js.