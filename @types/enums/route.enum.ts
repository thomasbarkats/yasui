/** Express route params */
export enum RouteParamTypes {
  REQ = 'req',
  RES = 'res',
  NEXT = 'next',
}

export enum RouteRequestParamTypes {
  HEADER = 'headers',
  PARAM = 'params',
  QUERY = 'query',
  BODY = 'body',
  LOGGER = 'logger',
}

export enum RouteMethods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
}
