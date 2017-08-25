'use strict'

const common = require('../common')
const config = require('./config.json')
const fs = require('fs-extra')
const packager = require('..')
const path = require('path')
const test = require('tape')
const util = require('./util')

// Generates a path to the generated app that reflects the name given in the options.
// Returns the Helper.app location on darwin since the top-level .app is already tested for the
// resources path; on other OSes, returns the executable.
function generateNamePath (opts) {
  if (common.isPlatformMac(opts.platform)) {
    return path.join(`${opts.name}.app`, 'Contents', 'Frameworks', `${opts.name} Helper.app`)
  }

  return opts.name + (opts.platform === 'win32' ? '.exe' : '')
}

function createDefaultsTest (opts) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    opts.name = 'defaultsTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    delete opts.platform
    delete opts.arch

    let defaultOpts = {
      arch: process.arch,
      name: opts.name,
      platform: process.platform
    }

    var finalPath
    var resourcesPath

    packager(opts)
      .then(paths => {
        t.true(Array.isArray(paths), 'packager call should resolve to an array')
        t.equal(paths.length, 1, 'Single-target run should resolve to a 1-item array')

        finalPath = paths[0]
        t.equal(finalPath, path.join(util.getWorkCwd(), common.generateFinalBasename(defaultOpts)),
                'Path should follow the expected format and be in the cwd')
        return fs.stat(finalPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        resourcesPath = path.join(finalPath, util.generateResourcesPath(defaultOpts))
        return fs.stat(path.join(finalPath, generateNamePath(defaultOpts)))
      }).then(stats => {
        if (common.isPlatformMac(defaultOpts.platform)) {
          t.true(stats.isDirectory(), 'The Helper.app should reflect opts.name')
        } else {
          t.true(stats.isFile(), 'The executable should reflect opts.name')
        }
        return fs.stat(resourcesPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        return fs.pathExists(path.join(resourcesPath, 'app', 'node_modules', 'run-waterfall'))
      }).then(exists => {
        t.false(exists, 'The output directory should NOT contain devDependencies by default (prune=true)')
        return util.areFilesEqual(path.join(opts.dir, 'main.js'), path.join(resourcesPath, 'app', 'main.js'))
      }).then(equal => {
        t.true(equal, 'File under packaged app directory should match source file')
        return util.areFilesEqual(path.join(opts.dir, 'ignore', 'this.txt'),
                                  path.join(resourcesPath, 'app', 'ignore', 'this.txt'))
      }).then(equal => {
        t.true(equal, 'File under subdirectory of packaged app directory should match source file and not be ignored by default')
        return fs.pathExists(path.join(resourcesPath, 'default_app'))
      }).then(exists => {
        t.false(exists, 'The output directory should not contain the Electron default app directory')
        return fs.pathExists(path.join(resourcesPath, 'default_app.asar'))
      }).then(exists => {
        t.false(exists, 'The output directory should not contain the Electron default app asar file')
        return t.end()
      }).catch(t.end)
  }
}

function createOutTest (opts) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    opts.name = 'outTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.out = 'dist'

    var finalPath

    packager(opts)
      .then(paths => {
        finalPath = paths[0]
        t.equal(finalPath, path.join('dist', common.generateFinalBasename(opts)),
                'Path should follow the expected format and be under the folder specified in `out`')
        return fs.stat(finalPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        return fs.stat(path.join(finalPath, util.generateResourcesPath(opts)))
      }).then(stats => {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        return t.end()
      }).catch(t.end)
  }
}

function createOverwriteTest (opts) {
  return (t) => {
    t.timeoutAfter(config.timeout * 2) // Multiplied since this test packages the application twice

    opts.name = 'overwriteTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')

    var finalPath
    var testPath

    packager(opts)
      .then(paths => {
        finalPath = paths[0]
        return fs.stat(finalPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        // Create a dummy file to detect whether the output directory is replaced in subsequent runs
        testPath = path.join(finalPath, 'test.txt')
        return fs.writeFile(testPath, 'test')
      }).then(() => packager(opts)) // Run again, defaulting to overwrite false
      .then(paths => fs.stat(testPath))
      .then(stats => {
        t.true(stats.isFile(), 'The existing output directory should exist as before (skipped by default)')
        // Run a third time, explicitly setting overwrite to true
        opts.overwrite = true
        return packager(opts)
      }).then(paths => fs.pathExists(testPath))
      .then(exists => {
        t.false(exists, 'The output directory should be regenerated when overwrite is true')
        return t.end()
      }).catch(t.end)
  }
}

