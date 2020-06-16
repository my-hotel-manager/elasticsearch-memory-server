import ElasticMemoryServer from '../index';

it('runs', async () => {
  const server = new ElasticMemoryServer({ instance: { port: 9200 } });
  const uri = await server.getUri();
  expect(uri).toBe('http://127.0.0.1:9200');
});
