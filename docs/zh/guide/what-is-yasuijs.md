# 什么是YasuiJS？

YasuiJS是一个现代化、轻量级的REST API框架，专为TypeScript开发者设计。它保留了Express.js的简洁性，并通过强大的装饰器和依赖注入增强了它，使API开发更加直观和易于维护。

## 为什么选择YasuiJS？

构建REST API可能会重复且容易出错。传统的Express.js应用程序需要大量样板代码来注册路由、提取参数和管理依赖关系。YasuiJS通过提供声明式的API开发方法消除了这种复杂性。

### 传统方法的问题

当使用普通Express.js构建API时，你通常会得到这样的代码：

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
- 由于紧密耦合而难以测试
- 没有自动文档生成
- 随着应用程序增长，难以组织和扩展

### YasuiJS的方法

YasuiJS采用基于类的、面向对象的方法，配合装饰器：

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

虽然乍看之下这可能更加冗长，但基于类的方法带来了显著的架构优势。

## 核心理念

YasuiJS围绕这些基本原则构建：

### 面向对象架构
类和装饰器提供更好的组织、封装和可维护性。这种方法自然支持已建立的架构模式，如洋葱架构、六边形架构和清洁架构。

### 依赖注入
内置的依赖注入实现松耦合、更好的可测试性和更清晰的关注点分离。依赖项被明确声明并自动解析。

### 声明式优于命令式
不是手动注册路由和提取参数，而是使用装饰器声明你想要的内容。框架处理实现细节。

### TypeScript优先
每个功能都是考虑到TypeScript而设计的，提供完全的类型安全和出色的IDE支持。

### 最小依赖
通过最小的外部依赖保持轻量级，专注于基本要素。

## 架构优势

### 更好的代码组织
基于类的方法自然地将相关功能组织在一起。控制器组织相关端点，服务封装业务逻辑，依赖关系明确定义。

### 可测试性
依赖注入使单元测试变得简单。你可以轻松模拟依赖项并隔离测试组件。

### 可扩展性
随着应用程序的增长，结构化方法有助于维持代码质量。控制器、服务和数据层之间的清晰分离防止了意大利面式代码。

### 适应经典模式
YasuiJS自然支持已建立的架构模式：
- **洋葱架构**：域、应用和基础设施层之间的清晰分离
- **六边形架构**：带有依赖倒置的端口和适配器模式
- **清洁架构**：框架、数据库和外部机构的独立性

### 可维护性
组件之间的明确边界、显式依赖和声明式路由使代码库更容易理解和修改。

## 何时选择YasuiJS

当你需要以下内容时，YasuiJS是完美的选择：

- **结构化架构**：构建将会增长并需要清晰组织的应用程序
- **团队开发**：多个开发人员在同一代码库上工作
- **企业应用**：需要可维护性和可测试性的应用程序
- **领域驱动设计**：具有复杂业务逻辑的应用程序
- **微服务**：需要独立部署和测试的服务

## Express.js基础

YasuiJS构建在Express.js之上，因此你可以获得：
- Express.js的所有性能和生态系统优势
- 与现有Express.js中间件的兼容性
- 从现有Express.js应用程序的渐进迁移路径
- Express.js开发人员熟悉的概念

YasuiJS不是替代Express.js——它通过现代架构模式增强它，同时保持Express.js生态系统的所有优势。