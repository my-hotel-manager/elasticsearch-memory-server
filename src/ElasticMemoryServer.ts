import ElasticInstance from './ElasticInstance';
import ElasticBinaryDownloader from 'util/ElasticBinaryDownloader';

// export interface StartupInstanceData {
//   port: number;
//   dbPath?: string;
//   ip: string;
//   uri?: string;
//   tmpDir?: tmp.DirResult;
// }

export default class ElasticMemoryServer {
  runningInstance: Promise<void> | null = null;

  constructor(binary?: string) {
    try {
      this.start();
    } catch (error) {
      if (error) throw error;
    }
  }

  async start(): Promise<void> {
    if (this.runningInstance) {
      throw new Error('Elastic instance already started');
    }

    this.runningInstance = this._startInstance();
  }

  async _startInstance(): Promise<void> {
    const instance = await ElasticInstance.run({});
    console.log(instance.childProcess);
  }
}
