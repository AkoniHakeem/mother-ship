import { ErrorCodes } from '../errors/errorCodes';

export type PhoneNumber = {
  type: 'Mobile' | 'Work' | 'Home'
  number: string
}

export type CustomError = {
  message: string;
  code?: ErrorCodes;
  data?: unknown;
};

export class ResponseObject {
  constructor(public body?: unknown) {
    this.body = body;
  }
  status: 'successful' | 'failed' | 'pending' | 'unknown';
  error?: CustomError;
}

export type GCaptChaResponse = {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: Date; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  hostname: string; // the hostname of the site where the reCAPTCHA was solved
  'error-codes': unknown[]; // optional
};

export type AuthPayload = {
  userData?: AuthenticatedUserData;
  profile?: null;
  project?: AuthUserProject;
  appData?: AuthenticatedAppData;
  exp?: number;
};

export type AuthUserProject = {
  id: string;
  name: string;
};

export type AuthenticatedAppData = {
  id: string; // TODO: use id as hased id
  name: string;
  creatorUserId: string;
}


export type AuthenticatedUserData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};
/**
 * Specifies the http request methods. Note that for some node js http frameworks the 'del' is used instead of 'delete. */
export type RequestMethods = 'get' | 'post' | 'put' | 'del' | 'delete' | 'options' | 'patch';

export type Route = {
  method: RequestMethods | undefined;
  path: string;
  action: string | symbol;
};

export type PreSignedUrlPart = {
  partNumber?: number;
  preSignedUrl: string;
  bytesFrom?: number;
  bytesTo?: number;
};

type PresignedCommonRequestResponse = {
  fileId: string;
};

export type PresignedSingleRequestResponse = PresignedCommonRequestResponse & {
  type: 'single';
  url: string;
};

export type PresignedMultipartRequestResponse = PresignedCommonRequestResponse & {
  type: 'multipart';
  parts: PreSignedUrlPart[];
};

export type PreSignedUrlRequestResponse = PresignedSingleRequestResponse | PresignedMultipartRequestResponse;
