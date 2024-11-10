import esbuild from "esbuild";

let common = {
  entryPoints: ["./src/index.ts"],
  sourcemap: "external",
};

esbuild
  .build({
    ...common,
    outdir: "lib/esm",
    format: "esm",
  })
  .then(() => console.log("esm build success."));

esbuild
  .build({
    ...common,
    outdir: "lib/cjs",
    format: "cjs",
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
    bundle: true,
  })
  .then(() => console.log("standalone build success."));

esbuild
  .build({
    ...common,
    outfile: "lib/nutjar.min.js",
    format: "iife",
    globalName: "nutjar",
    minify: true,
    bundle: true,
  })
  .then(() => console.log("minified standalone build success."));
