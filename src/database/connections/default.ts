import { DataSource } from 'typeorm';
import defaultConnectionOptions from '../../../ormconfig';
import { Pool } from 'pg';
import { get, set } from 'lodash';
import { isMainThread } from 'worker_threads';

const dataSourceConfig = defaultConnectionOptions;
if (!isMainThread) {
  set(dataSourceConfig, 'extra.max', 1);
}

const dataSource = new DataSource(dataSourceConfig);

let pool: Pool | undefined = undefined;
export const getPool = () => pool;

dataSource
  .initialize()
  .then(() => {
    pool = get(dataSource.driver,'master') as unknown as Pool;
  })
  .catch((err) => {
    console.error('Error during Default Data Source initialization', err);
  });

export default dataSource;
