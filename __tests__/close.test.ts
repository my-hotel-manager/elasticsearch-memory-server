import ElasticMemoryServer from '../index';

import axios from 'axios';

it('closes', async () => {
  const elasticServer = new ElasticMemoryServer();
  const uri = await elasticServer.getUri();

  await elasticServer.stop();

  try {
    await axios.get(uri);
  } catch (err) {
    expect(err.errno).toBe('ECONNREFUSED');
  }
});
