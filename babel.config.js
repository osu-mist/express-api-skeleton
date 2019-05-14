const presets = [
  [
    '@babel/preset-env',
    { targets: { node: '10' } },
  ],
  '@babel/preset-flow',
];

const plugins = [
  '@babel/plugin-transform-runtime',
  [
    'module-resolver',
    {
      root: ['src', '.'],
      extensions: ['.js', '.json'],
    },
  ],
];

module.exports = (api) => {
  api.cache(true);
  return { presets, plugins };
};
