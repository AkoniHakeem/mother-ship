import { floor, get, isEmpty, isEqual, isObject, isString, set } from 'lodash';
import { AuthPayload } from '../../lib/types';
import { HttpResponseHandler } from '../../handlers/ResponseHandler';
import { handleUnauthenticatedAccess } from '../../lib/helpers';
// import { signAuthPayload } from '../../services/authService';
import { validateJwtToken } from '../../services/cryptoServices';
// import { ProfileService } from '../../services/Profiles/profileService';

export function authenticate(
  options: {
    enforce: boolean;
    checkActiveSubscription?: boolean;
  } = {
    enforce: true,
    checkActiveSubscription: true,
  },
) {
  return (target: unknown, key: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const targetMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      let authenticated = false;
      let data: undefined | { message: string };

      /* get res argument */
      const res = [...args].shift() as HttpResponseHandler;
      try {
        const token = get(res, 'token');
        if (isString(token)) {
          /* verify token and extract payload */
          const jwtPayload = validateJwtToken(token);

          if (isObject(jwtPayload)) {
            //Ensure jwt payload is not empty
            if (!isEmpty(jwtPayload)) {
              const { userData, profile = undefined, exp, appData } = jwtPayload as AuthPayload;
              // if (userData && profile) {
              //   const profileSummary = await ProfileService.getProfileSummary(userData.id, profile.profileCollectionId);
              //   set(jwtPayload, 'profile', profileSummary);

              //   //Check if jwt is same if not, force update user jwt
              //   if (!isEqual(profile, profileSummary)) {
              //     let expiry: number | undefined = exp;
              //     const epoch = floor(Date.now() / 1000);

              //     if (expiry && expiry > epoch) {
              //       expiry = expiry - epoch;
              //     } else {
              //       expiry = undefined;
              //     }

              //     const token = signAuthPayload({ userData, profile: profileSummary }, expiry);
              //     res.writeHeader('NEW_AUTH_TOKEN', token);
              //   }
              // }

              if (appData) {
                // check that app and user exist
                // const appDetails = await db().
                authenticated = true;
                  let expiry: number | undefined = exp;
                  const epoch = floor(Date.now() / 1000);
                  if (expiry && epoch > expiry) {
                    authenticated = false;
                    data = { message: 'Token expired'}
                  } 
              }

              res.authTokenPayload = jwtPayload as AuthPayload;
            }
            
          }
        }
      } catch {
        authenticated = false;
      }

      if (options.enforce && !authenticated) {
        handleUnauthenticatedAccess(res);
        return;
      }

      let result = targetMethod.apply(this, args);
      if (result instanceof Promise) {
        result = await result;
      }
      return result;
    };

    return descriptor;
  };
}
