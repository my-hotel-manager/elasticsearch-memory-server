function isModuleExists(name) {
    try {
      return !!require.resolve(name);
    } catch (e) {
      return false;
    }
  }

const elasticBinaryModule = './src/util/ElasticBinary.ts';
if (isModuleExists(elasticBinaryModule)) {
  const MongoBinary = require(elasticBinaryModule).default;

  console.log('elasticsearch-memory-server: checking Elasticsearch binaries cache...');
  ElasticBinary.getPath({})
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
