// rollup.config.js
import resolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
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
    // Replace calls to process.env with build-time variables
    replace({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "production"
      ),
      "process.env.GA_TRACKING_ID": JSON.stringify(
        process.env.GA_TRACKING_ID || ""
      )
    }),
    // Resolve modules for bundling using node's search algorithtm
    resolve(),
    // Allow resolving CommonJS modules
    commonjs(),
    ifProduction(terser)
  ]
};

function ifProduction(plugin) {
  return process.env.NODE_ENV === "production" ? plugin() : null;
}
