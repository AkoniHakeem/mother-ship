import { HttpResponse } from 'uWebSockets.js';
import { Logger } from '../logger/logger';
import { parse } from 'secure-json-parse';
import { CustomError, ResponseObject } from './types';
import { ErrorCodes } from '../errors/errorCodes';
import {
  get,
  has,
  isObject,
  each,
  isEmpty,
  reject,
  isString,
  pick,
  merge,
} from 'lodash';
import { Connection, DataSource, EntityManager, QueryRunner } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import fsPromise from 'fs/promises';
import path from 'path';
import { SqlReader } from 'node-sql-reader';
import { isJSON } from 'class-validator';
import axios from 'axios';
import { HttpResponseHandler } from '../handlers/ResponseHandler';
import { db } from '../services/databaseServie';
import { readFile } from 'fs/promises';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import randomString from 'randomstring';
import { plainToClass } from 'class-transformer'
import HashIds  from 'hashids'

export const readJsonAsync = (res: HttpResponse, asBuffer = false): Promise<unknown> =>
  new Promise((resolve, reject) => {
    let buffer: Buffer;
    /* Register data cb */
    res.onData((ab, isLast) => {
      const chunk = Buffer.from(ab);
      if (isLast) {
        buffer = buffer ? Buffer.concat([buffer, chunk]) : chunk;
        let hasError = false;
        let json: unknown = null;

        if (buffer) {
          if (asBuffer) {
            resolve(buffer);
            return;
          } else {
            try {
              json = parse(buffer.toString('utf-8'));
            } catch {
              hasError = true;
            }
          }
        }

        if (hasError) {
          const err = new Error('There was an error reading the post body');
          err.name = ErrorCodes.BODY_READING_FAILED;

          reject(err);
        } else {
          resolve(json);
        }
      } else {
        buffer = buffer ? Buffer.concat([buffer, chunk]) : Buffer.concat([chunk]);
      }
    });
  });

export const bufferToObj = (buffer: Buffer): Record<string, unknown> | undefined => {
  try {
    return parse(buffer.toString('utf-8'));
  } catch {
    return undefined;
  }
};

export function getIpAsString(res: HttpResponse): string {
  const bufferedIp = Buffer.from(res.getRemoteAddressAsText());
  const ipString = bufferedIp.toString('utf-8');

  return ipString;
}

export const sendSuccess = (res: HttpResponseHandler): void => {
  if (!res.aborted) {
    const resStatusCode = 204;
    res.writeStatus(resStatusCode);
    res.end();
  }
};

export const sendJson = (res: HttpResponseHandler, responseBody: unknown): void => {
  const resStatusCode = 200;
  if (!res.aborted) {
    res.writeHeader('Content-Type', 'application/json');

    const responseObj = new ResponseObject(responseBody);
    responseObj.status = 'successful';

    const responseJson = JSON.stringify(responseObj);

    res.writeStatus(resStatusCode);
    res.end(responseJson);
  }
};

export const sendClientErrors = (res: HttpResponseHandler, errorObject: CustomError): void => {
  Logger.info(errorObject); /* we log here now as we dont want any error to pass unnoticed */
  const resStatusCode = errorObject.code && errorObject.code === '009' ? 500 : 400;
  if (!res.aborted) {
    res.writeHeader('Content-Type', 'application/json');

    if (
      ((errorObject as Record<string, unknown>)['name'] && (errorObject as Record<string, unknown>)['severity']) ||
      (errorObject as Record<string, unknown>)['query']
    ) {
      /* change the error to unknown server error */
      errorObject = { code: ErrorCodes.QUERY_ERROR, message: 'query error', data: null };
    } else if (errorObject.code && !Object.values(ErrorCodes).includes(errorObject.code)) {
      /* change the error to unknown server error */
      errorObject = { code: ErrorCodes.UNKNOWN_SERVER_ERROR, message: 'unknown error has occurred', data: null };
    }
    const responseObj = new ResponseObject();
    responseObj.status = 'failed';
    responseObj.error = errorObject;

    const errorString = JSON.stringify(responseObj);
    res.writeStatus(resStatusCode);
    res.end(errorString);
  } else {
    console.log('i escaped yeahhh... ');
  }
};

export const logServerErrorAndSendResponse = (
  res: HttpResponseHandler,
  serverError: CustomError,
  source?: string,
): void => {
  Logger.info(serverError, source);
  if (!res.aborted) {
    res.writeHeader('Content-Type', 'application/json');

    const resStatusCode = 500;
    const responseObj = new ResponseObject();
    responseObj.status = 'unknown';
    responseObj.error = serverError;

    const errorString = JSON.stringify(responseObj);

    res.writeStatus(resStatusCode);
    res.end(errorString);
  }
};

export const onAborted = (res: HttpResponse): void => {
  res.onAborted(() => {
    res.aborted = true;
  });
};

export const readValidatePostBody = async <T>(
  Dto: { new (): T },
  body: unknown,
  validationOptions: Parameters<typeof validate>[2] = undefined,
): Promise<[T, ValidationError[]]> => {
  const dto = plainToClass(Dto, body);
  const validationErrors = await validate(dto as Record<string, unknown>, validationOptions);
  return [dto, validationErrors];
};

