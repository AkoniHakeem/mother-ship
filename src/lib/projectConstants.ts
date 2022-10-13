export type ProcessEnv = {
  NODE_ENV: 'development' | 'production' | 'test';
  SERVER_HOST: string;
  SERVER_PORT: string;
  APP_KEY: string;
  APP_VERSION: string;
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  REDIS_PASSWORD?: string;
  REDIS_DATABASE?: number;
  REDIS_FAMILY?: number;
  REDIS_DATABASE_NAME: string;
  REDIS_SUBSCRIPTION?: string;
  MAX_AUTH_FAILURE_BEFORE_BLACKLIST: number;
  AUTH_PROVIDER_ENDPOINT: string;
  JWT_SECRET: string;
  JWT_EXPIRY: string;
  PORT: number;
  CAPTCHA_SECRET: string;
  CAPTCHA_MINIMUM_EXPECTED_SCORE: number;
  AWS_S3_BUCKET: string;
  AWS_S3_BUCKET_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_SIGNED_URL_EXPIRY: number;
  SITE_URL: string;
  FILE_CHUNK_PARTITION_SIZE: number;
  MAIL_API_KEY: string;
  MAIL_SENDER_ACCOUNT: string;
  COMPANY_LOGO_URL: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_CONN_POOL_COUNT: number;
  PROJECT_NAME: string;
  PASSWORD_SALTROUNDS: number;
};

import path, { dirname, join } from 'path';
import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

expand(
  dotenv.config({
    path: path.join(process.cwd(), '.env'),
  }),
);

const processEnvObj = process.env as unknown as ProcessEnv;

// console.log('The following variables has been loaded', processEnvObj)

export const PASSWORD_SALTROUNDS = Number(processEnvObj.PASSWORD_SALTROUNDS);

export const SERVER_HOST = processEnvObj.SERVER_HOST;

export const SERVER_PORT = processEnvObj.PORT;

export const MAIL_API_KEY = processEnvObj.MAIL_API_KEY;

export const AWS_ACCESS_KEY_ID = processEnvObj.AWS_ACCESS_KEY_ID;

export const AWS_SECRET_ACCESS_KEY = processEnvObj.AWS_SECRET_ACCESS_KEY;

export const AWS_S3_BUCKET_REGION = processEnvObj.AWS_S3_BUCKET_REGION;

export const JWT_SECRET = processEnvObj.JWT_SECRET;

export const FILE_CHUNK_PARTITION_SIZE = parseFloat(String(processEnvObj.FILE_CHUNK_PARTITION_SIZE)) || 0;

export const S3_BUCKET_NAME = processEnvObj.AWS_S3_BUCKET;

export const AWS_SIGNED_URL_EXPIRY = processEnvObj.AWS_SIGNED_URL_EXPIRY;

export const NODE_ENV = processEnvObj.NODE_ENV;

export const ROUTES_KEY = 'routes';

export const CONTROLLER_KEY = 'prefix';

export const API_PATH_V1 = '/api/v1';

export const DB_PASSWORD = processEnvObj.DB_PASSWORD;

export const DB_NAME = processEnvObj.DB_NAME;

export const DB_HOST = processEnvObj.DB_HOST;

export const DB_USER = processEnvObj.DB_USER;

export const DB_PORT = processEnvObj.DB_PORT;

export const DB_CONN_POOL_COUNT = processEnvObj.DB_CONN_POOL_COUNT;

export const REDIS_PASSWORD = processEnvObj.REDIS_PASSWORD;

export const REDIS_HOST = processEnvObj.REDIS_HOST;

export const pathFromSrc = (path: string) => {
  return join(__dirname, '../', path);
};

