import ElasticInstance, { ElasticInstanceOpts } from './ElasticInstance';
import tmp from 'tmp';
import ElasticBinaryDownloader from 'util/ElasticBinaryDownloader';
import { ChildProcess } from 'child_process';
import getPort from 'get-port';
import { getPriority } from 'os';

export interface ElasticServerOpts {
  instance?: ElasticInstanceOpts;
}

export interface ElasticInstanceInfo extends ElasticInstanceOpts {
  dbPath: string | undefined;
  uri: string;
  instance: ElasticInstance;
  childProcess?: ChildProcess;
}

export default class ElasticMemoryServer {
  runningInstance: Promise<ElasticInstanceInfo> | null = null;
  instanceInfoSync: ElasticInstanceInfo | null = null;
  opts: ElasticServerOpts;

  constructor(opts?: ElasticServerOpts) {
    this.opts = { ...opts };
    this.start();
  }

  async start(): Promise<boolean> {
    if (this.runningInstance) {
      throw new Error('Elastic instance already started');
    }

    this.runningInstance = this._startInstance();
    return this.runningInstance.then((data) => {
      this.instanceInfoSync = data;
      return true;
    });
  }

  async ensureInstance(): Promise<ElasticInstanceInfo> {
    if (this.runningInstance) {
      return this.runningInstance;
    } else {
      await this.start();
      if (!this.runningInstance) {
        throw new Error('ensureInstance failed to start instance');
      }
      return this.runningInstance;
    }
  }

  async getUri(): Promise<string> {
    const { uri }: ElasticInstanceInfo = await this.ensureInstance();
    return uri;
  }

  async _startInstance(): Promise<ElasticInstanceInfo> {
    const instOpts = this.opts.instance ?? {};
    const data: ElasticInstanceOpts = {
      port: await getPort({ port: instOpts.port } ?? undefined),
      ip: instOpts.ip ?? '127.0.0.1',
      dbPath: instOpts.dbPath,
      tmpDir: undefined,
    };

    if (!data.dbPath) {
      data.tmpDir = tmp.dirSync({
        mode: 0o755,
        prefix: 'elastic-mem-',
        unsafeCleanup: true,
      });
      data.dbPath = data.tmpDir.name;
    }

    const instance = await ElasticInstance.run({
      port: data.port,
      ip: data.ip,
      dbPath: data.dbPath,
    });

    const instanceInfo: ElasticInstanceInfo = {
      dbPath: data.dbPath,
      uri: `http://${data.ip}:${data.port}`,
      instance,
    };
    return instanceInfo;
  }
}
