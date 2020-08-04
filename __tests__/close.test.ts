import ElasticMemoryServer from '../index';

import axios from 'axios';

it('closes', async () => {
  const elasticd = new ElasticMemoryServer();
  const uri = await elasticd.getUri();

  await elasticd.stop();

  try {
    await axios.get(uri);
  } catch (err) {
    expect(err.errno).toBe('ECONNREFUSED');
  }
});
