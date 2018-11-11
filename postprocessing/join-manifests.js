const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const OUPTUT_MANIFEST_PATH = "_intermediate/hash-manifest.json";
const POSTCSS_MANIFEST_PATH = "_intermediate/postcss-manifest.json";
const ROLLUP_MANIFEST_PATH = "_intermediate/rollup-manifest.json";

const SERVER_CSS_DIR = "/css";
const SERVER_JS_DIR = "/js";

/*
 * Script to join manifests from postcss-hash and rollup-plugin-hash.
 * We also normalise paths to this format:
 *  {
 *    '/css/index.css': '/css/index.abcd.css',
 *    '/js/index.js': '/js/index.jklm.js'
 *  }.
 * We do this because of the impendance mismatch between the postcss
 * and rollup hash manifests. Furthermore, it's better to have
 * the hashes refer to the absolute output paths, so that we can
 * defer to Eleventy's "url" filter at the end :)
 *
 * "One manifest to rule them all and in the darkness bind them"
 */
async function main() {
  const manifest_postcss = await readFile(
    path.resolve(POSTCSS_MANIFEST_PATH)
  ).then(JSON.parse);
  const manifest_rollup = await readFile(
    path.resolve(ROLLUP_MANIFEST_PATH)
  ).then(JSON.parse);

  // Normalise postcss-hash
  // {'basename': 'basename.abcd'} -> {'/css/basename': '/css/basename.abcd'}
  const normalised_postcss = Object.keys(manifest_postcss).reduce(
    (manifest, basename) => {
      const normalSource = path.join(SERVER_CSS_DIR, basename);
      const normalHash = path.join(SERVER_CSS_DIR, manifest_postcss[basename]);
      const newManifest = { ...manifest, [normalSource]: normalHash };
      return newManifest;
    },
    {}
  );

  // Normalise rollup-hash
  // {'_site/js/basename': '_site/js/basename.abcd'} -> {'/js/basename': '/js/basename.abcd'}
  const normalised_rollup = Object.keys(manifest_rollup).reduce(
    (manifest, fullname) => {
      const normalSource = path.join(SERVER_JS_DIR, path.basename(fullname));
      const normalHash = path.join(
        SERVER_JS_DIR,
        path.basename(manifest_rollup[fullname])
      );
      const newManifest = { ...manifest, [normalSource]: normalHash };
      return newManifest;
    },
    {}
  );

  const joined = { ...normalised_postcss, ...normalised_rollup };

  return await writeFile(
    path.join(OUPTUT_MANIFEST_PATH),
    JSON.stringify(joined, null, 2)
  );
}

main();
