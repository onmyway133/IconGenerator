'use strict'

const config = require('./config.json')
const fs = require('fs-extra')
const getMetadataFromPackageJSON = require('../infer')
const os = require('os')
const packager = require('..')
const path = require('path')
const pify = require('pify')
const pkgUp = require('pkg-up')
const util = require('./util')

function createInferElectronVersionTest (fixture, packageName) {
  return (opts) => {
    return (t) => {
      t.timeoutAfter(config.timeout)

      // Don't specify name or version
      delete opts.electronVersion
      opts.dir = path.join(__dirname, 'fixtures', fixture)

      pify(getMetadataFromPackageJSON)([], opts, opts.dir)
        .then((pkg) => {
          const packageJSON = require(path.join(opts.dir, 'package.json'))
          t.equal(opts.electronVersion, packageJSON.devDependencies[packageName], `The version should be inferred from installed ${packageName} version`)
          return t.end()
        }).catch(t.end)
    }
  }
}

function copyFixtureToTempDir (fixtureSubdir) {
  let tmpdir = path.join(os.tmpdir(), fixtureSubdir)
  let fixtureDir = path.join(__dirname, 'fixtures', fixtureSubdir)
  let tmpdirPkg = pkgUp.sync(path.join(tmpdir, '..'))

  if (tmpdirPkg) {
    throw new Error(`Found package.json in parent of temp directory, which will interfere with test results. Please remove package.json at ${tmpdirPkg}`)
  }

  return fs.emptyDir(tmpdir)
    .then(() => fs.copy(fixtureDir, tmpdir))
    .then(() => tmpdir)
}

function createInferFailureTest (opts, fixtureSubdir) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    copyFixtureToTempDir(fixtureSubdir)
      .then((dir) => {
        delete opts.electronVersion
        opts.dir = dir

        return packager(opts)
      }).then(
        paths => t.end('expected error'),
        err => {
          t.ok(err, 'error thrown')
          return t.end()
        }
      ).catch(t.end)
  }
}

function createInferMissingVersionTest (opts) {
  return (t) => {
    t.timeoutAfter(config.timeout)
    copyFixtureToTempDir('infer-missing-version-only')
      .then((dir) => {
        delete opts.electronVersion
        opts.dir = dir

        return pify(getMetadataFromPackageJSON)([], opts, dir)
      }).then(() => {
        const packageJSON = require(path.join(opts.dir, 'package.json'))
        t.equal(opts.electronVersion, packageJSON.devDependencies['electron'], 'The version should be inferred from installed electron module version')
        return t.end()
      }).catch(t.end)
  }
}

function testInferWin32metadata (t, opts, expected, assertionMessage) {
  t.timeoutAfter(config.timeout)
  copyFixtureToTempDir('infer-win32metadata')
    .then((dir) => {
      opts.dir = dir

      return pify(getMetadataFromPackageJSON)(['win32'], opts, dir)
    }).then(() => {
      t.deepEqual(opts.win32metadata, expected, assertionMessage)
      return t.end()
    }).catch(t.end)
}

function createInferMissingFieldsTest (opts) {
  return createInferFailureTest(opts, 'infer-missing-fields')
}

function createInferWithBadFieldsTest (opts) {
  return createInferFailureTest(opts, 'infer-bad-fields')
}

function createInferWithMalformedJSONTest (opts) {
  return createInferFailureTest(opts, 'infer-malformed-json')
}

function createInferNonSpecificElectronPrebuiltCompileFailureTest (opts) {
  return createInferFailureTest(opts, 'infer-non-specific-electron-prebuilt-compile')
}

util.testSinglePlatform('infer using `electron-prebuilt` package', createInferElectronVersionTest('basic', 'electron-prebuilt'))
util.testSinglePlatform('infer using `electron-prebuilt-compile` package', createInferElectronVersionTest('infer-electron-prebuilt-compile', 'electron-prebuilt-compile'))
util.testSinglePlatform('infer using `electron` package only', createInferMissingVersionTest)
util.testSinglePlatform('infer where `electron` version is preferred over `electron-prebuilt`', createInferElectronVersionTest('basic-renamed-to-electron', 'electron'))
util.testSinglePlatform('infer win32metadata', (opts) => {
  return (t) => {
    const expected = {CompanyName: 'Foo Bar'}

    testInferWin32metadata(t, opts, expected, 'win32metadata matches package.json values')
  }
})
util.testSinglePlatform('do not infer win32metadata if it already exists', (opts) => {
  return (t) => {
    opts.win32metadata = {CompanyName: 'Existing'}
    const expected = Object.assign({}, opts.win32metadata)

    testInferWin32metadata(t, opts, expected, 'win32metadata did not update with package.json values')
  }
})
util.testSinglePlatform('infer missing fields test', createInferMissingFieldsTest)
util.testSinglePlatform('infer with bad fields test', createInferWithBadFieldsTest)
util.testSinglePlatform('infer with malformed JSON test', createInferWithMalformedJSONTest)
util.testSinglePlatform('infer using a non-specific `electron-prebuilt-compile` package version', createInferNonSpecificElectronPrebuiltCompileFailureTest)
