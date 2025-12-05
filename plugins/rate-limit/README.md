# @yasui/rate-limit

Production-ready rate limiting middleware for [YasuiJS](https://yasui.app)

## Features

- ✅ Configurable request limits per time window
- ✅ In-memory store (extensible for Redis, etc.)
- ✅ Custom key generation (IP, API key, user ID)
- ✅ Standard rate limit headers (RFC 6585)
- ✅ Automatic cleanup of expired entries
- ✅ Skip logic for whitelisting

## Installation

```bash
npm install @yasui/rate-limit
```

## Quick Start

```typescript
import yasui from 'yasui';
import { rateLimit } from '@yasui/rate-limit';

yasui.createServer({
  middlewares: [
    rateLimit({
      max: 100,       // 100 requests
      windowMs: 60000 // per minute
    })
  ],
  controllers: [UserController]
});
```

## 📖 [Documentation](https://yasui.app/plugins/rate-limit.html)

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](https://www.gnu.org/licenses/agpl-3.0.html). See the [LICENSE](../../LICENSE) file for details.
