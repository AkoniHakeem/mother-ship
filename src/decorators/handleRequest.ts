import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { CustomError } from '../lib/types';
import { ErrorCodes } from '../errors/errorCodes';
import * as helpers from '../lib/helpers';
import { HttpResponseHandler } from '../handlers/ResponseHandler';
import { parse as decodeQueryString, stringify as stringifyQueryString } from 'qs';
import { get, isBoolean, isEmpty } from 'lodash';
import { GCaptChaResponse } from '../lib/types';
import { writeFile } from 'fs/promises';
import { NODE_ENV } from '../lib/projectConstants';
// import { getCacheFor } from '../support/cache';
// import { CacheKey } from '../types/cache';
import ms from 'ms';
import { larger, number, divide } from 'mathjs';
import isNumeric from 'fast-isnumeric';

export function handleRequest(options?: {
  throttle?: {
    using: 'ip' | 'token';
    for: string | number;
    max?: number;
  };
  getMethod?: boolean;
  getQuery?: boolean;
  params?: string[];
  readHeaders?: boolean;
  readBody?: boolean;
  getUrl?: boolean;
  isWebHook?: boolean;
  bypassCaptcha?: boolean;
}) {
  return (target: unknown, key: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const targetMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const [response, req] = [...args] as [HttpResponse, HttpRequest];

      /* required by uws to update when request has been aborted */
      // helpers.onAborted(response);
      /* initiate a response Handler */
      const res = new HttpResponseHandler(response);
      res.ipAddress = helpers.getIpAsString(response);

      const host = req.getUrl();
      res.host = host;

      const method = req.getMethod();
      res.method = method;

      (async () => {
        try {
          /* extract token */
          const jwtToken = req.getHeader('authorization').split(' ');
          res.token = jwtToken[1];

          if (options) {
            /* read headers */
            if (options.readHeaders) {
              const headers: Record<string, unknown> = {};
              req.forEach((key, val) => (headers[key] = val));
              res.headers = { ...headers };
            }

            /* get query */
            if (options.getQuery) {
              /* get the query string */
              const queryString = req.getQuery().trim();

              //#region query string transformation
              let queryObject: Record<string, unknown> = {};
              /* return immediately if querystring is empty */
              if (queryString) {
                queryObject = decodeQueryString(queryString);
              }
              //#endregion

              res.query = { ...queryObject };
            }

            /* read params */
            if (options.params && options.params.length > 0) {
              const paramsLenght = options.params.length;
              const params: Record<string, unknown> = {};
              for (let i = 0; i < paramsLenght; i++) {
                const paramsKey = options.params[i];
                params[paramsKey] = req.getParameter(i);
              }

              res.params = params;
            }

            /* read body */
            if (options.readBody) {
              const method = res.method;
              const methodToUseWithCaptCha = ['post', 'put'];
              const bodyBuffer = (await helpers.readJsonAsync(response, true)) as Buffer;
              const parsedBody = helpers.bufferToObj(bodyBuffer) || {};

              let bypassCaptcha = options.bypassCaptcha;
              if (!isBoolean(bypassCaptcha)) {
                bypassCaptcha = !!options.isWebHook;
              }

              /* use recaptcha only in production and method is Post and Put */
              const isProduction = process.env.NODE_ENV === 'production';
              if (!bypassCaptcha && isProduction && methodToUseWithCaptCha.includes(method)) {
                const secret = process.env.CAPTCHA_SECRET;
                const gCaptChaKey = parsedBody['g-captcha-key'] as string;
                const captChaMinimumExpectedScore = process.env.CAPTCHA_MINIMUM_EXPECTED_SCORE as unknown as number;
                const captChatRequestBody = {
                  secret,
                  response: gCaptChaKey,
                };

                /* invoke google recaptcha endpoint */
                const url = 'https://www.google.com/recaptcha/api/siteverify';
                const { responseBody } = await helpers.makeRequest(
                  url,
                  'post',
                  stringifyQueryString(captChatRequestBody),
                  {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                );

                const resBody = (isEmpty(responseBody) ? undefined : responseBody) as GCaptChaResponse | undefined;
                if (!resBody || !resBody.success || resBody.score < captChaMinimumExpectedScore) {
                  const err: CustomError = {
                    code: ErrorCodes.CAPTCHA_FAILURE,
                    message: 'captcha verification failed',
                    data: get(resBody, 'error-codes'),
                  };

                  throw err;
                }
              }

              res.body = parsedBody;
              res.bodyBuffer = bodyBuffer;
            }
          }

          // if (options && options.throttle) {
          //   const cache = getCacheFor(CacheKey.ENDPOINT_THROTTLE);

          //   if (cache) {
          //     let key = res.ipAddress;

          //     if (options.throttle.using === 'token') {
          //       const jsonToken = res.token as string;

          //       if (jsonToken) {
          //         key = jsonToken;
          //       }
          //     }

          //     key = `request-access-lock-${res.method}-to-${res.host}-for-${key}`;

          //     const maxRequestCount = parseInt(options.throttle.max ? String(options.throttle.max) : '1', 10) || 1;

          //     let requestLock = await cache.get<{
          //       count: number;
          //     }>(key);

          //     if (requestLock) {
          //       if (requestLock.count >= maxRequestCount) {
          //         const err: CustomError = {
          //           code: ErrorCodes.TOO_MANY_REQUESTS,
          //           message: 'Ooops.. Too many request.',
          //           data: null,
          //         };

          //         helpers.sendClientErrors(res.writeStatus(429), err);
          //         return;
          //       }

          //       requestLock.count += 1;
          //     } else {
          //       requestLock = {
          //         count: 1,
          //       };
          //     }

          //     let milliseconds = isNumeric(options.throttle.for)
          //       ? ms(options.throttle.for as number)
          //       : ms(options.throttle.for as string);

          //     if (larger('500', milliseconds)) {
          //       milliseconds = '500';
          //     }

          //     const seconds = divide(number(milliseconds) as number, 1000);

          //     await cache.set(key, requestLock, {
          //       ttl: seconds,
          //     });
          //   }
          // }

          try {
            await targetMethod.apply(this, [res]);
            return;
          } catch (error) {
            const err = error as Record<string, string>;
            if (NODE_ENV === 'development' && 'query' in err) {
              await writeFile('sqlDebug.sql', err.query);
            }

            helpers.handleServerErrors(res, error);
            return;
          }
        } catch (error) {
          helpers.handleServerErrors(res, error);
          return;
        }
      })();
    };

    return descriptor;
  };
}
