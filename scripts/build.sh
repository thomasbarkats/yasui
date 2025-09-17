#!/bin/bash
set -e
DIST="lib"

# Clean previous build
rm -rf $DIST

# Build types with comments
tsc --emitDeclarationOnly --declaration true --declarationDir $DIST

# Bundle types
rollup $DIST/index.d.ts --file $DIST/index.bundle.d.ts --format es --plugin rollup-plugin-dts

# Remove intermediate .d.ts and rename bundle
find $DIST -type f -name '*.d.ts' ! -name 'index.bundle.d.ts' -delete
mv $DIST/index.bundle.d.ts $DIST/index.d.ts

# Build final JS, remove comments, keep types untouched
tsc --removeComments true --declaration false --outDir $DIST

echo "Build complete!"
