import 'reflect-metadata';
import { CONTROLLER_KEY, NODE_ENV, ROUTES_KEY, SERVER_HOST, SERVER_PORT } from './lib/projectConstants';
import { flagDuplicateEnumCodes } from './lib/helpers';
import { App } from 'uWebSockets.js';
import { homeRouter } from './routes/homeRouter';
import { optionsRouter } from './routes/optionsRouter';
import { Route } from './lib/types';
import { ErrorCodes } from './errors/errorCodes';
import { get, isArray, isFunction } from 'lodash';
import { connectDataSourceFor } from './services/databaseServie';
import path from 'path';
import { readdir } from 'fs/promises';

export const app = App();

async function launch() {
  try {
    await connectDataSourceFor('default');
    flagDuplicateEnumCodes(ErrorCodes);

    const loadControllers = async (): Promise<{ new(): unknown; boot?: () => void | Promise<void> }[]> => {
      const getFileOrFolderPath = (fileName: string) => path.resolve(__dirname, path.resolve(__dirname, fileName));
      const folderName = 'controllers'
      const filePath = getFileOrFolderPath(folderName);
      const files = await readdir(filePath);
      const fileterdFiles = files.filter((file) => /.js$/.test(file))
      return await Promise.all(fileterdFiles.map(async (file) => {
          const pathToTile = getFileOrFolderPath(`${folderName}/${file}`);
          return (await import(pathToTile)).default
        }));
    }

    /* register controller */
    const controllers: { new (): unknown; boot?: () => void | Promise<void> }[] = await loadControllers();

    /* connect the routers */

    for await (const controller of controllers) {
      if (controller.boot) {
        await controller.boot();
      }

      const instanceController = new controller();

      const prefix = Reflect.getMetadata(CONTROLLER_KEY, controller);
      const routes: Route[] = Reflect.getMetadata(ROUTES_KEY, controller);
      if (isArray(routes)) {
        const appInstance = app as unknown as Record<string, (...args: unknown[]) => unknown | Promise<unknown>>;
        routes.forEach((route) => {
          let method = route.method as string;
          if (!method) {
            method = 'get';
          }

          if (isFunction(get(appInstance, method))) {
            appInstance[method](
              prefix + route.path,
              (instanceController as Record<string, (...args: []) => void>)[`${route.action as string}`].bind(
                instanceController,
              ),
            );
          } else {
            console.log('unknown route is ===> ', route, ' for controller ===> ', instanceController);
          }
        });
      }
    }

    homeRouter(app);
    /**Options request handler */
    optionsRouter(app);

    const host = SERVER_HOST;
    const port = Number(SERVER_PORT);
    if (!port) throw new Error(`Invalid server port ${port}`);

    if (NODE_ENV === 'development') {
      await connectDataSourceFor();
    }

    app.listen(host, port, async (listenSocket) => {
      if (listenSocket) {
        console.log('Listening to port ' + port);
      } else {
        console.log('Failed to listen to port ' + port);
      }
    });
  } catch (e) {
    /* handle error during start */
    console.log('an error happened here', e);
  }
}

launch();
