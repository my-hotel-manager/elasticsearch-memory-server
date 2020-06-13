import fs from 'fs';
import url from 'url';
import https from 'https';
import path from 'path';
import dedent from 'dedent';
import { promisify } from 'util';
// import { HttpsProxyAgent } from 'https-proxy-agent';

interface HttpDownloadOptions {
  hostname: string;
  port: string;
  path: string;
  method: 'GET' | 'POST';
  rejectUnauthorized?: boolean;
  agent: undefined;
}

interface DownloadProgressT {
  current: number;
  length: number;
  totalMb: number;
  lastPrintedAt: number;
}

export default class ElasticBinaryDownloader {
  downloadUrl: string;
  downloadDir: string;
  version: string;
  _downloadingUrl?: string;
  dlProgress: DownloadProgressT;

  constructor(version: string, downloadDir: string) {
    this.downloadUrl = this.getDownloadUrl(version);
    this.downloadDir = downloadDir;
    this.version = version;
    this.dlProgress = {
      current: 0,
      length: 0,
      totalMb: 0,
      lastPrintedAt: 0,
    };
  }

  getArchiveName(version: string): string {
    return `elasticsearch-${version}-linux-x86_64.tar.gz`;
  }

  getDownloadUrl(version: string): string {
    const archiveName = this.getArchiveName(version);
    return `https://artifacts.elastic.co/downloads/elasticsearch/${archiveName}`;
  }

  async httpDownload(
    httpOptions: HttpDownloadOptions,
    downloadLocation: string,
    tempDownloadLocation: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(tempDownloadLocation);

      https
        .get(httpOptions, (response) => {
          if (response.statusCode != 200) {
            reject(
              new Error(
                `Status Code is ${response.statusCode}\n${JSON.stringify(
                  httpOptions
                )}`
              )
            );
            return;
          }
          if (typeof response.headers['content-length'] != 'string') {
            reject(new Error('Response header "content-length" is empty!'));
            return;
          }
          this.dlProgress.current = 0;
          this.dlProgress.length = parseInt(
            response.headers['content-length'],
            10
          );
          this.dlProgress.totalMb =
            Math.round((this.dlProgress.length / 1048576) * 10) / 10;

          response.pipe(fileStream);

          fileStream.on('finish', async () => {
            if (
              this.dlProgress.current < this.dlProgress.length &&
              !httpOptions.path.endsWith('.md5')
            ) {
              const downloadUrl =
                this._downloadingUrl ||
                `https://${httpOptions.hostname}/${httpOptions.path}`;
              reject(
                new Error(
                  `Too small (${this.dlProgress.current} bytes) elasticsearch binary downloaded from ${downloadUrl}`
                )
              );
              return;
            }

            fileStream.close();
            await promisify(fs.rename)(tempDownloadLocation, downloadLocation);

            resolve(downloadLocation);
          });

          response.on('data', (chunk: any) => {
            this.printDownloadProgress(chunk);
          });
        })
        .on('error', (e: Error) => {
          // log it without having debug enabled
          console.error(`Couldnt download ${httpOptions.path}!`, e.message);
          reject(e);
        });
    });
  }

  printDownloadProgress(chunk: any): void {
    this.dlProgress.current += chunk.length;

    const now = Date.now();
    if (now - this.dlProgress.lastPrintedAt < 2000) return;
    this.dlProgress.lastPrintedAt = now;

    const percentComplete =
      Math.round(
        ((100.0 * this.dlProgress.current) / this.dlProgress.length) * 10
      ) / 10;
    const mbComplete =
      Math.round((this.dlProgress.current / 1048576) * 10) / 10;

    const crReturn = '\r';
    process.stdout.write(
      `Downloading Elasticsearch ${this.version}: ${percentComplete} % (${mbComplete}mb / ${this.dlProgress.totalMb}mb)${crReturn}`
    );
  }

  async download(): Promise<string> {
    const strictSsl = process.env.npm_config_strict_ssl === 'true';

    const urlObject = url.parse(this.downloadUrl);

    if (!urlObject.hostname || !urlObject.path) {
      throw new Error(`Provided incorrect download url: ${this.downloadUrl}`);
    }

    const downloadOptions: HttpDownloadOptions = {
      hostname: urlObject.hostname,
      port: urlObject.port || '443',
      path: urlObject.path,
      method: 'GET',
      rejectUnauthorized: strictSsl,
      agent: undefined,
    };

    const filename = (urlObject.pathname || '').split('/').pop();
    if (!filename) {
      throw new Error(
        `ElasticBinaryDownload: missing filename for url ${this.downloadUrl}`
      );
    }

    const downloadLocation = path.resolve(this.downloadDir, filename);
    const tempDownloadLocation = path.resolve(
      this.downloadDir,
      `${filename}.downloading`
    );
    // log(`Downloading: "${downloadUrl}"`);
    const downloadedFile = await this.httpDownload(
      downloadOptions,
      downloadLocation,
      tempDownloadLocation
    );
    return downloadedFile;
  }

  async extract(archive: string): Promise<string> {
    return 'placeholder';
  }
}
