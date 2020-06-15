import ElasticMemoryServer from 'ElasticMemoryServer';

const main = async () => {
  // const server = new ElasticMemoryServer({ instance: { port: 9200 } });
  const server = new ElasticMemoryServer();
  await server.getUri();
  console.log(server.instanceInfoSync);
};

main();