export const handleUnauthorizedAccess = (res: HttpResponseHandler, data?: unknown): void => {
  if (!res.aborted) {
    res.writeHeader('Content-Type', 'application/json');

    const err: CustomError = {
      code: ErrorCodes.UNAUHTORIZED_ACCESS,
      message: 'access denied',
      data,
    };

    /* log error and data taken from unauthorized access */
    /* logging disabled */
    // Logger.info(err);
    /* respond with forbidden and error */
    res.writeStatus(403);
    res.end(JSON.stringify(err));
  }
};

export const handleUnauthenticatedAccess = (res: HttpResponseHandler, data?: unknown): void => {
  if (!res.aborted) {
    res.writeHeader('Content-Type', 'application/json');

    const err: CustomError = {
      code: ErrorCodes.UNAUTHENTICATED_ACCESS,
      message: 'access denied',
      data,
    };

    /* log error and data taken from unauthenticated access */
    /* logging disabled */
    // Logger.info(err);
    /* respond with forbidden and error */
    res.writeStatus(401);
    res.end(JSON.stringify(err));
  }
};

export const flagDuplicateEnumCodes = (enumObject: Record<string, number | string>): void => {
  const enumValues = Object.values(enumObject);

  for (const val of enumValues) {
    const duplicateExist = enumValues.filter((item) => item === val).length > 1;

    if (duplicateExist) {
      throw new Error(`remove duplicate value for ' ${val} '`);
    }
  }
};

export const handleValidationErrors = (res: HttpResponseHandler, validationErrors: unknown): void => {
  const err: CustomError = {
    code: ErrorCodes.BODY_VALIDATION_FAILED,
    message: 'validation failed. see error data for details',
    data: validationErrors,
  };
  sendClientErrors(res, err);
};

export const composeValidationError = (
  property: string,
  errorMessage: string,
  options?: { targetObject: Record<string, unknown>; valueThatFailedValidation?: string },
): ValidationError => {
  return {
    target: options?.targetObject,
    value: options?.valueThatFailedValidation,
    property,
    constraints: {
      error: errorMessage,
    },
  };
};

export const handleServerErrors = (res: HttpResponseHandler, error: unknown): void => {
  if (res.aborted) return;
  if (isObject(error) && has(error, 'code')) {
    sendClientErrors(res, error as CustomError);
    return;
  }

  const err: CustomError = {
    code: ErrorCodes.UNKNOWN_SERVER_ERROR,
    data: error,
    message: 'An unknown server error occurred',
  };

  if (error instanceof Error) {
    /* determine the source of the error */
    /* check the name */
    const errName = error.name ? error.name : '';
    if (Object.values(ErrorCodes).includes(errName as ErrorCodes)) {
      const errCode = errName as ErrorCodes;
      err.code = errCode;
    }

    if (error.message) {
      err.message = error.message;
    }

    sendClientErrors(res, err);
    return;
  }

  logServerErrorAndSendResponse(res, err);
  return;
};

export const executeSqlFile = async (
  absFilePath: string,
  trusted = false,
  queryRunner: QueryRunner = db().connection.createQueryRunner(),
): Promise<void> => {
  let isFile = true;
  if (!trusted) {
    isFile = (await fsPromise.stat(absFilePath)).isFile();
  }

  if (isFile) {
    console.log(`currently seeding: --> ${absFilePath}`);
    const sqlQueries = SqlReader.readSqlFile(absFilePath);

    if (sqlQueries.length) {
      for await (const query of sqlQueries) {
        try {
          await queryRunner.query(query);
        } catch (e) {
          console.log(`An error occurred while seeding ${absFilePath}`);

          throw e;
        }
      }
    }
  }
};

export const seed = async (
  filePath: string,
  queryRunner: QueryRunner = db().connection.createQueryRunner(),
): Promise<void> => {
  try {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(path.join(__dirname, '..', 'seeders', 'seeds', filePath));
    const stat = await fsPromise.stat(fullPath);

    if (stat.isDirectory()) {
      const dirFiles = await fsPromise.readdir(fullPath);
      if (dirFiles.length) {
        for await (const file of dirFiles) {
          try {
            await seed(`${filePath}/${file}`);
          } catch {}
        }
      }
    } else if (stat.isFile()) {
      await executeSqlFile(fullPath, true, queryRunner);
    }
  } catch (error) {
    const err: CustomError = {
      code: ErrorCodes.SEEDING_ERROR,
      message: 'an error occured while seeding the database',
      data: error,
    };
    Logger.info(err);
  }
};

