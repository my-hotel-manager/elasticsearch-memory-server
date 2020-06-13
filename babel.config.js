module.exports = function babel(api) {
  api.cache(true);
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
      '@babel/preset-typescript',
    ],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.js', '.ts'],
          root: ['./src'],
        },
      ],
    ],
  };
};
