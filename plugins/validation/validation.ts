import { plainToInstance } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';
import {
  type IParamMetadata,
  type IPipeTransform,
  type Constructible,
  type RouteRequestParamTypes,
  HttpCode,
  HttpError,
  PipeTransform
} from 'yasui';


/** Validation exception thrown when validation fails */
export class ValidationException extends HttpError {

  private paramType: RouteRequestParamTypes;
  private paramName?: string;
  private className?: string;
  private properties: string[];
  private errors: Record<string, string[]>;


  constructor(
    paramMetadata: IParamMetadata,
    errors: ValidationError[]
  ) {
    super(HttpCode.BAD_REQUEST, '');

    this.paramType = paramMetadata.type;
    this.paramName = paramMetadata.name;
    this.className = paramMetadata.metatype?.name;
    this.message = (this.className || this.paramType) + ' validation failed';
    this.properties = [];
    this.errors = {};

    for (const error of errors) {
      this.properties.push(error.property);
      this.errors[error.property] = Object.values(error.constraints || {});
    }
  }
}


/** Class validator pipe configuration */
export interface ClassValidatorPipeConfig {
  /** Strip properties without decorators (prevents mass assignment vulnerabilities)
   *  @default true */
  whitelist?: boolean;
  /** Throw error if non-whitelisted properties are present (fail-fast mode)
   *  @default false */
  forbidNonWhitelisted?: boolean;
  /** Stop on first validation error (performance optimization)
   *  @default false */
  stopAtFirstError?: boolean;
  /** Validation groups for conditional validation rules
   *  @default undefined */
  groups?: string[];
}


/** Factory to create a validation pipe with optional configuration */
export function validation(config?: ClassValidatorPipeConfig): Constructible<IPipeTransform> {
  const finalConfig: Required<ClassValidatorPipeConfig> = {
    whitelist: config?.whitelist ?? true,
    forbidNonWhitelisted: config?.forbidNonWhitelisted ?? false,
    stopAtFirstError: config?.stopAtFirstError ?? false,
    groups: config?.groups ?? []
  };

  @PipeTransform()
  class ConfiguredValidationPipe implements IPipeTransform {

    async transform(value: unknown, metadata: IParamMetadata): Promise<unknown> {
      const { metatype } = metadata;

      if (!metatype || typeof metatype !== 'function') {
        return value;
      }
      /** skip native types (already handled by YasuiJS type casting) */
      if (
        metatype === String ||
        metatype === Number ||
        metatype === Boolean ||
        metatype === Array ||
        metatype === Object
      ) {
        return value;
      }

      /** transform plain object to class instance (required for decorators to work) */
      const object = plainToInstance(<Constructible>metatype, value, {
        enableImplicitConversion: true
      });

      /** validate with class-validator */
      const errors = await validate(object as object, {
        whitelist: finalConfig.whitelist,
        forbidNonWhitelisted: finalConfig.forbidNonWhitelisted,
        stopAtFirstError: finalConfig.stopAtFirstError,
        groups: finalConfig.groups.length > 0 ? finalConfig.groups : undefined
      });

      if (errors.length > 0) {
        throw new ValidationException(metadata, errors);
      }
      return object;
    }
  }

  return ConfiguredValidationPipe;
}

/** Default validation pipe with standard options */
export const ClassValidatorPipe: Constructible<IPipeTransform> = validation();
