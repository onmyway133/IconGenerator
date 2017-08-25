'use strict'

// Keeping this module because it handles non-buffers gracefully
const bufferEqual = require('buffer-equal')
const common = require('../common')
const config = require('./config.json')
const fs = require('fs-extra')
const os = require('os')
const packager = require('../index')
const path = require('path')
const pify = require('pify')
const targets = require('../targets')
const test = require('tape')

const ORIGINAL_CWD = process.cwd()
const WORK_CWD = path.join(__dirname, 'work')

// tape doesn't seem to have a provision for before/beforeEach/afterEach/after,
// so run setup/teardown and cleanup tasks as additional "tests" to put them in sequence
// and run them irrespective of test failures

function setup () {
  test('setup', (t) => {
    fs.mkdirp(WORK_CWD)
      .then(() => {
        process.chdir(WORK_CWD)
        return t.end()
      }).catch(t.end)
  })
}

function teardown () {
  test('teardown', (t) => {
    process.chdir(ORIGINAL_CWD)
    fs.remove(WORK_CWD).then(t.end).catch(t.end)
  })
}

exports.allPlatformArchCombosCount = 8

exports.areFilesEqual = function areFilesEqual (file1, file2) {
  let buffer1, buffer2

  return fs.readFile(file1)
    .then((data) => {
      buffer1 = data
      return fs.readFile(file2)
    }).then((data) => {
      buffer2 = data
      return bufferEqual(buffer1, buffer2)
    })
}

exports.downloadAll = function downloadAll (version) {
  console.log(`Calling electron-download for ${version} before running tests...`)
  const combinations = common.createDownloadCombos({electronVersion: config.version, all: true}, targets.officialPlatforms, targets.officialArchs, (platform, arch) => {
    // Skip testing darwin/mas target on Windows since electron-packager itself skips it
    // (see https://github.com/electron-userland/electron-packager/issues/71)
    return common.isPlatformMac(platform) && process.platform === 'win32'
  })

  return Promise.all(combinations.map(combination => {
    return pify(common.downloadElectronZip)(Object.assign({}, combination, {
      cache: path.join(os.homedir(), '.electron'),
      quiet: !!process.env.CI,
      version: version
    }))
  }))
}

exports.fixtureSubdir = function fixtureSubdir (subdir) {
  return path.join(__dirname, 'fixtures', subdir)
}

exports.generateResourcesPath = function generateResourcesPath (opts) {
  return common.isPlatformMac(opts.platform)
    ? path.join(opts.name + '.app', 'Contents', 'Resources')
    : 'resources'
}

exports.getWorkCwd = function getWorkCwd () {
  return WORK_CWD
}

exports.invalidOptionTest = function invalidOptionTest (opts) {
  return (t) => {
    return packager(opts)
      .then(
        paths => t.end('no paths returned'),
        (err) => {
          t.ok(err, 'error thrown')
          return t.end()
        }
      )
  }
}

exports.packageAndEnsureResourcesPath = function packageAndEnsureResourcesPath (t, opts) {
  let resourcesPath

  return packager(opts)
    .then(paths => {
      resourcesPath = path.join(paths[0], exports.generateResourcesPath(opts))
      return fs.stat(resourcesPath)
    }).then(stats => {
      t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
      return resourcesPath
    })
}

exports.packagerTest = function packagerTest (name, testFunction) {
  setup()
  test(name, testFunction) // eslint-disable-line tape/test-ended
  teardown()
}

// Rest parameters are added (not behind a feature flag) in Node 6
exports.testSinglePlatform = function testSinglePlatform (name, createTest /*, ...createTestArgs */) {
  var args = Array.prototype.slice.call(arguments, 2)
  exports.packagerTest(name, createTest.apply(null, [{platform: 'linux', arch: 'x64', electronVersion: config.version}].concat(args)))
}

exports.verifyPackageExistence = function verifyPackageExistence (finalPaths) {
  return Promise.all(finalPaths.map((finalPath) => {
    return fs.stat(finalPath)
      .then(
        stats => stats.isDirectory(),
        () => false
      )
  }))
}