function createTmpdirTest (opts) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    opts.name = 'tmpdirTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.out = 'dist'
    opts.tmpdir = path.join(util.getWorkCwd(), 'tmp')

    packager(opts)
      .then(paths => fs.stat(path.join(opts.tmpdir, 'electron-packager')))
      .then(stats => {
        t.true(stats.isDirectory(), 'The expected temp directory should exist')
        return t.end()
      }).catch(t.end)
  }
}

function createDisableTmpdirUsingTest (opts) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    opts.name = 'disableTmpdirTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.out = 'dist'
    opts.tmpdir = false

    packager(opts)
      .then(paths => fs.stat(paths[0]))
      .then(stats => {
        t.true(stats.isDirectory(), 'The expected out directory should exist')
        return t.end()
      }).catch(t.end)
  }
}

function createDisableSymlinkDereferencingTest (opts) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    opts.name = 'disableSymlinkDerefTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.out = 'dist'
    opts.derefSymlinks = false
    opts.asar = false

    const dest = path.join(opts.dir, 'main-link.js')

    const src = path.join(opts.dir, 'main.js')
    fs.ensureSymlink(src, dest)
      .then(() => packager(opts))
      .then(paths => {
        const destLink = path.join(paths[0], 'resources', 'app', 'main-link.js')
        return fs.lstat(destLink)
      }).then(stats => {
        t.true(stats.isSymbolicLink(), 'The expected file should still be a symlink.')
        return fs.remove(dest)
      }).then(t.end).catch(t.end)
  }
}

function createExtraResourceStringTest (platform) {
  return (opts) => {
    return (t) => {
      t.timeoutAfter(config.timeout)

      const extra1Base = 'data1.txt'
      const extra1Path = path.join(__dirname, 'fixtures', extra1Base)

      opts.name = 'extraResourceStringTest'
      opts.dir = path.join(__dirname, 'fixtures', 'basic')
      opts.out = 'dist'
      opts.platform = platform
      opts.extraResource = extra1Path

      util.packageAndEnsureResourcesPath(t, opts)
        .then(resourcesPath => util.areFilesEqual(extra1Path, path.join(resourcesPath, extra1Base)))
        .then(equal => {
          t.true(equal, 'resource file data1.txt should match')
          return t.end()
        }).catch(t.end)
    }
  }
}

function createExtraResourceArrayTest (platform) {
  return (opts) => {
    return (t) => {
      t.timeoutAfter(config.timeout)

      const extra1Base = 'data1.txt'
      const extra1Path = path.join(__dirname, 'fixtures', extra1Base)
      const extra2Base = 'extrainfo.plist'
      const extra2Path = path.join(__dirname, 'fixtures', extra2Base)

      opts.name = 'extraResourceArrayTest'
      opts.dir = path.join(__dirname, 'fixtures', 'basic')
      opts.out = 'dist'
      opts.platform = platform
      opts.extraResource = [extra1Path, extra2Path]

      let extra1DistPath
      let extra2DistPath

      util.packageAndEnsureResourcesPath(t, opts)
        .then(resourcesPath => {
          extra1DistPath = path.join(resourcesPath, extra1Base)
          extra2DistPath = path.join(resourcesPath, extra2Base)
          return fs.pathExists(extra1DistPath)
        }).then(exists => {
          t.true(exists, 'resource file data1.txt exists')
          return util.areFilesEqual(extra1Path, extra1DistPath)
        }).then(equal => {
          t.true(equal, 'resource file data1.txt should match')
          return fs.pathExists(extra2DistPath)
        }).then(exists => {
          t.true(exists, 'resource file extrainfo.plist exists')
          return util.areFilesEqual(extra2Path, extra2DistPath)
        }).then(equal => {
          t.true(equal, 'resource file extrainfo.plist should match')
          return t.end()
        }).catch(t.end)
    }
  }
}

test('setting the quiet option does not print messages', (t) => {
  const errorLog = console.error
  const warningLog = console.warn
  let output = ''
  console.error = (message) => { output += message }
  console.warn = (message) => { output += message }

  common.warning('warning', true)
  t.equal('', output, 'quieted common.warning should not call console.warn')
  common.info('info', true)
  t.equal('', output, 'quieted common.info should not call console.error')

  console.error = errorLog
  console.warn = warningLog
  t.end()
})

