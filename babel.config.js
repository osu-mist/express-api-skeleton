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
    'istanbul',
    {
      exclude: ['dist/**/*.js', '**/tests/', '**/contrib/'],
    },
  ],
  [
    'module-resolver',
    {
      root: 'src',
      extensions: ['.js', '.json'],
      alias: {
        'package.json': './package.json',
        db: './db',
      },
      transformFunctions: [
        'require',
        'require.resolve',
        'System.import',
        'proxyquire',
      ],
    },
  ],
];

module.exports = (api) => {
  api.cache(true);
  return { presets, plugins };
};
