import { defineMetadata, getMetadata } from './reflect.js';
import { ERROR_RESOURCE_SCHEMA_NAME, extractDecoratorUsage, mapTypeToSchema } from './swagger.js';
import { DecoratorValidator } from './decorator-validator.js';
import { ErrorResourceSchema } from './error.resource.js';
import { HttpCode, HttpCodeMap } from '../enums/index.js';
import { ReflectMetadata } from '../utils/reflect.js';
import {
  ApiPropertyDefinition,
  ApiPropertyEnumSchema,
  Constructible,
  IRouteParam,
  ISwaggerConfig,
  ISwaggerRoute,
  SafeApiPropertyRecord,
  TController,
  ObjectSchema,
  OpenAPIOperation,
  OpenAPIParamater,
  OpenAPIResponses,
  OpenAPISchema,
  YasuiSwaggerConfig,
} from '../interfaces/index.js';


export class SwaggerService {
  public static schemas: Map<string, OpenAPISchema & { className?: string }> = new Map();
  /** <Class name, name> */
  private static declaredSchemas: Record<string, string> = {};
  private routesRegistry: ISwaggerRoute[];

  constructor(
    private readonly decoratorValidator: DecoratorValidator | null,
  ) {
    this.routesRegistry = [];
  }


  public static resolveSchema(def: ApiPropertyDefinition): OpenAPISchema {
    switch (extractDecoratorUsage(def)) {
      case 'PrimitiveSchema':
      case 'RefSchema':
      case 'ObjectSchema':
        return def as OpenAPISchema;
      case 'Array':
        return {
          type: 'array',
          items: SwaggerService.resolveSchema((<Array<Constructible>>def)[0]),
        };
      case 'Enum': {
        const enumDef = (<ApiPropertyEnumSchema>def).enum;
        const enumValues = Array.isArray(enumDef) ? enumDef : Object.values(enumDef);
        return typeof enumValues[0] === 'string'
          ? { type: 'string', enum: enumValues as string[] }
          : { type: 'number', enum: enumValues as number[] };
      }
      case 'Constructible': {
        const schema = mapTypeToSchema(<Constructible>def);
        if ('$ref' in schema) {
          const schemaName = SwaggerService.autoRegisterSchema(<Constructible>def);
          schema.$ref = `#/components/schemas/${encodeURIComponent(schemaName)}`;
        }
        return schema;
      }
      case 'Record': {
        const schema: ObjectSchema = { type: 'object' };
        schema.properties = {};
        for (const property in def) {
          schema.properties[property] = SwaggerService.resolveSchema((<SafeApiPropertyRecord>def)[property]);
        }
        return schema;
      }
    }
  }

  private static autoRegisterSchema(Class: Constructible): string {
    let name = getMetadata(ReflectMetadata.SWAGGER_SCHEMA_NAME, Class.prototype) || Class.name;

    if (this.schemas.get(name)?.className !== Class.name) {
      SwaggerService.declaredSchemas[Class.name] = name;

      const schema = SwaggerService.generateSchemaFromClass(Class);
      if (this.schemas.has(name)) {
        name = Class.name; // duplicated custom name
        defineMetadata(ReflectMetadata.SWAGGER_SCHEMA_NAME, name, Class.prototype);
      }
      SwaggerService.schemas.set(name, { ...schema, className: Class.name });
    }
    return name;
  }

  private static generateSchemaFromClass(Class: Constructible): OpenAPISchema {
    const props: Record<string, OpenAPISchema> = {};
    const required: string[] = [];

    const swaggerProps = getMetadata(ReflectMetadata.SWAGGER_SCHEMA_DEFINITION, Class.prototype) || {};

    Object.entries(swaggerProps).forEach(([propName, propSchema]) => {
      if (typeof propSchema === 'object' && 'required' in propSchema) {
        if (propSchema.required) {
          required.push(propName);
        }
        delete propSchema.required;
      }
      props[propName] = SwaggerService.resolveSchema(propSchema);
    });

    const schema: ObjectSchema = {
      type: 'object',
      properties: props,
    };
    if (required.length > 0) {
      schema.required = required;
    }
    return schema;
  }


  public registerControllerRoutes(
    ControllerClass: TController,
    controllerPath: string
  ): void {
    const routes = getMetadata(ReflectMetadata.ROUTES, ControllerClass.prototype) || [];

    for (const route of routes) {
      const swaggerMetadata = getMetadata(
        ReflectMetadata.SWAGGER_OPERATION,
        ControllerClass.prototype,
        route.methodName
      ) || {};
      const swaggerRoute: ISwaggerRoute = {
        ...route,
        controllerName: ControllerClass.name,
        controllerPrototype: ControllerClass.prototype,
        controllerPath,
        fullPath: this.normalizePath(controllerPath + route.path),
        swaggerMetadata,
      };
      this.routesRegistry.push(swaggerRoute);
    }
  }

  public getSwaggerConfig(
    config?: Partial<YasuiSwaggerConfig>,
    hasApiKey: boolean = false
  ): ISwaggerConfig {
    const fullConfig: ISwaggerConfig = {
      openapi: '3.0.0',
      paths: {},
      ...config,
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Generated API documentation',
        ...config?.info
      },
    };

