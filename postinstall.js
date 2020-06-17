function isModuleExists(name) {
    try {
      return !!require.resolve(name);
    } catch (e) {
      return false;
    }
  }

const elasticBinaryModule = './lib/src/util/ElasticBinary';
if (isModuleExists(elasticBinaryModule)) {
  const ElasticBinary = require(elasticBinaryModule).default;
  const binaryHandler = new ElasticBinary();

  console.log('elasticsearch-memory-server: checking Elasticsearch binaries cache...');
  binaryHandler.getElasticsearchPath()
    .then((binPath) => {
      console.log(`elasticsearch-memory-server: binary path is ${binPath}`);
    })
    .catch((err) => {
      console.log(`failed to download/install Elasticsearch binaries. The error: ${err}`);
      process.exit(0);
    });
} else {
  console.log("Can't resolve ElasticBinary module");
}
