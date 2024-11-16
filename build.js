import esbuild from 'esbuild';
import { readFile } from 'fs/promises';

// Dynamically load package.json to get dependencies
const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url)));
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const sharedOptions = {
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  external,
};

await esbuild.build({
  ...sharedOptions,
  outfile: 'dist/index.cjs',
  format: 'cjs',
}).catch(() => process.exit(1));

await esbuild.build({
  ...sharedOptions,
  outfile: 'dist/index.js',
  format: 'esm',
}).catch(() => process.exit(1));
