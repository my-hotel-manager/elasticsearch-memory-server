import ElasticBinary from 'util/ElasticBinary';

const bin = new ElasticBinary();
bin.getElasticsearchPath().then((dir) => {
  console.log(dir);
});
