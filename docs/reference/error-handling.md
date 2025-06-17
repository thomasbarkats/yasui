# Error Handling Reference

This reference covers error handling in YasuiJS applications.

## Default Error Handling
- Errors thrown in controllers, services, or middleware are automatically caught.
- YasuiJS returns a JSON error response.

### Default Error Response
```json
{
  "error": "Error message",
  "status": 500,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
- Status code is 500 unless overridden by a custom error.
- In debug mode, additional details may be included.

## Custom Error Classes
- Extend the base `Error` class.
- Add a `status` property for the HTTP status code.

Example:
```typescript
export class NotFoundError extends Error {
  status = 404;
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}
```

## Throwing Errors
- Throw errors in controllers, services, or middleware to trigger error handling.
- Use custom error classes to set status codes.

Example:
```typescript
if (!user) {
  throw new NotFoundError('User');
}
```

## Recognized Status Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error (default)

## Notes
- If no `status` property is set, 500 is used.
- Error messages are included in the response.
- You can define any custom error class as long as it extends `Error` and sets a `status` property. 