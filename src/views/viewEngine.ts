import { readFile } from 'fs/promises';
import Handlebars from 'handlebars';
export const compile = async (path: string, objectFieldsTarget: Record<string, unknown>): Promise<string> => {
  const source = await readFile(path, 'utf-8');

  const template = Handlebars.compile(source);
  const htmlString = template(objectFieldsTarget);
  return htmlString;
};
