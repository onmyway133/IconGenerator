'use strict'

const config = require('./config.json')
const fs = require('fs-extra')
const packager = require('..')
const path = require('path')
const prune = require('../prune')
const test = require('tape')
const util = require('./util')
const which = require('which')

function createPruneOptionTest (baseOpts, prune, testMessage) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    let opts = Object.create(baseOpts)
    opts.name = 'basicTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.prune = prune

    let finalPath
    let resourcesPath

    packager(opts)
      .then(paths => {
        finalPath = paths[0]
        return fs.stat(finalPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        resourcesPath = path.join(finalPath, util.generateResourcesPath(opts))
        return fs.stat(resourcesPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        return fs.stat(path.join(resourcesPath, 'app', 'node_modules', 'run-series'))
      }).then(stats => {
        t.true(stats.isDirectory(), 'npm dependency should exist under app/node_modules')
        return fs.pathExists(path.join(resourcesPath, 'app', 'node_modules', 'run-waterfall'))
      }).then(exists => {
        t.equal(!prune, exists, testMessage)
        return t.end()
      }).catch(t.end)
  }
}

test('pruneCommand returns the correct command when passing a known package manager', (t) => {
  t.equal(prune.pruneCommand('npm'), 'npm prune --production', 'passing npm gives the npm prune command')
  t.equal(prune.pruneCommand('cnpm'), 'cnpm prune --production', 'passing cnpm gives the cnpm prune command')
  t.equal(prune.pruneCommand('yarn'), 'yarn install --production --no-bin-links', 'passing yarn gives the yarn "prune command"')
  t.end()
})

test('pruneCommand returns null when the package manager is unknown', (t) => {
  t.notOk(prune.pruneCommand('unknown-package-manager'))
  t.end()
})

test('pruneModules returns an error when the package manager is unknown', (t) => {
  prune.pruneModules({packageManager: 'unknown-package-manager'}, '/tmp/app-path', (err) => {
    t.ok(err, 'error returned')
    t.end()
  })
})

if (process.platform === 'win32') {
  test('pruneModules returns an error when trying to use cnpm on Windows', (t) => {
    prune.pruneModules({packageManager: 'cnpm'}, '/tmp/app-path', (err) => {
      t.ok(err, 'error returned')
      t.end()
    })
  })
}

// This is not in the below loop so that it tests the default packageManager option.
util.testSinglePlatform('prune test with npm', (baseOpts) => {
  return createPruneOptionTest(baseOpts, true, 'package.json devDependency should NOT exist under app/node_modules')
})

// Not in the loop because it doesn't depend on an executable
util.testSinglePlatform('prune test using pruner module (packageManager=false)', (baseOpts) => {
  const opts = Object.assign({packageManager: false}, baseOpts)
  return createPruneOptionTest(opts, true, 'package.json devDependency should NOT exist under app/node_modules')
})

for (const packageManager of ['cnpm', 'yarn']) {
  which(packageManager, (err, resolvedPath) => {
    if (err) return

    util.testSinglePlatform(`prune test with ${packageManager}`, (baseOpts) => {
      const opts = Object.assign({packageManager: packageManager}, baseOpts)
      return createPruneOptionTest(opts, true, 'package.json devDependency should NOT exist under app/node_modules')
    })
  })
}

util.testSinglePlatform('prune=false test', (baseOpts) => {
  return createPruneOptionTest(baseOpts, false, 'npm devDependency should exist under app/node_modules')
})
