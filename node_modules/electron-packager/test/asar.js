'use strict'

const common = require('../common')
const config = require('./config.json')
const fs = require('fs-extra')
const packager = require('..')
const path = require('path')
const test = require('tape')
const util = require('./util')

function createDefaultAppAsarTest (opts) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    opts.name = 'el0374Test'
    opts.dir = path.join(__dirname, 'fixtures', 'el-0374')
    opts.electronVersion = '0.37.4'

    var resourcesPath

    packager(opts)
      .then(paths => {
        resourcesPath = path.join(paths[0], util.generateResourcesPath(opts))
        return fs.pathExists(path.join(resourcesPath, 'default_app.asar'))
      }).then(exists => {
        t.false(exists, 'The output directory should not contain the Electron default_app.asar file')
        return t.end()
      }).catch(t.end)
  }
}

function createAsarTest (opts) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    opts.name = 'basicTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.asar = {
      'unpack': '*.pac',
      'unpackDir': 'dir_to_unpack'
    }
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
        return fs.stat(path.join(resourcesPath, 'app.asar'))
      }).then(stats => {
        t.true(stats.isFile(), 'app.asar should exist under the resources subdirectory when opts.asar is true')
        return fs.pathExists(path.join(resourcesPath, 'app'))
      }).then(exists => {
        t.false(exists, 'app subdirectory should NOT exist when app.asar is built')
        return fs.stat(path.join(resourcesPath, 'app.asar.unpacked'))
      }).then(stats => {
        t.true(stats.isDirectory(), 'app.asar.unpacked should exist under the resources subdirectory when opts.asar_unpack is set some expression')
        return fs.stat(path.join(resourcesPath, 'app.asar.unpacked', 'dir_to_unpack'))
      }).then(stats => {
        t.true(stats.isDirectory(), 'dir_to_unpack should exist under app.asar.unpacked subdirectory when opts.asar-unpack-dir is set dir_to_unpack')
        return t.end()
      }).catch(t.end)
  }
}

test('asar argument test: asar is not set', (t) => {
  const asarOpts = common.createAsarOpts({})
  t.false(asarOpts, 'createAsarOpts returns false')
  t.end()
})

test('asar argument test: asar is true', (t) => {
  const asarOpts = common.createAsarOpts({asar: true})
  t.same(asarOpts, {})
  t.end()
})

test('asar argument test: asar is not an Object or a bool', (t) => {
  const asarOpts = common.createAsarOpts({asar: 'string'})
  t.false(asarOpts, 'createAsarOpts returns false')
  t.end()
})

util.testSinglePlatform('default_app.asar removal test', createDefaultAppAsarTest)
util.testSinglePlatform('asar test', createAsarTest)
