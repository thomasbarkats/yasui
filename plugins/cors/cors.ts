import type { YasuiRequest, RequestHandler, NextFunction } from 'yasui';


/** CORS configuration */
export interface CorsConfig {
  /** Allowed origins. Use '*' for all origins (not recommended with credentials)
   *  @example ['https://app.example.com', 'https://admin.example.com']
   *  @example [/^https:\/\/.*\.example\.com$/] */
  origins: (string | RegExp)[] | '*';
  /** Allowed HTTP methods
   *  @default 'GET,POST,PUT,DELETE,PATCH,OPTIONS' */
  methods?: string;
  /** Allowed request headers
   *  @default 'Content-Type,Authorization' */
  headers?: string;
  /** Allow credentials (cookies, authorization headers). Cannot use '*' for origins when true
   *  @default false */
  credentials?: boolean;
  /** Preflight response cache duration in seconds
   *  @default 86400 */
  maxAge?: number;
  /** Headers exposed to the client */
  exposeHeaders?: string;
  /** Allow requests with null origin (file://, sandboxed iframes, etc.)
   *  @default false */
  allowNullOrigin?: boolean;
  /** Enable Private Network Access support (CORS-RFC1918)
   *  @default false */
  allowPrivateNetwork?: boolean;
}


/** CORS middleware factory for YasuiJS */
export function cors(config: CorsConfig): RequestHandler {
  const {
    origins,
    methods = 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    headers = 'Content-Type,Authorization',
    credentials = false,
    maxAge = 86400,
    exposeHeaders,
    allowNullOrigin = false,
    allowPrivateNetwork = false
  } = config;

  /** validate configuration at startup */
  if (credentials && origins === '*') {
    throw new Error('CORS: cannot use credentials with wildcard origin (origins: "*")');
  }

  return async (req: YasuiRequest, next?: NextFunction): Promise<Response> => {
    const origin = req.headers.get('origin');
    const isAllowed = isOriginAllowed(origin, origins, allowNullOrigin);

    /** handle preflight OPTIONS request */
    if (req.method === 'OPTIONS') {
      /** return 204 without CORS headers for unauthorized origins (industry standard) */
      if (!isAllowed) {
        return new Response(null, { status: 204 });
      }

      /** check if Private Network Access is requested (CORS-RFC1918) */
      const requestPrivateNetwork = req.headers.get('access-control-request-private-network') === 'true';

      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(origin, origins, {
          methods,
          headers,
          credentials,
          maxAge,
          exposeHeaders,
          allowPrivateNetwork: allowPrivateNetwork && requestPrivateNetwork
        })
      });
    }

    /** execute next middleware/handler */
    if (!next) {
      return new Response(null, { status: 500 });
    }

    const response = await next();

    /** skip CORS headers if origin not allowed */
    if (!isAllowed) {
      return response;
    }

    /** inject CORS headers into response */
    const corsHeaders = buildCorsHeaders(origin, origins, {
      methods,
      headers,
      credentials,
      exposeHeaders,
      allowPrivateNetwork
    });

    const responseHeaders = new Headers(response.headers);
    corsHeaders.forEach((value, key) => {
      /** merge Vary header instead of overwriting */
      if (key.toLowerCase() === 'vary') {
        const existingVary = responseHeaders.get('vary');
        if (existingVary && !existingVary.split(',').map(v => v.trim()).includes('Origin')) {
          responseHeaders.set('vary', `${existingVary}, Origin`);
        } else if (!existingVary) {
          responseHeaders.set('vary', value);
        }
      } else {
        responseHeaders.set(key, value);
      }
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  };
}


function isOriginAllowed(
  origin: string | null,
  allowed: (string | RegExp)[] | '*',
  allowNullOrigin: boolean
): boolean {
  if (!origin) {
    return allowNullOrigin;
  }
  if (allowed === '*') {
    return true;
  }
  return allowed.some(pattern => {
    if (typeof pattern === 'string') {
      return pattern === origin;
    }
    return pattern.test(origin);
  });
}

function buildCorsHeaders(
  origin: string | null,
  allowedOrigins: (string | RegExp)[] | '*',
  config: {
    methods?: string;
    headers?: string;
    credentials?: boolean;
    maxAge?: number;
    exposeHeaders?: string;
    allowPrivateNetwork?: boolean;
  }
): Headers {
  const headers = new Headers();

  /** set Access-Control-Allow-Origin with proper Vary header */
  if (allowedOrigins === '*' && !config.credentials) {
    headers.set('Access-Control-Allow-Origin', '*');
  } else {
    headers.set('Access-Control-Allow-Origin', origin ?? '*');
    headers.set('Vary', 'Origin');
  }

  if (config.methods) {
    headers.set('Access-Control-Allow-Methods', config.methods);
  }
  if (config.headers) {
    headers.set('Access-Control-Allow-Headers', config.headers);
  }
  if (config.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  if (config.maxAge !== undefined) {
    headers.set('Access-Control-Max-Age', config.maxAge.toString());
  }
  if (config.exposeHeaders) {
    headers.set('Access-Control-Expose-Headers', config.exposeHeaders);
  }
  if (config.allowPrivateNetwork) {
    headers.set('Access-Control-Allow-Private-Network', 'true');
  }

  return headers;
}
