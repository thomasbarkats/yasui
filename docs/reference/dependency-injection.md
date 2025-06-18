# Dependency Injection Reference

This reference covers all dependency injection (DI) features in YasuiJS.

## DI Decorators

### @Injectable
Marks a class as injectable for DI.
```typescript
@Injectable()
class MyService {}
```

### @Inject
Injects a dependency by token or type.
```typescript
constructor(@Inject('TOKEN') dep: any) {}
```

### @Scope
Sets the scope of an injectable service.
```typescript
@Scope(Scopes.SINGLETON)
@Injectable()
class MyService {}
```

## Supported Scopes
- `Scopes.SINGLETON`: One instance for the app (default)
- `Scopes.SHARED`: Shared instance (alias for SINGLETON)
- `Scopes.REQUEST`: New instance per HTTP request
- `Scopes.LOCAL`: New instance per injection
- `Scopes.DEEP_LOCAL`: New instance for deep dependency trees

## Constructor Injection
Inject dependencies via constructor parameters:
```typescript
constructor(private myService: MyService) {}
constructor(@Inject('TOKEN') private value: any) {}
```

## Method Parameter Injection
Inject dependencies into method parameters:
```typescript
@SomeDecorator()
myMethod(@Inject() dep: MyService) {}
```

## Registering Custom Injections
Add to the `injections` array in your YasuiJS config:
```typescript
const config = {
  injections: [
    { token: 'DATABASE_URL', provide: 'postgres://...' },
    { token: 'ILogger', provide: LoggerService }
  ]
};
```

## DI Config Options
- `injections`: Array of `{ token, provide }` for custom values or classes

## DI Class Signature
```typescript
@Injectable()
class MyService {
  // ...
}
```

## Notes
- DI works for controllers, services, and middleware.
- Circular dependencies are supported but should be avoided.
- Use `@Inject` for custom tokens or non-class values. 