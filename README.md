# YasuiJS

[![Node.js Version](https://img.shields.io/node/v/yasui.svg)](https://nodejs.org/)
[![npm downloads](https://img.shields.io/npm/dm/yasui.svg)](https://www.npmjs.com/package/yasui)
[![npm bundle size](https://img.shields.io/npm/unpacked-size/yasui?color=4DC81F)](https://www.npmjs.com/package/yasui)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

Ship production-ready REST APIs in minutes⚡

<img src="https://raw.githubusercontent.com/thomasbarkats/assets/refs/heads/main/yasui/yasui-logo-mascot.png" alt="Logo" height=160></a>

Yasui -*that can mean "easy" in Japanese*- is a lightweight Express-based framework for Node.js that simplifies REST API development with decorators to build your endpoints, plus complete error management, logging, dependency injection, Swagger integration, and more.

Compared to other frameworks, Yasui's philosophy is to keep things minimal and focus on essentials, with minimal dependencies.

## Features Summary
- **Lightweight**: Built on Express with minimal dependencies
- **Decorator-based**: Clean, readable code with TypeScript decorators
- **Dependency Injection**: Automatic resolution with scope management
- **Auto Error Handling**: Comprehensive error catching, logging, and formatting
- **Built-in Logging**: Timed logging service with color-coded output
- **Flexible Middleware**: Application, controller, and endpoint-level middleware support
- **Swagger Integration**: Self-generated and editable Swagger documentation
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

## Documentation

📖 **[Complete Documentation](https://yasui.app)**

- [Getting Started](https://yasui.app/guide/getting-started) - Set up your first API in minutes
- [Basic Concepts](https://yasui.app/guide/basic-concepts) - Understand YasuiJS architecture
- [Controllers](https://yasui.app/reference/controllers) - Define your API endpoints
- [Middlewares](https://yasui.app/reference/middlewares) - Handle cross-cutting concerns
- [Dependency Injection](https://yasui.app/reference/dependency-injection) - Manage component relationships
- [Logging Service](https://yasui.app/reference/logging) - Built-in logging with timing
- [Error Handling](https://yasui.app/reference/error-handling) - Automatic error management
- [Swagger Integration](https://yasui.app/reference/swagger) - API documentation generation
- [Configuration](https://yasui.app/reference/config) - Complete configuration reference

## Examples

Browse the [`src/examples`](./src/examples) folder to get a simple example of a server with Yasui, including controllers, services, middlewares, dependency injection, and error handling. Run it with `npm run example`.

## Why YasuiJS?

YasuiJS adopts a **class-based, object-oriented approach** with decorators, bringing significant architectural advantages over traditional functional Express.js approaches:

### Better Code Organization
Classes and decorators provide better organization, encapsulation, and maintainability. This approach naturally supports established architectural patterns like onion architecture, hexagonal architecture, and clean architecture.

### Dependency Injection
Built-in dependency injection enables loose coupling, better testability, and cleaner separation of concerns. Dependencies are explicitly declared and automatically resolved.

### Declarative Over Imperative
Instead of manually registering routes and extracting parameters, you declare what you want using decorators. The framework handles the implementation details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.  
Please use `npm run commit` to standardize commits nomenclature.

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](https://www.gnu.org/licenses/agpl-3.0.html). See the [LICENSE](./LICENSE) file for details.
