const presets = [
  [
    '@babel/preset-env',
    {
      targets: { node: 'current' },
    },
  ],
  '@babel/preset-flow',
];

const plugins = [
  '@babel/plugin-transform-runtime',
  '@babel/plugin-proposal-optional-chaining',
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