test('download argument test: download.{arch,platform,version} does not overwrite {arch,platform,version}', function (t) {
  var opts = {
    download: {
      arch: 'ia32',
      platform: 'win32',
      version: '0.30.0'
    },
    electronVersion: '0.36.0'
  }

  var downloadOpts = common.createDownloadOpts(opts, 'linux', 'x64')
  t.same(downloadOpts, {arch: 'x64', platform: 'linux', version: '0.36.0'})
  t.end()
})

test('sanitize app name for use in file/directory names', (t) => {
  t.equal('@username-package', common.sanitizeAppName('@username/package'), 'slash should be replaced')
  t.end()
})

test('sanitize app name for use in the out directory name', (t) => {
  let opts = {
    arch: 'x64',
    name: '@username/package-name',
    platform: 'linux'
  }
  t.equal('@username-package-name-linux-x64', common.generateFinalBasename(opts), 'generateFinalBasename output should be sanitized')
  t.end()
})

test('cannot build apps where the name ends in " Helper"', (t) => {
  const opts = {
    arch: 'x64',
    dir: path.join(__dirname, 'fixtures', 'el-0374'),
    name: 'Bad Helper',
    platform: 'linux'
  }

  return packager(opts)
    .then(
      () => t.end('should not finish'),
      (err) => {
        t.equal(err.message, 'Application names cannot end in " Helper" due to limitations on macOS')
        t.end()
      }
    )
})

test('deprecatedParameter moves value in deprecated param to new param if new param is not set', (t) => {
  let opts = {
    old: 'value'
  }
  common.deprecatedParameter(opts, 'old', 'new', 'new-value')

  t.false(opts.hasOwnProperty('old'), 'old property is not set')
  t.true(opts.hasOwnProperty('new'), 'new property is set')

  opts.not_overwritten_old = 'another'
  common.deprecatedParameter(opts, 'not_overwritten_old', 'new', 'new-value')

  t.false(opts.hasOwnProperty('not_overwritten_old'), 'not_overwritten_old property is not set')
  t.true(opts.hasOwnProperty('new'), 'new property is set')
  t.equal('value', opts.new, 'new property is not overwritten')
  t.end()
})

util.testSinglePlatform('defaults test', createDefaultsTest)
util.testSinglePlatform('out test', createOutTest)
util.testSinglePlatform('overwrite test', createOverwriteTest)
util.testSinglePlatform('tmpdir test', createTmpdirTest)
util.testSinglePlatform('disable tmpdir test', createDisableTmpdirUsingTest)
util.testSinglePlatform('deref symlink test', createDisableSymlinkDereferencingTest)

for (const platform of ['darwin', 'linux']) {
  util.testSinglePlatform(`extraResource test: string (${platform})`, createExtraResourceStringTest(platform))
  util.testSinglePlatform(`extraResource test: array (${platform})`, createExtraResourceArrayTest(platform))
}

util.packagerTest('building for Linux target sanitizes binary name', (t) => {
  const opts = {
    name: '@username/package-name',
    dir: path.join(__dirname, 'fixtures', 'el-0374'),
    electronVersion: '0.37.4',
    arch: 'ia32',
    platform: 'linux'
  }

  packager(opts)
    .then(paths => {
      t.equal(1, paths.length, '1 bundle created')
      return fs.stat(path.join(paths[0], '@username-package-name'))
    }).then(stats => {
      t.true(stats.isFile(), 'The sanitized binary filename should exist')
      return t.end()
    }).catch(t.end)
})

util.packagerTest('fails with invalid version', util.invalidOptionTest({
  name: 'invalidElectronTest',
  dir: path.join(__dirname, 'fixtures', 'el-0374'),
  electronVersion: '0.0.1',
  arch: 'x64',
  platform: 'linux',
  download: {
    quiet: !!process.env.CI
  }
}))

util.packagerTest('dir argument test: should work with relative path', (t) => {
  const opts = {
    name: 'ElectronTest',
    dir: path.join('..', 'fixtures', 'el-0374'),
    electronVersion: '0.37.4',
    arch: 'x64',
    platform: 'linux'
  }

  packager(opts)
    .then(paths => {
      t.equal(path.join(__dirname, 'work', 'ElectronTest-linux-x64'), paths[0], 'paths returned')
      return t.end()
    }).catch(t.end)
})
