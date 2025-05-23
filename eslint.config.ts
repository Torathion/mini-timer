import shiny from 'eslint-config-shiny'

export default [
  ...(await shiny({ configs: ['node', 'format', 'vitest'] })),
  {
    rules: {
      'unicorn/no-null': 0,
      'n/no-unsupported-features/node-builtins': 0,
      'n/callback-return': 0,
      'import/export': 0
    }
  }
]
