import ElasticMemoryServer from 'ElasticMemoryServer';

const main = async () => {
  console.log(Date.now());
  const server = new ElasticMemoryServer();
  await server.getUri();
  console.log(server.instanceInfoSync);
};

main();
