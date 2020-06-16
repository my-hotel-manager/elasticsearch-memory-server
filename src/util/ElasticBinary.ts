import findCacheDir from 'find-cache-dir';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import ElasticBinaryDownloader from './ElasticBinaryDownloader';
import { locationExists } from './functions';

const LATEST_VERSION = '7.7.1';

export default class ElasticBinary {
  version: string;

  constructor(version?: string) {
    this.version = version || LATEST_VERSION;
  }
  static getDownloadPath(): string {
    // if we're in postinstall script, npm will set the cwd too deep
    let nodeModulesDLDir = process.cwd();
    while (
      nodeModulesDLDir.endsWith(
        `node_modules${path.sep}elasticsearch-memory-server`
      )
    ) {
      nodeModulesDLDir = path.resolve(nodeModulesDLDir, '..', '..');
    }

    const DLPath = path.resolve(
      findCacheDir({
        name: 'elasticsearch-memory-server',
        cwd: nodeModulesDLDir,
      }) || ''
    );

    return DLPath;
  }

  /**
   * Get path of already downloaded binary path. Else, download
   * and return path
   */
  async getElasticsearchPath(): Promise<string> {
    const downloadDir = ElasticBinary.getDownloadPath();
    const binaryName = 'elasticsearch';
    const elasticsearchPath = path.resolve(
      downloadDir,
      `elasticsearch-${this.version}`,
      'bin',
      binaryName
    );

    if (await locationExists(elasticsearchPath)) {
      return elasticsearchPath;
    }

    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    const downloadHandler = new ElasticBinaryDownloader(
      this.version,
      downloadDir
    );
    // TODO: Add lockfile for safety
    const elasticArchive = await downloadHandler.download();
    await downloadHandler.extract(elasticArchive);
    fs.unlinkSync(elasticArchive);

    if (await locationExists(elasticsearchPath)) {
      return elasticsearchPath;
    } else {
      throw new Error(`Cannot find binary at path ${elasticsearchPath}`);
    }
  }
}
