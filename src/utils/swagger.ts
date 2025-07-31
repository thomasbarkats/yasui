import { OpenAPISchema } from '~types/openapi';


export function mapTypeToSchema(type: Function): OpenAPISchema {
  switch (type) {
    case String: return { type: 'string' };
    case Number: return { type: 'number' };
    case Boolean: return { type: 'boolean' };
    case Date: return { type: 'string', format: 'date-time' };
    case Array: return { type: 'array', items: { type: 'string' } };
    case Object: return { type: 'object' };
    default:
      if (type.name && type.name !== 'Object') {
        return { $ref: '' };
      }
      return { type: 'object' };
  }
}
