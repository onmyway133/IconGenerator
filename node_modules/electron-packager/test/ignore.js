'use strict'

const common = require('../common')
const config = require('./config.json')
const fs = require('fs-extra')
const ignore = require('../ignore')
const path = require('path')
const packager = require('..')
const test = require('tape')
const util = require('./util')

function createIgnoreTest (opts, ignorePattern, ignoredFile) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    opts.name = 'basicTest'
    opts.dir = util.fixtureSubdir('basic')
    if (ignorePattern) {
      opts.ignore = ignorePattern
    }

    let appPath

    packager(opts)
      .then(paths => {
        appPath = path.join(paths[0], util.generateResourcesPath(opts), 'app')
        return fs.pathExists(path.join(appPath, 'package.json'))
      }).then(exists => {
        t.true(exists, 'The expected output directory should exist and contain files')
        return fs.pathExists(path.join(appPath, ignoredFile))
      }).then(exists => {
        t.false(exists, 'Ignored file should not exist in output app directory')
        return t.end()
      }).catch(t.end)
  }
}

function createIgnoreOutDirTest (opts, distPath) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    opts.name = 'basicTest'

    var appDir = util.getWorkCwd()
    opts.dir = appDir
    // we don't use path.join here to avoid normalizing
    var outDir = opts.dir + path.sep + distPath
    opts.out = outDir

    fs.copy(util.fixtureSubdir('basic'), appDir, {
      dereference: true,
      stopOnErr: true,
      filter: file => { return path.basename(file) !== 'node_modules' }
    }).then(() => {
      // create out dir before packager (real world issue - when second run includes unignored out dir)
      return fs.mkdirp(outDir)
    }).then(() => {
      // create file to ensure that directory will be not ignored because empty
      return fs.open(path.join(outDir, 'ignoreMe'), 'w')
    }).then(fd => fs.close(fd))
      .then(() => packager(opts))
      .then(() => fs.pathExists(path.join(outDir, common.generateFinalBasename(opts), util.generateResourcesPath(opts), 'app', path.basename(outDir))))
      .then(exists => {
        t.false(exists, 'Out dir must not exist in output app directory')
        return t.end()
      }).catch(t.end)
  }
}

function createIgnoreImplicitOutDirTest (opts) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    opts.name = 'basicTest'

    var appDir = util.getWorkCwd()
    opts.dir = appDir
    var outDir = opts.dir

    var testFilename = 'ignoreMe'
    var previousPackedResultDir

    fs.copy(util.fixtureSubdir('basic'), appDir, {
      dereference: true,
      stopOnErr: true,
      filter: file => { return path.basename(file) !== 'node_modules' }
    }).then(() => {
      previousPackedResultDir = path.join(outDir, `${common.sanitizeAppName(opts.name)}-linux-ia32`)
      return fs.mkdirp(previousPackedResultDir)
    }).then(() => {
      // create file to ensure that directory will be not ignored because empty
      return fs.open(path.join(previousPackedResultDir, testFilename), 'w')
    }).then(fd => fs.close(fd))
      .then(() => packager(opts))
      .then(() => fs.pathExists(path.join(outDir, common.generateFinalBasename(opts), util.generateResourcesPath(opts), 'app', testFilename)))
      .then(exists => {
        t.false(exists, 'Out dir must not exist in output app directory')
        return t.end()
      }).catch(t.end)
  }
}

test('generateIgnores ignores the generated temporary directory only on Linux', (t) => {
  const tmpdir = '/foo/bar'
  const expected = path.join(tmpdir, 'electron-packager')
  let opts = {tmpdir}

  ignore.generateIgnores(opts)

  // Array.prototype.includes is added (not behind a feature flag) in Node 6
  if (process.platform === 'linux') {
    t.notOk(opts.ignore.indexOf(expected) === -1, 'temporary dir in opts.ignore')
  } else {
    t.ok(opts.ignore.indexOf(expected) === -1, 'temporary dir not in opts.ignore')
  }

  t.end()
})

test('generateOutIgnores ignores all possible platform/arch permutations', (t) => {
  let ignores = ignore.generateOutIgnores({name: 'test'})
  t.equal(ignores.length, util.allPlatformArchCombosCount)
  t.end()
})

util.testSinglePlatform('ignore default test: .o files', createIgnoreTest, null, 'ignore.o')
util.testSinglePlatform('ignore default test: .obj files', createIgnoreTest, null, 'ignore.obj')
util.testSinglePlatform('ignore test: string in array', createIgnoreTest, ['ignorethis'],
                        'ignorethis.txt')
util.testSinglePlatform('ignore test: string', createIgnoreTest, 'ignorethis', 'ignorethis.txt')
util.testSinglePlatform('ignore test: RegExp', createIgnoreTest, /ignorethis/, 'ignorethis.txt')
util.testSinglePlatform('ignore test: Function', createIgnoreTest,
                        file => { return file.match(/ignorethis/) }, 'ignorethis.txt')
util.testSinglePlatform('ignore test: string with slash', createIgnoreTest, 'ignore/this',
                        path.join('ignore', 'this.txt'))
util.testSinglePlatform('ignore test: only match subfolder of app', createIgnoreTest,
                        'electron-packager', path.join('electron-packager', 'readme.txt'))
util.testSinglePlatform('ignore out dir test', createIgnoreOutDirTest, 'ignoredOutDir')
util.testSinglePlatform('ignore out dir test: unnormalized path', createIgnoreOutDirTest,
                        './ignoredOutDir')
util.testSinglePlatform('ignore out dir test: unnormalized path', createIgnoreImplicitOutDirTest)
