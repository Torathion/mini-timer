// tsdown.config.ts
import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    minify: true,
    platform: 'node',
    target: 'es2022',
    clean: true,
    outDir: 'dist',
    dts: false,
    outputOptions: {
      exports: 'named'
    }
  }
])
