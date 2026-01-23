// tsdown.config.ts
import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,                  // generate .d.ts (highly recommended for libs)
    minify: true,
    platform: 'node',
    target: 'es2022',
    clean: true,                // clean dist/ before build
    outDir: 'dist',
    dts: false,
    outputOptions: {
      exports: 'named',
    }
  }
])
