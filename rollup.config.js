import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts', // our source file
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'auto',
    },
    {
      file: pkg.module,
      format: 'es',
    },
    {
      file: pkg.browser,
      format: 'iife',
      name: 'RError', // the global which can be used in a browser
    },
  ],
  plugins: [
    typescript(),
    terser(), // minifies generated bundles
  ],
}
