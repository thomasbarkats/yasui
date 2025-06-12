import { HttpCode, HttpCodeMap, ReflectMetadata } from '~types/enums';
import {
  IRouteParam,
  ISwaggerConfig,
  ISwaggerRoute,
  TController,
} from '~types/interfaces';
import {
  OpenAPIOperation,
  OpenAPIParamater,
  OpenAPIResponses,
} from '~types/openapi';
import { getMetadata } from './reflect';


export class SwaggerService {
  private routesRegistry: ISwaggerRoute[] = [];


  public registerControllerRoutes(
    ControllerClass: TController,
    controllerPath: string
  ): void {
    const routes = getMetadata(ReflectMetadata.ROUTES, ControllerClass.prototype) || [];

    for (const route of routes) {
      const swaggerMetadata = getMetadata(ReflectMetadata.SWAGGER, ControllerClass.prototype, route.methodName) || {};
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
    info?: Partial<ISwaggerConfig['info']>,
    hasApiKey: boolean = false
  ): ISwaggerConfig {
    const config: ISwaggerConfig = {
      openapi: '3.0.0',
      paths: {},
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Generated API documentation',
        ...info
      },
    };

    if (hasApiKey) {
      config.components = {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key'
          }
        }
      };
    }

    for (const route of this.routesRegistry) {
      if (!config.paths[route.fullPath]) {
        config.paths[route.fullPath] = {};
      }
      const operation: OpenAPIOperation = this.buildOperation(route);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config.paths[route.fullPath] as any)[route.method] = operation;
    }

    return config;
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
