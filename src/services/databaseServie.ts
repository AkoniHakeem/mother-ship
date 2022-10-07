import { EntityManager, DataSource, QueryRunner, EntityTarget, SelectQueryBuilder } from 'typeorm';
import { REDIS_HOST, REDIS_PASSWORD } from '../lib/projectConstants';
import IORedis, { Redis } from 'ioredis';
import * as defaultConnection from '../database/connections/default';
import { capitalize } from 'lodash';

export const dataSourceFor = (connectionName = 'default'): DataSource => {
  try {
    const res = require(`../database/connections/${connectionName}`);

    const connDataSource = (res.default || res) as DataSource;
    if (connDataSource) {
      if (!connDataSource.isInitialized) {
        connDataSource.initialize();
        return connDataSource;
      }

      return connDataSource;
    }

    return defaultConnection.default;
  } catch (err) {
    return defaultConnection.default;
  }
};

export const db = (connectionName = 'default'): EntityManager => {
  const connDataSource = dataSourceFor(connectionName);
  if (connDataSource) {
    return connDataSource.manager;
  }

  return defaultConnection.default.manager;
};

export const connectDataSourceFor = async (connectionName = 'default'): Promise<DataSource | undefined> => {
  try {
    const res = require(`../database/connections/${connectionName}`);

    const connDataSource = (res.default || res) as DataSource;
    if (connDataSource) {
      if (!connDataSource.isInitialized) {
        await connDataSource.initialize();

        console.log(`${capitalize(connectionName)} Data Source Connected Succesfully`);
        return connDataSource;
      }

      console.log(`${capitalize(connectionName)} Data Source Was Already Connected`);
      return connDataSource;
    }

    throw `Could not connect to data source named ${connectionName}`;
  } catch (err) {
    console.error(`Error during ${capitalize(connectionName)} Data Source initialization`, err);
    throw `Could not connect to data source named ${connectionName}`;
  }
};

type QueryBuilderOverload = {
  <Entity>(queryRunner?: QueryRunner): SelectQueryBuilder<Entity>;
  <Entity>(entityClass: EntityTarget<Entity>, alias: string, queryRunner?: QueryRunner): SelectQueryBuilder<
    EntityTarget<Entity>
  >;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function qb<T>(queryRunner?: QueryRunner): SelectQueryBuilder<T>;
function qb<Entity>(
  entityClass: EntityTarget<Entity>,
  alias: string,
  queryRunner?: QueryRunner,
): SelectQueryBuilder<Entity>;
function qb<T>(...args: Parameters<QueryBuilderOverload>) {
  if (args.length > 1) {
    return db().createQueryBuilder(...args) as SelectQueryBuilder<typeof args[0]>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db().createQueryBuilder(...args) as SelectQueryBuilder<T>;
}

export const queryBuilder = qb;

// export const redis = new IORedis(process.env.REDIS_ENDPOINT, { password: REDIS_PASSWORD });

let redis: Redis | undefined = undefined;

export const getRedisConnection = (): Redis | undefined => {
  if (redis) return redis;

  if (REDIS_HOST && REDIS_PASSWORD) {
    redis = new IORedis(REDIS_HOST, { password: REDIS_PASSWORD });
    return redis;
  }

  return undefined;
};
