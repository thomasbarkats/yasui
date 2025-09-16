/** Express route params */
export enum RouteParamTypes {
  REQ = 'req',
  RES = 'res',
  NEXT = 'next',
}

/** Express Request object params */
export enum RouteRequestParamTypes {
  HEADER = 'headers',
  PARAM = 'params',
  QUERY = 'query',
  BODY = 'body',
  LOGGER = 'logger',
}

/** HTTP verbs, lowercase, internal use */
export enum RouteMethods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
}
