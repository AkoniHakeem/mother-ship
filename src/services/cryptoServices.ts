import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { parse } from 'secure-json-parse'
import { JWT_SECRET } from '../lib/projectConstants';

const jwtSecret = JWT_SECRET;
const passwordHashSaltRounds = Number(process.env['PASSWORD_SALTROUNDS']);

export const hashPassword = async (password: string): Promise<string> => {
  const passwordHash = await bcrypt.hash(password, passwordHashSaltRounds);
  return passwordHash;
};

export const verifyPasswordHash = async (password: string, passwordHash: string): Promise<boolean> => {
  const exists = bcrypt.compare(password, passwordHash);
  return exists;
};

/* requires  the expireIn field to be set on the jwt token */
export const signPayload = <T extends Record<string, unknown>>(payload: T, expiry?: string | number): string => {
  const authToken = jwt.sign(payload, jwtSecret, { expiresIn: expiry || process.env.JWT_EXPIRY || 60 * 60 * 3 });
  return authToken;
};

export const validateJwtToken = <T extends string, R extends Record<string, unknown>>(token: T): R | undefined => {
  try {
    const payload = jwt.verify(token, jwtSecret);
    return parse(payload as string) as R;
  } catch (e) {
    return undefined;
  }
};

export const generateRandomNumberToken = (length: number): string => {
  const tokenArray = [];
  let tokenString = '';

  for (let count = 0; count < length; count++) {
    const tokenDigit = Math.floor(Math.random() * 10);
    tokenArray.push(tokenDigit);
  }
  tokenString = tokenArray.join('');
  return tokenString;
};

export const generateTimeStampedUId = (randomNumberLength: number): string => {
  const uidToken = {
    token1: '',
    token2: '',
  };
  uidToken.token1 = generateRandomNumberToken(randomNumberLength);
  let token2 = generateRandomNumberToken(randomNumberLength);
  while (token2 === uidToken.token1) {
    /* regenerate token 2 */
    token2 = generateRandomNumberToken(randomNumberLength);
  }
  uidToken.token2 = token2;
  const timeStamp = Date.now();
  const timeStampedUId = uidToken.token1 + timeStamp + uidToken.token2;
  return timeStampedUId;
};
