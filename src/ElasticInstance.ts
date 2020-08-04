import tmp from 'tmp';
import { ChildProcess, SpawnOptions } from 'child_process';
import spawnChild from 'cross-spawn';
import ElasticBinary from './util/ElasticBinary';
import path from 'path';

export interface ElasticInstanceOpts {
  port?: number;
  ip?: string;
  dbPath?: string;
  tmpDir?: tmp.DirResult;
  args?: string[];
  binary?: string;
}

export default class ElasticInstance {
  static childProcessList: ChildProcess[] = [];
  opts: ElasticInstanceOpts;
  childProcess: ChildProcess | null;
  killerProcess: ChildProcess | null;
  isInstanceReady: boolean = false;
  instanceReady: () => void = () => {};
  instanceFailed: (err: any) => void = () => {};

  constructor(opts: ElasticInstanceOpts) {
    this.opts = opts;
    this.childProcess = null;
    this.killerProcess = null;
  }

  static async run(opts: ElasticInstanceOpts): Promise<any> {
    const instance = new this(opts);
    return await instance.run();
  }

  async run(): Promise<this> {
    const launch = new Promise((resolve, reject) => {
      this.instanceReady = () => {
        this.isInstanceReady = true;
        resolve({ ...this.childProcess });
      };
      this.instanceFailed = (err: any) => {
        if (this.killerProcess) this.killerProcess.kill();
        reject(err);
      };
    });

    const binaryHandler = new ElasticBinary();
    const elasticBin = await binaryHandler.getElasticsearchPath();
    this.childProcess = this._launchElasticsearch(elasticBin);
    // this.killerProcess = this._launchKiller(process.pid, this.childProcess.pid);

    await launch;
    return this;
  }

  async kill(): Promise<ElasticInstance> {
    if (this.childProcess && !this.childProcess.killed) {
      await new Promise((resolve) => {
        if (this.childProcess) {
          this.childProcess.once(`exit`, () => {
            resolve();
          });
          this.childProcess.kill();
        }
      });
    } else {
    }
    if (this.killerProcess && !this.killerProcess.killed) {
      await new Promise((resolve) => {
        if (this.killerProcess) {
          this.killerProcess.once(`exit`, () => {
            resolve();
          });
          this.killerProcess.kill();
        }
      });
    } else {
    }
    return this;
  }

  parseCmdArgs(): string[] {
    const { port, ip, dbPath, args } = this.opts;
    const result: Array<string[]> = [];

    if (ip) result.push(['-E', `network.host=${ip}`]);
    if (port) result.push(['-E', `http.port=${port}`]);
    if (dbPath) {
      result.push(['-E', `path.data=${path.resolve(dbPath, 'path')}`]);
      result.push(['-E', `path.logs=${path.resolve(dbPath, 'logs')}`]);
    }
    if (args) result.concat(args);
    return result.flat();
  }

  /**
   * Actually launch elasticsearch
   * @param elasticBin The binary to run
   */
  _launchElasticsearch(elasticBin: string): ChildProcess {
    const spawnOpts: SpawnOptions = {
      stdio: 'pipe',
    };

    const childProcess = spawnChild(elasticBin, this.parseCmdArgs());

    if (childProcess.stderr) {
      childProcess.stderr.on('data', this.stderrHandler.bind(this));
    }
    if (childProcess.stdout) {
      childProcess.stdout.on('data', this.stdoutHandler.bind(this));
    }
    childProcess.on('close', this.closeHandler.bind(this));
    childProcess.on('error', this.errorHandler.bind(this));

    return childProcess;
  }

  errorHandler(err: string): void {
    this.instanceFailed(err);
  }

  /**
   * Write the CLOSE event to the debug function
   * @param code The Exit code
   */
  closeHandler(code: number): void {
    // this.debug(`CLOSE: ${code}`);
  }

  /**
   * Write STDERR to debug function
   * @param message The STDERR line to write
   */
  stderrHandler(message: string | Buffer): void {
    // this.debug(`STDERR: ${message.toString()}`);
  }

  stdoutHandler(message: string | Buffer): void {
    const line: string = message.toString();

    if (/started/i.test(line)) {
      this.instanceReady();
    }
  }
}
