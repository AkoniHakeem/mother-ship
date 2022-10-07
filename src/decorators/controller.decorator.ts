import { CONTROLLER_KEY, ROUTES_KEY } from '../lib/projectConstants';

export function Controller(prefix = '') {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object): void => {
    Reflect.defineMetadata(CONTROLLER_KEY, prefix, target);

    if (!Reflect.hasMetadata(ROUTES_KEY, target)) {
      Reflect.defineMetadata(ROUTES_KEY, [], target);
    }
  };
}
