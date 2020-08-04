import ElasticMemoryServer from '../index';

import axios from 'axios';

it('opens', async () => {
  const elasticd = new ElasticMemoryServer({ instance: { port: 3131 } });
  const uri = await elasticd.getUri();

  const response = await axios.get(uri);

  expect(response.data).toMatchObject({
    name: expect.any(String),
    cluster_name: expect.any(String),
    cluster_uuid: expect.any(String),
    version: expect.any(Object),
  });

  await elasticd.stop();
});
