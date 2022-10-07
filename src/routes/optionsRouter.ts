import { TemplatedApp, HttpResponse } from 'uWebSockets.js';
import { manageCors } from '../lib/helpers';

export const optionsRouter = (app: TemplatedApp): void => {
  app.options(`/*`, function (res: HttpResponse) {
    res.writeStatus('200');
    manageCors(res);

    res.end();
  });
};