    SwaggerService.schemas.set(ERROR_RESOURCE_SCHEMA_NAME, ErrorResourceSchema());

    Object.entries(SwaggerService.declaredSchemas).forEach(([className, declaredName]) => {
      this.decoratorValidator?.validateSwaggerSchemaName(className, declaredName);
    });

    fullConfig.components = {
      schemas: Object.fromEntries(SwaggerService.schemas),
      ...(hasApiKey && {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key'
          }
        }
      })
    };

    for (const route of this.routesRegistry) {
      if (!fullConfig.paths[route.fullPath]) {
        fullConfig.paths[route.fullPath] = {};
      }
      const operation: OpenAPIOperation = this.buildOperation(route);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fullConfig.paths[route.fullPath] as any)[route.method] = operation;
    }

    return fullConfig;
  }

  private normalizePath(path: string): string {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  private buildOperation(route: ISwaggerRoute): OpenAPIOperation {
    const swagger = route.swaggerMetadata;

    const operation: OpenAPIOperation = {
      summary: swagger?.summary || this.generateDefaultSummary(route),
      description: swagger?.description,
      tags: swagger?.tags || [route.controllerName.replace('Controller', '')],
      responses: this.generateResponses(route, swagger?.responses)
    };

    const parameters: OpenAPIParamater[] | undefined = this.generateParameters(route);
    if (parameters && parameters.length > 0) {
      operation.parameters = parameters;
    }

    // auto-detect requestBody or get from metadata
    if (this.shouldHaveRequestBody(route.method)) {
      if (swagger?.requestBody) {
        operation.requestBody = swagger.requestBody;
      } else if (this.hasBodyParameter(route)) {
        operation.requestBody = {
          description: 'Request body',
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        };
      }
    }

    return operation;
  }

  private generateDefaultSummary(route: ISwaggerRoute): string {
    const action = route.method.toUpperCase();
    const resource = route.controllerName.replace('Controller', '');
    return `${action} ${resource} (${route.methodName})`;
  }

  private generateParameters(route: ISwaggerRoute): OpenAPIParamater[] | undefined {
    const metadataParams = route.params // from Express decorators metadata
      .map(this.parseRouteParam.bind(this))
      .filter(p => p !== null);
    const pathParams = this.extractPathParameters(route.path); // from route path
    const describedParams = route.swaggerMetadata?.parameters || []; // from Swagger decorators

    // priority: Swagger decorators > Express decorators metadata > Path (auto)
    const paramMap = new Map<string, OpenAPIParamater>();

    pathParams.forEach(name => {
      paramMap.set(`${name}-path`, {
        name, in: 'path', required: true,
        schema: { type: 'string' }, description: `${name} parameter`
      });
    });
    metadataParams.forEach(param => {
      paramMap.set(`${param.name}-${param.in}`, param);
    });
    describedParams.forEach(param => {
      paramMap.set(`${param.name}-${param.in}`, param);
    });

    const result = Array.from(paramMap.values());
    return result.length > 0 ? result : undefined;
  }

  private extractPathParameters(path: string): string[] {
    const matches = path.match(/:(\w+)/g);
    return matches ? matches.map(match => match.substring(1)) : [];
  }

  private parseRouteParam(param: IRouteParam): OpenAPIParamater | null {
    if (param.path.length < 3 || param.path[0] !== 'req') {
      return null; // ignore @Req, @Res, @Next etc.
    }

    const [, paramType, paramName] = param.path;

    const swaggerParamType = this.mapToSwaggerParamType(paramType);
    if (!swaggerParamType) {
      return null; // body, logger etc.
    }

    return {
      name: paramName,
      in: swaggerParamType,
      required: swaggerParamType === 'path',
      schema: { type: 'string' },
      description: `${paramName} ${swaggerParamType}`,
    };
  }

  private mapToSwaggerParamType(paramType: string): 'path' | 'query' | 'header' | null {
    switch (paramType) {
      case 'params': return 'path';
      case 'query': return 'query';
      case 'headers': return 'header';
      case 'body': return null; // body handled separately
      case 'logger': return null; // yasui custom
      default: return null;
    }
  }

  private generateResponses(
    route: ISwaggerRoute,
    customResponses?: OpenAPIResponses
  ): OpenAPIResponses {
    if (customResponses && Object.keys(customResponses).length > 0) {
      return customResponses;
    }
    const defaultStatus: HttpCode = route.defaultStatus || HttpCode.OK;
    return { [defaultStatus]: { description: HttpCodeMap[defaultStatus] } };
  }

  private shouldHaveRequestBody(method: string): boolean {
    return ['post', 'put', 'patch'].includes(method.toLowerCase());
  }

  private hasBodyParameter(route: ISwaggerRoute): boolean {
    return route.params.some(param =>
      param.path.length >= 2 &&
      param.path[0] === 'req' &&
      param.path[1] === 'body'
    );
  }
}
