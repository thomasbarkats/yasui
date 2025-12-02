# @yasui/cors

Production-ready CORS middleware for [YasuiJS](https://yasui.app)

## Features

- ✅ Origin validation (exact match, wildcard, regex patterns)
- ✅ Preflight OPTIONS handling
- ✅ Credentials support (cookies, auth headers)
- ✅ Cache optimization (Vary header)
- ✅ Private Network Access (CORS-RFC1918)
- ✅ Security-first defaults

## Installation

```bash
npm install @yasui/cors
```

## Quick Start

```typescript
import yasui from 'yasui';
import { cors } from '@yasui/cors';

yasui.createServer({
  middlewares: [
    cors({
      origins: ['https://app.example.com'],
      credentials: true
    })
  ],
  controllers: [UserController]
});
```

## 📖 [Documentation](https://yasui.app/plugins/cors.html)

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](https://www.gnu.org/licenses/agpl-3.0.html). See the [LICENSE](../LICENSE) file for details.
