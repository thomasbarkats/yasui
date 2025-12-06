# @yasui/validation

Automatic DTO validation for [YasuiJS](https://yasui.app) using [class-validator](https://github.com/typestack/class-validator)

## Features

- ✅ Automatic DTO validation for `@Body()` and `@Query()` parameters
- ✅ Production-ready security with whitelist mode
- ✅ Type transformation with [class-transformer](https://github.com/typestack/class-transformer)
- ✅ Structured validation error responses
- ✅ Validation groups for conditional rules
- ✅ Nested object validation support

## Installation

```bash
npm install class-validator @yasui/validation
```

## Quick Start

```typescript
import yasui from 'yasui';
import { validation } from '@yasui/validation';
import { IsString, IsNumber, Min } from 'class-validator';

class CreateProductDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;
}

yasui.createServer({
  globalPipes: [validation()],
  controllers: [ProductController]
});
```

## 📖 [Documentation](https://yasui.app/plugins/validation.html)

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](https://www.gnu.org/licenses/agpl-3.0.html). See the [LICENSE](../../LICENSE) file for details.
