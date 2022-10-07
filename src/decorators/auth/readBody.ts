import { HttpResponse } from 'uWebSockets.js';
import { readJsonAsync } from '../../lib/helpers';

export function readBody() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, methodName: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const targetMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const res = [...args].shift() as HttpResponse;
      const body = await readJsonAsync(res);
      res.body = body;
      let result = targetMethod.apply(this, args);
      if (result instanceof Promise) {
        result = await result;
      }
      return result;
    };
    return descriptor;
  };
}
