// rollup.config.js
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default {
  input: "js/index.js",
  output: {
    file: "_site/js/index.js",
    format: "iife",
    name: "TechWeeklies"
  },
  plugins: [
    // Resolve modules for bundling using node's search algorithtm
    resolve(),
    // Allow resolving CommonJS modules
    commonjs(),
    terser()
  ]
};
