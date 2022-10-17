import { Logger } from '../logger/logger';
import * as cryptoServices from './cryptoServices';
import { AuthPayload } from '../lib/types';
import { makeRequest } from '../lib/helpers';
import { iDTO } from '../handlers/iDTO';
import { db } from './databaseServie';
import App from '../entities/App';
import User from '../entities/User';

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

export const confirmAppDetails = async(appId: string, userId: string, projectId: string): Promise<boolean> => {
let appDetailsExist = false;
const appDetails = (await db().createQueryBuilder(App, 'app')
.select('app.id', 'appId')
.innerJoin(User, 'user', 'user.id = :userId')
.where('app.id = :appId and app.projectId = :projectId', { appId, userId, projectId })
.getRawOne()) as { appId: string};

appDetailsExist = !!appDetails;
return appDetailsExist;
}

export const getExistingAppUser = async (userEmail: string, appId: string): Promise<{ userId: string; appUserId: string; email: string; passwordHash: string } | null> => {
  const existingUser = await db().createQueryBuilder(User, 'user')
  .select('user.id', 'userId')
  .addSelect('appUser.id', 'appUserId')
  .addSelect('user.email', 'email')
  .addSelect('appUser.password', 'passwordHash')
  .innerJoin('user.userApps', 'appUser', 'user.id = appUser.userId and appUser.id = :appId')
  .where('user.email = :userEmail', { userEmail, appId })
  .groupBy('user.id')
  .addGroupBy('appUser.id')
  .getRawOne()

  return existingUser;
}

export const signAuthPayload = (payload: AuthPayload, expiry?: number | string): string => {
  return cryptoServices.signPayload(payload, expiry);
};
