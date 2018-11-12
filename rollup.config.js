// rollup.config.js
import resolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import hash from "rollup-plugin-hash";
import { terser } from "rollup-plugin-terser";

const INPUT_FILE = "src/js/index.js";
const OUTPUT_FILE = "_site/js/index.js";

export default {
  input: INPUT_FILE,
  output: {
    file: OUTPUT_FILE,
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
    ifProduction(terser),
    ifProduction(() =>
      hash({
        dest: "_site/js/index.[hash:10].js",
        replace: true,
        manifest: "_intermediate/rollup-manifest.json"
      })
    )
  ]
};

function ifProduction(plugin) {
  return process.env.NODE_ENV === "production" ? plugin() : null;
}
