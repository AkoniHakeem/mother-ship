import { DataSourceOptions } from 'typeorm';
import {
  DB_CONN_POOL_COUNT,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  pathFromSrc,
} from './src/lib/projectConstants';

type TypeOrmDataSourceOptions = DataSourceOptions & {
  seeds: string[];
  factories: string[];
};

const defaultDataSourceOptions: TypeOrmDataSourceOptions = {
  applicationName: 'Server',
  name: 'default',
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: false,
  logging: false,
  entities: [pathFromSrc('entities/**/*.{js,ts}')],
  migrations: [pathFromSrc('database/migrations/**/*.{js,ts}'), pathFromSrc('migration/**/*.{js,ts}')],
  seeds: [pathFromSrc('seeders/**/*.{js,ts}')],
  factories: [pathFromSrc('factories/**/*.{js,ts}')],
  subscribers: [pathFromSrc('subscriber/**/*.{js,ts}')],
  migrationsRun: false,
  migrationsTableName: 'migrations',
  useUTC: true,
  connectTimeoutMS: 50000,
  dropSchema: false,
  migrationsTransactionMode: 'all',
  metadataTableName: 'typeorm_metadata',
  maxQueryExecutionTime: 0,
  extra: {
    max: DB_CONN_POOL_COUNT,
    connectionTimeoutMillis: 50000,
    idleTimeoutMillis: 1 * 60 * 60 * 1000,
  },
  cache: {
    type: 'database',
    tableName: 'typeorm_cache_table',
  },
};

export default defaultDataSourceOptions;
