import Bree from 'bree';
import Graceful from '@ladjs/graceful';
import { getLoggerFor, Logger } from '../logger/logger';

export class BreeExtended extends Bree {
  constructor(breeConfig?: Bree.BreeOptions) {
    super(breeConfig);
  }

  override start = async (names?: string | string[]) => {
    await this.stop(names);

    if (Array.isArray(names)) {
      for await (const name of names) {
        await this.start(name);
      }
    } else {
      await super.start(names);
      Logger.info(`Started bree job named ${names}`);
    }
  };

  override run = async (name?: string) => {
    if (name && this.workers.has(name)) {
      Logger.info(`Job named ${name} is still running...`);
      return;
    }

    super.run(name);
  };

  override stop = async (names?: string | string[]) => {
    if (Array.isArray(names)) {
      for await (const name of names) {
        await this.stop(name);
      }
    } else {
      await super.stop(names);
      Logger.info(`Stopped bree job named ${names}`);
    }
  };

  static bree: BreeExtended | undefined;
  static graceful: Graceful | undefined;

  static getBree() {
    if (!BreeExtended.bree) {
      const logger = getLoggerFor('logs/workers.log');

      BreeExtended.bree = new BreeExtended({ root: false, logger });
      const graceful = new Graceful({ brees: [BreeExtended.bree], logger });
      graceful.listen();
    }

    return BreeExtended.bree;
  }
}
