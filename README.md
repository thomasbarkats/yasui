<p align="center">
  <a href="https://yasui.app">
    <img src="https://raw.githubusercontent.com/thomasbarkats/assets/refs/heads/main/yasui/yasui-logo-mascot.png" alt="Logo" height=160 />
  </a>
  <h1 align="center">YasuiJS</h1>
</p>


<div align="center">

  [![Node.js Version](https://img.shields.io/node/v/yasui.svg?color=EAA458)](https://nodejs.org/)
  [![npm bundle size](https://img.shields.io/npm/unpacked-size/yasui?color=EAA458)](https://www.npmjs.com/package/yasui)
  [![npm downloads](https://img.shields.io/npm/dm/yasui.svg?color=C17633)](https://www.npmjs.com/package/yasui)

</div>

<div align="center">

  <span>Ship production-ready REST APIs in minutes 🐿️</span>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  **[Documentation](https://yasui.app/guide/getting-started.html)** 📖

</div>
<br />

## What is YasuiJS?

Yasui (meaning "easy" in Japanese) is a lightweight multi-runtime framework built on Web Standards and pushed with [SRVX](https://srvx.h3.dev), that brings the developer experience of modern frameworks without the complexity. It runs on Node.js, Deno, and Bun, providing the structure you need with just the features you'll actually use.

## Features Summary
- **Multi-Runtime**: Runs on Node.js, Deno, and Bun via SRVX and Web Standards
- **Lightweight & Fast**: Minimal dependencies with focus on essentials without the bloat
- **Complete Error Handling**: Everything can throw without try/catch - automatic error handling everywhere
- **Automatic Type-Casting**: Query params automatically converted to proper types. Even in middlewares
- **Flexible DI System**: Constructor and method-level injection with configurable scopes for better control
- **Simple Middlewares**: Apply at global, controller, or route level. Use the same decorators as controllers
- **Rich Swagger Generation**: Flexible decorators for enums, arrays, classes, OpenAPI schemas
- **HTTPS/HTTP2 Support**: Built-in TLS configuration with automatic HTTP/2 on Node.js
- **Type-safe**: Full TypeScript support with proper typing

## Quick Start

```sh
npm install yasui
```

```ts
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

## 📖 **[Documentation](https://yasui.app/guide/getting-started.html)**

- [Configuration](https://yasui.app/guide/config.html) - Server setup and global options
- [Controllers](https://yasui.app/guide/controllers.html) - Define routes with decorators and automatic type casting
- [Dependency Injection](https://yasui.app/guide/dependency-injection.html) - Constructor and method-level injection with flexible scopes
- [Error Handling](https://yasui.app/guide/error-handling.html) - Automatic error catching without try/catch blocks
- [Logging](https://yasui.app/guide/logging.html) - Built-in timing and color-coded logging service
- [Middlewares](https://yasui.app/guide/middlewares.html) - Apply at multiple levels with same decorators as controllers
- [Pipes](https://yasui.app/guide/pipes.html) - Transform and validate request data automatically
- [Swagger Doc.](https://yasui.app/guide/swagger.html) - Generate OpenAPI docs with flexible decorators

## Why YasuiJS?

YasuiJS adopts a **class-based, object-oriented approach** with decorators, bringing significant architectural advantages:

### Better Code Organization
Classes and decorators provide better organization, encapsulation, and maintainability. This approach naturally supports established architectural patterns like onion architecture, hexagonal architecture, and clean architecture.

### Dependency Injection
Built-in dependency injection enables loose coupling, better testability, and cleaner separation of concerns. Dependencies are explicitly declared and automatically resolved.

### Declarative Over Imperative
Instead of manually registering routes and extracting parameters, you declare what you want using decorators. The framework handles the implementation details.

### Multi-Runtime Support
Built on web standards, YasuiJS provides a portable, standard codebase for JavaScript runtimes, capable of running on Node.js, Deno, and Bun with [SRVX](https://srvx.h3.dev), a universal server abstraction based on the Fetch API. Future-proof your applications with standard web APIs.

## Migration from 3.x (Express)

Version 4.x migrated from Express to Web Standards. **Key breaking changes:**

- **Express middlewares are not compatible** - Use Web Standards-based alternatives or write native Yasui middlewares
- Request/Response objects now follow Web Standards (immutable)
- Most features remain unchanged - decorators, DI, routing all work the same way

See the [migration guide](https://yasui.app/guide/migration.html) for more details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.  
Please use `npm run commit` to standardize commits nomenclature.

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](https://www.gnu.org/licenses/agpl-3.0.html). See the [LICENSE](./LICENSE) file for details.
