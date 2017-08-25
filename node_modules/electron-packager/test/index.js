'use strict'

const config = require('./config.json')
const exec = require('mz/child_process').exec
const util = require('./util')

// Download all Electron distributions before running tests to avoid timing out due to network
// speed. Most tests run with the config.json version, but we have some tests using 0.37.4, and an
// electron module specific test using 1.3.1.
function preDownloadElectron () {
  const versions = [
    config.version,
    '0.37.4',
    '1.3.1'
  ]
  return Promise.all(versions.map(util.downloadAll))
}

function npmInstallForFixture (fixture) {
  console.log(`Running npm install in fixtures/${fixture}...`)
  return exec('npm install --no-bin-links', {cwd: util.fixtureSubdir(fixture)})
    .catch((err) => console.error(err))
}

function npmInstallForFixtures () {
  const fixtures = [
    'basic',
    'basic-renamed-to-electron',
    'infer-missing-version-only',
    'el-0374'
  ]
  return Promise.all(fixtures.map(npmInstallForFixture))
}

preDownloadElectron()
  .then(npmInstallForFixtures)
  .then(() => {
    console.log('Running tests...')
    require('./basic')
    require('./asar')
    require('./cli')
    require('./ignore')
    require('./infer')
    require('./hooks')
    require('./prune')
    require('./targets')
    require('./win32')

    if (process.platform !== 'win32') {
      // Perform additional tests specific to building for OS X
      require('./darwin')
      require('./mas')
    }

    return true
  }).catch((error) => {
    console.error(error.stack || error)
    return process.exit(1)
  })