export const makeRequest = async (
  url: string,
  method: 'get' | 'post' | 'put' | 'delete',
  requestBody: Record<string, unknown> | string | undefined,
  headers: Record<string, unknown> = {},
  responseBodyPath = '',
): Promise<{ statusCode: number; responseBody: unknown }> => {
  try {
    const isSendingJson = isObject(requestBody);
    const response = await axios({
      url,
      method,
      data: isSendingJson ? JSON.stringify(requestBody) : requestBody,
      headers: {
        'Content-Type': isSendingJson ? 'application/json' : 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...headers,
      },
      httpAgent: new HttpAgent({
        keepAlive: true,
      }),
      httpsAgent: new HttpsAgent({
        keepAlive: true,
      }),
      timeout: 50000,
      proxy: false,
      validateStatus: (status) => status < 500,
    });

    let responseBody: Record<string, unknown> =
      isString(response.data) && !isEmpty(response.data.trim()) ? JSON.parse(response.data) : response.data;
    if (!isObject(responseBody)) {
      responseBody = {};
    }

    const statusCode = response.status;
    return {
      statusCode,
      responseBody: responseBodyPath ? get(responseBody, responseBodyPath, {}) : responseBody,
    };
  } catch (error) {
    const status = get(error, 'status') as number;

    if (status) {
      const responseText = get(error, 'response.text') as string;
      const responseBody = responseText && isJSON(responseText) ? JSON.parse(responseText) : {};
      return {
        statusCode: status,
        responseBody,
      };
    }

    Logger.info(error);
    throw error;
  }
};

export const manageCors = (res: HttpResponseHandler | HttpResponse, origin = '*'): void => {
  res.writeHeader('Access-Control-Allow-Origin', origin);
  res.writeHeader('Access-Control-Allow-Credentials', 'true');
  res.writeHeader('Access-Control-Allow-Headers', 'Authorization, Accept, Content-Type, Content-Length, Host');
  res.writeHeader('Access-Control-Expose-Headers', 'Accept, Content-Length, NEW_AUTH_TOKEN');
  res.writeHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT, PATCH');
};

export const encoder = new HashIds(process.env.APP_KEY, 6, '0123456789BCDGTN');
export const encodeId = (id: string): string => {
  return encoder.encode(id);
};

export const decodeId = (hash: string): string | false => {
  try {
    const data = encoder.decode(hash);
    if (!data || isEmpty(data) || get(data, '0') === 'undefined') return false;

    return String(data[0]);
  } catch {
    return false;
  }
};

export const getHtmlIndexFile = async (filePath = 'public/assets/v1/index.html'): Promise<string> => {
  const pathHtml = path.join(process.cwd(), filePath);
  const indexFile = await readFile(pathHtml, 'utf-8');
  return indexFile;
};

export const createAndSetMetaTagData = (document: Document, records: Record<string, string>[]): boolean => {
  const head = document.querySelector('head');

  if (head) {
    const title = head.querySelector('title');
    let insertAfterEl: HTMLElement | Element | null = title;

    records.forEach((record) => {
      const meta = document.createElement('meta');

      each(record, function (value, key) {
        meta.setAttribute(key, value);
      });

      if (insertAfterEl) {
        if (insertAfterEl.nextSibling) {
          head.insertBefore(meta, insertAfterEl.nextSibling);
        } else {
          head.appendChild(meta);
        }
      } else if (head.childNodes[0]) {
        head.insertBefore(meta, head.childNodes[0]);
      } else {
        head.appendChild(meta);
      }

      insertAfterEl = meta;
    });

    return true;
  }

  return false;
};

export const generateUniqueIdFor = (
  tableName: string,
  columnName: string,
  prefix = '',
  length = 50,
  charset: 'alphanumeric' | 'alphabetic' | 'numeric' | 'hex' | 'binary' | 'octal' | string = 'alphanumeric',
  connection: EntityManager | DataSource | Connection = db(),
): Promise<string> => {
  return new Promise(async (resolve) => {
    let calls = 0;

    const generateId = async () => {
      if (calls === 1000) {
        reject('An error generating unique id');
        return;
      }

      calls++;

      let id =
        prefix +
        randomString.generate({
          charset,
          length: length <= 0 ? 1 : length,
        });

      id = id.substring(0, length);

      const conn = connection instanceof EntityManager ? connection.connection : connection;
      const [query, params] = conn.driver.escapeQueryWithParameters(
        `
          select 
            1 as "id"
          from 
            "${tableName}" "record" 
          where 
            "record"."${columnName}" = :id 
          limit 1
        `,
        {
          id,
        },
        {},
      );

      const res = get(await connection.query(query, params), 0, undefined) as
        | {
            id: string;
          }
        | undefined;

      if (res) {
        setImmediate(generateId);
      } else {
        resolve(id);
      }
    };

    generateId();
  });
};

export const generateUniqueId = (
  prefix = '',
  length = 50,
  charset: 'alphanumeric' | 'alphabetic' | 'numeric' | 'hex' | 'binary' | 'octal' | string = 'alphanumeric',
): string => {
  let id =
    prefix +
    randomString.generate({
      charset,
      length: length <= 0 ? 1 : length,
    });

  id = id.substring(0, length);

  return id;
};


export const temporarilyInsert = async <T>(
  source: Record<string, unknown>,
  fieldsToInsert: Array<keyof T>,
  transactionManager: EntityManager,
  entityType: { new (): T },
) => {
  let entityPartial = new entityType();
  entityPartial = merge(entityPartial, pick(source, fieldsToInsert) as Partial<T>);

  entityPartial = await transactionManager.save(entityPartial);
  return entityPartial;
};
