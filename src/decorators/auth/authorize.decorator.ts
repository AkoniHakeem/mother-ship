import { AuthPayload } from '../../lib/types';
import * as helpers from '../../lib/helpers';
import { HttpResponseHandler } from '../../handlers/ResponseHandler';

/* the possible entities and permissions required for this is listed in e */
export function authorize() {
  /*  */
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (targetClass: Object, methodName: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const targetMethod = descriptor.value;
    let result: unknown;
    descriptor.value = async function (...args: unknown[]) {
      // const [res] = args as [HttpResponse];
      const res = [...args].shift() as HttpResponseHandler;

      /* check the user entity is among thhe specified authorization entities */

      /* check jwtAuthPayload for userdata */
      const { userData, profile } = res.authTokenPayload as AuthPayload;
      if (userData && profile) {
        let isAllowed: null | boolean = false;

      } else {
        helpers.handleUnauthorizedAccess(res);
        return;
      }

      /* invoke the target method */
      result = targetMethod.apply(this, args);
      if (result instanceof Promise) {
        result = await result;
      }

      return result;
    };

    return descriptor;
  };
}
