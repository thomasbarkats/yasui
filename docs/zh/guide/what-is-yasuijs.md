# 什么是 YasuiJS？

YasuiJS 是一个现代、轻量级的 REST API 框架，专为 TypeScript 开发者设计。基于 Web 标准构建，支持多运行时（Node.js、Deno 和 Bun），提供强大的装饰器和依赖注入功能，使 API 开发更加直观和易于维护。

## 为什么选择 YasuiJS？

构建 REST API 可能会重复且容易出错。传统的 Express.js 应用程序需要大量样板代码来进行路由注册、参数提取和依赖管理。YasuiJS 通过提供声明式的 API 开发方法来消除这种复杂性。

### 传统方法的问题

使用纯 Express.js 构建 API 时，您经常会遇到这样的代码：

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

这种函数式方法有几个限制：
- 手动参数提取和验证
- 重复的错误处理
- 由于紧耦合而难以测试
- 无法自动生成文档
- 随着应用程序增长难以组织和扩展

### YasuiJS 方法

YasuiJS 采用基于类的面向对象方法和装饰器：

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

虽然乍一看这可能显得更冗长，但基于类的方法带来了显著的架构优势。

## 核心理念

YasuiJS 围绕这些基本原则构建：

### 面向对象架构
类和装饰器提供更好的组织、封装和可维护性。这种方法自然支持已建立的架构模式，如洋葱架构、六边形架构和清洁架构。

### 依赖注入
内置的依赖注入实现松耦合、更好的可测试性和更清晰的关注点分离。依赖关系被明确声明并自动解析。

### 声明式优于命令式
不需要手动注册路由和提取参数，您使用装饰器声明您想要的内容。框架处理实现细节。

### TypeScript 优先
每个功能都以 TypeScript 为设计理念，提供完整的类型安全和出色的 IDE 支持。

### 最小依赖
通过最小的外部依赖保持轻量级，专注于核心功能。

## 架构优势

### 更好的代码组织
基于类的方法自然地将相关功能组织在一起。控制器将相关端点分组，服务封装业务逻辑，依赖关系被清晰定义。

### 可测试性
依赖注入使单元测试变得简单。您可以轻松模拟依赖关系并独立测试组件。

### 可扩展性
随着应用程序的增长，结构化方法有助于维护代码质量。控制器、服务和数据层之间的清晰分离防止了意大利面条式代码。

### 适应经典模式
YasuiJS 自然支持已建立的架构模式：
- **洋葱架构**：领域层、应用层和基础设施层之间的清晰分离
- **六边形架构**：具有依赖倒置的端口和适配器模式
- **清洁架构**：独立于框架、数据库和外部机构

### 可维护性
组件之间的清晰边界、显式依赖关系和声明式路由使代码库更容易理解和修改。

## 何时选择 YasuiJS

YasuiJS 在以下情况下是完美的选择：

- **结构化架构**：构建需要增长并需要清晰组织的应用程序
- **团队开发**：多个开发者在同一代码库上工作
- **企业应用程序**：需要可维护性和可测试性的应用程序
- **领域驱动设计**：具有复杂业务逻辑的应用程序
- **微服务**：需要独立部署和测试的服务

## 多运行时和平台无关基础

YasuiJS 基于 Web 标准构建，提供真正的部署灵活性：

### 使用 createServer()（srvx）
- **多运行时支持**：Node.js、Deno 和 Bun
- **简单设置**：一个命令启动您的服务器
- **内置功能**：TLS/HTTPS、HTTP/2、静态文件

### 使用 createApp()（fetch 处理器）
- **平台无关**：返回标准的 fetch 处理器
- **边缘运行时兼容**：Cloudflare Workers、Vercel Edge、Netlify Edge、Deno Deploy
- **无服务器就绪**：AWS Lambda、Vercel Functions、Netlify Functions
- **灵活**：使用任何兼容 Web 标准的服务器或平台

### 核心优势
- **现代标准**：基于 fetch API 和 Web 标准 Request/Response 构建
- **性能**：针对每个运行时的优势进行优化
- **面向未来**：基于 Web 平台标准，而非框架特定的 API
- **Express 兼容属性**：YasuiJS Request 包含熟悉的属性（req.query、req.params、req.body）以便更容易迁移

YasuiJS 拥抱现代 Web 标准，同时提供熟悉的开发者体验。可以部署到任何地方——从传统服务器到边缘运行时。