import { Logger } from '../logger/logger';
import * as cryptoServices from './cryptoServices';
import { AuthPayload } from '../lib/types';
import { makeRequest } from '../lib/helpers';
import { iDTO } from '../handlers/iDTO';

export const requestAuth = async (
  urlPath: string,
  dto: iDTO | Record<string, unknown>,
): ReturnType<typeof makeRequest> => {
  try {
    /* request user manager endpoint */
    const url = `${process.env.AUTH_PROVIDER_ENDPOINT}/auth/${urlPath}`;
    const requestBody = dto as Record<string, unknown>;
    return makeRequest(url, 'post', requestBody, undefined, 'body');
  } catch (error) {
    Logger.info(error);
    throw error;
  }
};

export const requestAuthService = async (
  urlPath: string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  dto?: iDTO | Record<string, unknown>,
): ReturnType<typeof makeRequest> => {
  try {
    /* request user manager endpoint */
    const url = `${process.env.AUTH_PROVIDER_ENDPOINT}/auth${urlPath}`;
    const requestBody = dto as Record<string, unknown>;
    return makeRequest(url, method, requestBody, undefined, 'body');
  } catch (error) {
    Logger.info(error);
    throw error;
  }
};

export const signAuthPayload = (payload: AuthPayload, expiry?: number | string): string => {
  return cryptoServices.signPayload(payload, expiry);
};
