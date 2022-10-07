import { ValidationError, validate } from 'class-validator';
import { get, merge } from 'lodash';
import { ObjectLiteral } from 'typeorm';
import { HttpResponse } from 'uWebSockets.js';
import { CustomError, ResponseObject } from '../lib/types';
import { AuthPayload } from '../lib/types';
import { ErrorCodes } from '../errors/errorCodes';
import { manageCors, sendClientErrors } from '../lib/helpers';
import { Logger } from '../logger/logger';

export class HttpResponseHandler {
  constructor(res: HttpResponse) {
    this._res = res;

    /* required by uws to update when request has been aborted */
    res.onAborted(() => {
      this.aborted = true;
    });
  }

  [key: string]: unknown;

  aborted = false;

  ipAddress: string;

  params: Record<string, unknown>;

  body: Record<string, unknown>;

  bodyBuffer: Buffer;

  host: string;

  method: string;

  headers: Record<string, unknown>;

  authTokenPayload: AuthPayload;

  query: Record<string, unknown>;

  _res: HttpResponse;

  _statusCode = 200;

  _headers: Record<string, string> = {};

  writeHeader(key: string, val: string): this {
    this._headers[key] = val;
    return this;
  }

  get<T>(source: 'body' | 'query' | 'params' | 'authTokenPayload', path: string, defaultValue?: unknown): T {
    const valueToGet = get(this[source], path, defaultValue) as T;
    return valueToGet;
  }

  writeStatus(code: number): this {
    this._statusCode = code;
    return this;
  }

  handleValidationErrors = (validationErrors: unknown): void => {
    const err: CustomError = {
      code: ErrorCodes.BODY_VALIDATION_FAILED,
      message: 'validation failed. see error data for details',
      data: validationErrors,
    };
    sendClientErrors(this, err);
  };

  sendClientErrors = (errorObject: CustomError): void => {
    Logger.info(errorObject);

    const resStatusCode = errorObject.code && errorObject.code === '009' ? 500 : 400;
    if (!this.aborted) {
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
      this.writeStatus(resStatusCode);
      this.end(errorString);
    } else {
      console.log('i escaped yeahhh... ');
    }
  };

  readValidatePostBody = async <T>(
    Dto: { new (): T },
    body: unknown,
    validationOptions: Parameters<typeof validate>[2] = undefined,
  ): Promise<[T, ValidationError[]]> => {
    let dto = new Dto();
    dto = merge(dto, body);
    const validationErrors = await validate(dto as ObjectLiteral, validationOptions);
    return [dto, validationErrors];
  };

  handleUnauthorizedAccess = (data?: unknown): void => {
    if (!this.aborted) {
      const err: CustomError = {
        code: ErrorCodes.UNAUHTORIZED_ACCESS,
        message: 'access denied',
        data,
      };

      this.writeStatus(403);
      this.end(JSON.stringify(err));
    }
  };

  handleUnauthenticatedAccess = (data?: unknown): void => {
    if (!this.aborted) {
      const err: CustomError = {
        code: ErrorCodes.UNAUTHENTICATED_ACCESS,
        message: 'access denied',
        data,
      };

      this.writeStatus(401);
      this.end(JSON.stringify(err));
    }
  };

  sendJson(responsebody: unknown): void {
    this.writeStatus(200);

    const responseObj = new ResponseObject(responsebody);
    responseObj.status = 'successful';

    const bodyJsonString = JSON.stringify(responseObj);

    this.end(bodyJsonString);
  }

  sendSuccess(): void {
    this.writeStatus(204);
    this.end();
  }

  end(body?: string, statusCode?: number): void {
    /* writeStatus */
    if (this.aborted) return;
    if (statusCode) this._statusCode = statusCode;
    this._res.writeStatus(this._statusCode.toString());

    /* write Headers */
    for (const headersProp in this._headers) {
      const headerVal = this._headers[headersProp];
      this._res.writeHeader(headersProp, headerVal);
    }

    manageCors(this._res);
    this._res.end(body);
  }
}
