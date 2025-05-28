import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import url from 'rollup-plugin-url';
import replace from 'rollup-plugin-replace';
import terser from '@rollup/plugin-terser';

const env = process.env.NODE_ENV;

export default {
  input: 'src/ChatRobot.jsx',
  output: {
    file: 'dist/chat-robot.umd.js',
    format: 'umd',
    name: 'ChatRobot',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    }
  },
  external: ['react', 'react-dom'],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
      preventAssignment: true
    }),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true,
      extensions: ['.js', '.jsx']
    }),
    postcss({
      extract: true,
      modules: false
    }),
    url({
      limit: Infinity,
      include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif'],
      emitFiles: true
    }),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react']
    }),
    // terser()
  ],
};
