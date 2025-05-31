import { defineConfig } from "tsup";

const sourcemap = process.env.NODE_ENV === "development";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs"],
    outDir: "lib/cjs",
    dts: false,
    clean: true,
    splitting: false,
    minify: !sourcemap,
    sourcemap: sourcemap,
    target: "esnext",
  },
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    outDir: "lib/esm",
    dts: false,
    splitting: false,
    minify: !sourcemap,
    sourcemap: sourcemap,
    target: "esnext",
  },
  {
    entry: ["src/hl7.ts"],
    format: ["cjs"],
    outDir: "lib/cjs",
    dts: false,
    clean: false,
    splitting: false,
    minify: !sourcemap,
    sourcemap: sourcemap,
    target: "esnext",
  },
  {
    entry: ["src/hl7.ts"],
    format: ["esm"],
    outDir: "lib/esm",
    dts: false,
    splitting: false,
    minify: !sourcemap,
    sourcemap: sourcemap,
    target: "esnext",
  },
  {
    entry: ["src/index.ts"],
    outDir: "lib/types",
    dts: {
      only: true,
    },
  },
  {
    entry: ["src/hl7.ts"],
    outDir: "lib/types",
    dts: {
      only: true,
    },
  },
]);
