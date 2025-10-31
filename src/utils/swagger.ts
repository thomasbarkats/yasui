import kleur from 'kleur';
import { createRequire } from 'module';
import { HttpCode } from '../enums/index.js';
import { ReflectMetadata } from '../utils/reflect.js';
import { HttpError, ErrorResourceSchema } from './error.resource.js';
import { getMetadata, defineMetadata } from './reflect.js';
import { resolveSchema } from './index.js';
import { ApiPropertyDefinition, Constructible, OpenAPISchema, ISwaggerConfig } from '../interfaces/index.js';
import { LoggerService } from '../services/index.js';
import { RequestHandler } from '../web.js';


export const ERROR_RESOURCE_SCHEMA_NAME = 'Error Response';

export type DecoratorUsage =
  | 'PrimitiveSchema'
  | 'RefSchema'
  | 'ObjectSchema'
  | 'Array'
  | 'Enum'
  | 'Constructible'
  | 'Record';


export function extractDecoratorUsage(def: ApiPropertyDefinition): DecoratorUsage {
  if (typeof def === 'function') {
    return 'Constructible';
  } else if (Array.isArray(def)) {
    return 'Array';
  } else if ('$ref' in def) {
    return 'RefSchema';
  } else if ('type' in def) {
    return def.type === 'object' ? 'ObjectSchema' : 'PrimitiveSchema';
  } else if ('enum' in def) {
    return 'Enum';
  }
  return 'Record';
}

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

export function overloadCustomErrorDefinition<T extends HttpError>(
  statusCode: HttpCode = 500,
  ErrorDataClass: Constructible<T>,
): Constructible<T> {
  const errorDataClassDefinition = getMetadata(ReflectMetadata.SWAGGER_SCHEMA_DEFINITION, ErrorDataClass.prototype);
  const errorDataClassSchema: Record<string, OpenAPISchema> = {};

  for (const property in errorDataClassDefinition) {
    errorDataClassSchema[property] = resolveSchema(errorDataClassDefinition[property]);
  }

  defineMetadata(ReflectMetadata.SWAGGER_SCHEMA_DEFINITION, {
    ...ErrorResourceSchema(statusCode).properties,
    data: {
      type: 'object',
      properties: errorDataClassSchema,
    }
  }, ErrorDataClass.prototype);

  return ErrorDataClass;
}

/** Setup Swagger UI routes and static assets */
export function setupSwaggerUI(
  addRoute: (path: string, method: string, handler: RequestHandler, middlewares: RequestHandler[]) => void,
  swaggerConfig: ISwaggerConfig,
  swaggerPath: string,
  logger: LoggerService,
  debug: boolean
): void {
  try {
    const require = createRequire(import.meta.url);
    const fs = require('fs');
    const path = require('path');

    let swaggerDistPath: string = path.dirname(require.resolve('swagger-ui-dist/package.json'));

    // Normalize swagger path
    if (!swaggerPath.startsWith('/')) {
      swaggerPath = '/' + swaggerPath;
    }

    // Serve swagger.json
    const swaggerJsonPath = `${swaggerPath}/swagger.json`;
    addRoute(swaggerJsonPath, 'GET', () => Response.json(swaggerConfig), []);

    // Generate Swagger UI HTML
    const swaggerHtml = generateSwaggerHTML(swaggerPath, swaggerJsonPath, swaggerConfig);
    addRoute(swaggerPath, 'GET', () =>
      new Response(swaggerHtml, {
        headers: { 'content-type': 'text/html' }
      }), []);

    // Serve Swagger UI static assets
    const staticFiles = [
      'swagger-ui.css',
      'swagger-ui-bundle.js',
      'swagger-ui-standalone-preset.js',
      'favicon-16x16.png',
      'favicon-32x32.png',
    ];

    for (const file of staticFiles) {
      const filePath = path.join(swaggerDistPath, file);
      addRoute(`${swaggerPath}/${file}`, 'GET', () => {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(file);
        const contentType =
          ext === '.css' ? 'text/css' :
            ext === '.js' ? 'application/javascript' :
              ext === '.png' ? 'image/png' : 'text/plain';

        return new Response(content, {
          headers: { 'content-type': contentType }
        });
      }, []);
    }

    logger.success(`${kleur.italic(`${swaggerPath}`)} swagger documentation loaded`);

  } catch (err) {
    logger.warn(
      'swagger-ui-dist not found.\n' +
      'Install it to enable swagger documentation: npm install swagger-ui-dist.'
    );
    if (debug) {
      logger.error(`swagger setup error: ${err}`);
    }
  }
}

/** Generate the Swagger UI HTML page */
function generateSwaggerHTML(
  swaggerPath: string,
  swaggerJsonPath: string,
  swaggerConfig: ISwaggerConfig
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${swaggerConfig.info?.title || 'API Documentation'}</title>
  <link rel="stylesheet" type="text/css" href="${swaggerPath}/swagger-ui.css" />
  <link rel="icon" type="image/png" href="${swaggerPath}/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="${swaggerPath}/favicon-16x16.png" sizes="16x16" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; padding:0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${swaggerPath}/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="${swaggerPath}/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "${swaggerJsonPath}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 0
      });
    };
  </script>
</body>
</html>`;
}
