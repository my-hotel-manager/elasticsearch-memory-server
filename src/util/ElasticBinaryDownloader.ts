export default class ElasticBinaryDownloader {
  downloadURL: string;

  constructor(version: string) {
    this.downloadURL = '';
    this.getDownloadURL(version)
      .then((URL) => {
        this.downloadURL = URL;
      })
      .catch((err) => {
        if (err) {
          throw err;
        }
      });
  }

  async getArchiveName(version: string): Promise<string> {
    return `elasticsearch-${version}-linux-x86_64.tar.gz`;
  }

  async getDownloadURL(version: string): Promise<string> {
    const archiveName = await this.getArchiveName(version);
    return `https://artifacts.elastic.co/downloads/elasticsearch/${archiveName}`;
  }

  async download(): Promise<string> {
    return 'placeholder';
  }

  async extract(archive: string): Promise<string> {
    return 'placeholder';
  }
}
