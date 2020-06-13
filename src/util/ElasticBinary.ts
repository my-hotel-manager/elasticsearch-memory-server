import findCacheDir from 'find-cache-dir';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import ElasticBinaryDownloader from './ElasticBinaryDownloader';

export default class ElasticBinary {
  version: string;

  constructor(version?: string) {
    this.version = version || '7.7.2';
  }
  static async getDownloadPath(): Promise<string> {
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
    const downloadDir = await ElasticBinary.getDownloadPath();
    const binaryName = 'elasticsearch';
    const elasticsearchPath = path.resolve(
      downloadDir,
      `elasticsearch-${this.version}`,
      'bin',
      binaryName
    );

    if (await this.locationExists(elasticsearchPath)) {
      return elasticsearchPath;
    }

    const downloadHandler = new ElasticBinaryDownloader(this.version);
    const elasticArchive = await downloadHandler.download();
    await downloadHandler.extract(elasticArchive);
    // fs.unlinkSync(elasticArchive);

    if (await this.locationExists(elasticsearchPath)) {
      return elasticsearchPath;
    } else {
      throw new Error(`Cannot find binary at path ${elasticsearchPath}`);
    }
  }

  async locationExists(loc: string) {
    try {
      await promisify(fs.lstat)(loc);
      return true;
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      return false;
    }
  }
}
