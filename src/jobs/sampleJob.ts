import { parentPort, isMainThread, workerData } from 'worker_threads';
import { db } from '../services/databaseServie';

// see here to for example on how to see functionalitites use cases for executing jobs with worker thread
if (!isMainThread) {
  console.log('Worker thread started');

  const done = () => {
    if (parentPort) {
      parentPort.postMessage('done');
    }
    process.exit(0);
  };

  (async () => {
    let databaseInitializationState = db().connection.isInitialized;
    console.log('database initialization state: ', databaseInitializationState);
    while (!databaseInitializationState) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('database initialization state: ', databaseInitializationState);
      databaseInitializationState = db().connection.isInitialized;
      if (db().connection.isInitialized) {
        try {
          console.log('database connected');

          console.log('doing something in worker');
          done();
        } catch (error) {
          console.log('error from worker', error);
          done();
        }
      }
    }
  })();

  const workerjobData = workerData as { time: string };
  console.log('worker received data at: ', workerjobData.time);
  console.log('worker can access env data :', process.env.JWT_SECRET);
  console.log('==============');

  done();
}
