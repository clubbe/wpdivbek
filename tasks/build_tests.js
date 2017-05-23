const gulp = require('gulp');
const jetpack = require('fs-jetpack');
const bundle = require('./bundle');
const istanbul = require('rollup-plugin-istanbul');

// Spec files are scattered through the whole project. Here we're searching
// for them and generate one entry file which will run all the tests.
const generateEntryFile = (dir, destFileName, filePattern) => {
  const fileBanner = '// This file is generated automatically.\n'
  + '// All modifications will be lost.\n';

  return dir.findAsync('.', { matching: filePattern })
  .then((specPaths) => {
    const fileContent = specPaths.map((path) => {
      return `import './${path.replace(/\\/g, '/')}';`;
    }).join('\n');
    return dir.writeAsync(destFileName, fileBanner + fileContent);
  })
  .then(() => {
    return dir.path(destFileName);
  });
};

gulp.task('build-unit', ['environment'], () => {
  const srcDir = jetpack.cwd('src');
  const destDir = jetpack.cwd('app');

  return generateEntryFile(srcDir, 'specs.js.autogenerated', '*.spec.js')
  .then((entryFilePath) => {
    return bundle(entryFilePath, destDir.path('specs.js.autogenerated'), {
      rollupPlugins: [
        istanbul({
          exclude: ['**/*.spec.js', '**/specs.js.autogenerated'],
          sourceMap: true,
        }),
      ],
    });
  });
});

gulp.task('build-e2e', ['build'], () => {
  const srcDir = jetpack.cwd('e2e');
  const destDir = jetpack.cwd('app');

  return generateEntryFile(srcDir, 'e2e.js.autogenerated', '*.e2e.js')
  .then((entryFilePath) => {
    return bundle(entryFilePath, destDir.path('e2e.js.autogenerated'));
  });
});
