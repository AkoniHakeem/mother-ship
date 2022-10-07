import { RequestMethods, Route } from '../lib/types';
import { ROUTES_KEY } from '../lib/projectConstants';

/** This decorator helps to facilitate specifying routes. The routing engine automatically collects all routes across and makes them available at run time. Note that it does not check for duplicated route paths. Set the http method for the route path with the sencod arguement. This defaults to 'get' when it is not specified. Also, note that in some node js frameworks 'del' is used rather than 'delete'. */
export function Routes(
  path: string,
  requestMethod?: RequestMethods,
  // eslint-disable-next-line @typescript-eslint/ban-types
): (target: Object, actionMethod: string, descriptor: PropertyDescriptor) => void {
  if (!requestMethod) {
    requestMethod = 'get';
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, actionMethod: string, descriptor: PropertyDescriptor) => {
    if (!Reflect.hasMetadata(ROUTES_KEY, target.constructor)) {
      Reflect.defineMetadata(ROUTES_KEY, [], target.constructor);
    }
    const routes = Reflect.getMetadata(ROUTES_KEY, target.constructor) as Route[];

    routes.push({
      method: requestMethod,
      path,
      action: actionMethod,
    });
    Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);

    const action = descriptor.value;

    descriptor.value = async function (...args: []) {
      action(...args);
    };
  };
}
