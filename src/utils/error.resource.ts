import kleur from 'kleur';
import { Request } from 'express';

import { HttpCode, HttpCodeMap } from '~types/enums';
import { ObjectSchema } from '~types/openapi';


export class HttpError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any;
  public status?: HttpCode;

  constructor(status: HttpCode, message: string) {
    super(message);
    this.status = status;
  }
}

export class ErrorResource {
  public url: string;
  public path: string;
  public method: string;
  public name: string;
  public message: string;
  public statusMessage: string;
  public status: HttpCode;
  public data: Record<string, string>;

  constructor(err: HttpError, req: Request) {
    this.url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    this.path = req.path;
    this.method = req.method;
    this.status = err.status || HttpCode.INTERNAL_SERVER_ERROR;
    this.statusMessage = HttpCodeMap[this.status] || '';
    this.message = err?.message || '';
    this.name = err.constructor.name;

    this.data = {};
    this.setData(err);
  }


  public toString(): string {
    return `url: ${this.url}\n` +
      `request: ${kleur.italic(`${this.method} ${this.path}`)}\n` +
      `status: ${this.status} (${this.statusMessage})\n` +
      `message: ${this.message}\n` +
      `data: ${JSON.stringify(this.data, null, 2)}`;
  }

  private setData(err: HttpError): void {
    /** get other eventual fields of Error extended instance */
    const otherKeys: string[] = Object.keys(err)
      .filter(key => Object.keys(this).indexOf(key) === -1);

    for (const key of otherKeys) {
      /** add value to data error resource field */
      this.data[key] = err[key];
    }
  }
}

export function ErrorResourceSchema(statusCode: number = 500): ObjectSchema {
  return {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        format: 'uri',
        description: 'Request URL',
        example: 'http://localhost:3000/api/tests'
      },
      path: {
        type: 'string',
        description: 'Request path',
        example: '/api/tests'
      },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        description: 'HTTP method',
        example: 'PUT'
      },
      name: {
        type: 'string',
        description: 'Error class name',
        example: 'Error'
      },
      message: {
        type: 'string',
        description: 'Error message',
        example: 'I just simulate an error.'
      },
      statusMessage: {
        type: 'string',
        description: 'HTTP status message',
        example: HttpCodeMap[statusCode]
      },
      status: {
        type: 'integer',
        minimum: 100,
        maximum: 599,
        description: 'HTTP status code',
        example: statusCode
      },
      data: {
        type: 'object',
        description: 'Additional error data and extended properties',
        example: {}
      }
    }
  };
};
