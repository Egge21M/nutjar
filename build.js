import esbuild from "esbuild";

let common = {
  entryPoints: ["./src/index.ts"],
  sourcemap: "external",
  bundle: true,
};

esbuild
  .build({
    ...common,
    outdir: "lib/esm",
    format: "esm",
    packages: "external",
  })
  .then(() => console.log("esm build success."));

esbuild
  .build({
    ...common,
    outdir: "lib/cjs",
    format: "cjs",
    packages: "external",
  })
  .then(() => {
    console.log("cjs build success.");
  });

esbuild
  .build({
    ...common,
    outfile: "lib/nutjar.js",
    format: "iife",
    globalName: "nutjar",
    minify: false,
  })
  .then(() => console.log("standalone build success."));

esbuild
  .build({
    ...common,
    outfile: "lib/nutjar.min.js",
    format: "iife",
    globalName: "nutjar",
    minify: true,
  })
  .then(() => console.log("minified standalone build success."));
