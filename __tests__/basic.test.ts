import ElasticMemoryServer from '../index';
import http from 'http';

it('runs', async () => {
  const server = new ElasticMemoryServer({ instance: { port: 3131 } });
  const uri = await server.getUri();
  http.get(uri, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      expect(JSON.parse(data)).toMatchObject({
        name: expect.any(String),
        cluster_name: expect.any(String),
        cluster_uuid: expect.any(String),
        version: expect.any(Object)
      });
    });
  }).on('error', (err) => {
    if (err) throw err;
  });
  // expect(uri).toBe('http://127.0.0.1:3131');
});
