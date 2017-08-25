'use strict'

const config = require('./config.json')
const fs = require('fs-extra')
const packager = require('..')
const path = require('path')
const test = require('tape')
const util = require('./util')
const win32 = require('../win32')

const baseOpts = {
  name: 'basicTest',
  dir: util.fixtureSubdir('basic'),
  electronVersion: config.version,
  arch: 'x64',
  platform: 'win32'
}

function generateVersionStringTest (metadataProperties, extraOpts, expectedValues, assertionMsgs) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    const opts = Object.assign({}, baseOpts, extraOpts)
    const rcOpts = win32.generateRceditOptionsSansIcon(opts)

    metadataProperties = [].concat(metadataProperties)
    expectedValues = [].concat(expectedValues)
    assertionMsgs = [].concat(assertionMsgs)
    metadataProperties.forEach((property, i) => {
      const value = expectedValues[i]
      const msg = assertionMsgs[i]
      if (property === 'version-string') {
        for (const subkey in value) {
          t.equal(rcOpts[property][subkey], value[subkey], `${msg} (${subkey})`)
        }
      } else {
        t.equal(rcOpts[property], value, msg)
      }
    })
    t.end()
  }
}

function setFileVersionTest (buildVersion) {
  const appVersion = '4.99.101.0'
  const opts = {
    appVersion: appVersion,
    buildVersion: buildVersion
  }

  return generateVersionStringTest(
    ['product-version', 'file-version'],
    opts,
    [appVersion, buildVersion],
    ['Product version should match app version',
      'File version should match build version']
  )
}

function setProductVersionTest (appVersion) {
  var opts = {
    appVersion: appVersion
  }

  return generateVersionStringTest(
    ['product-version', 'file-version'],
    opts,
    [appVersion, appVersion],
    ['Product version should match app version',
      'File version should match app version']
  )
}

function setCopyrightTest (appCopyright) {
  var opts = {
    appCopyright: appCopyright
  }

  return generateVersionStringTest('version-string', opts, {LegalCopyright: appCopyright}, 'Legal copyright should match app copyright')
}

function setCopyrightAndCompanyNameTest (appCopyright, companyName) {
  var opts = {
    appCopyright: appCopyright,
    win32metadata: {
      CompanyName: companyName
    }
  }

  return generateVersionStringTest(
    'version-string',
    opts,
    {LegalCopyright: appCopyright, CompanyName: companyName},
    'Legal copyright should match app copyright and Company name should match win32metadata value'
  )
}

function setRequestedExecutionLevelTest (requestedExecutionLevel) {
  var opts = {
    win32metadata: {
      'requested-execution-level': requestedExecutionLevel
    }
  }

  return generateVersionStringTest(
    'requested-execution-level',
    opts,
    requestedExecutionLevel,
    'requested-execution-level in win32metadata should match rcOpts value'
  )
}

function setApplicationManifestTest (applicationManifest) {
  var opts = {
    win32metadata: {
      'application-manifest': applicationManifest
    }
  }

  return generateVersionStringTest(
    'application-manifest',
    opts,
    applicationManifest,
    'application-manifest in win32metadata should match rcOpts value'
  )
}

function setCompanyNameTest (companyName) {
  const opts = {
    win32metadata: {
      CompanyName: companyName
    }
  }

  return generateVersionStringTest('version-string',
                                   opts,
                                   {CompanyName: companyName},
                                   `Company name should match win32metadata value`)
}

test('better error message when wine is not found', (t) => {
  let err = Error('spawn wine ENOENT')
  err.code = 'ENOENT'
  err.syscall = 'spawn wine'

  t.equal(err.message, 'spawn wine ENOENT')
  err = win32.updateWineMissingException(err)
  t.notEqual(err.message, 'spawn wine ENOENT')

  t.end()
})

test('error message unchanged when error not about wine', (t) => {
  let errNotEnoent = Error('unchanged')
  errNotEnoent.code = 'ESOMETHINGELSE'
  errNotEnoent.syscall = 'spawn wine'

  t.equal(errNotEnoent.message, 'unchanged')
  errNotEnoent = win32.updateWineMissingException(errNotEnoent)
  t.equal(errNotEnoent.message, 'unchanged')

  let errNotSpawnWine = Error('unchanged')
  errNotSpawnWine.code = 'ENOENT'
  errNotSpawnWine.syscall = 'spawn foo'

  t.equal(errNotSpawnWine.message, 'unchanged')
  errNotSpawnWine = win32.updateWineMissingException(errNotSpawnWine)
  t.equal(errNotSpawnWine.message, 'unchanged')

  t.end()
})

test('win32metadata defaults', (t) => {
  const opts = {
    name: 'Win32 App'
  }
  const rcOpts = win32.generateRceditOptionsSansIcon(opts, 'Win32 App.exe')

  t.equal(rcOpts['version-string'].FileDescription, opts.name, 'default FileDescription')
  t.equal(rcOpts['version-string'].InternalName, opts.name, 'default InternalName')
  t.equal(rcOpts['version-string'].OriginalFilename, 'Win32 App.exe', 'default OriginalFilename')
  t.equal(rcOpts['version-string'].ProductName, opts.name, 'default ProductName')
  t.end()
})

util.packagerTest('win32 executable name is based on sanitized app name', (t) => {
  const opts = Object.assign({}, baseOpts, {name: '@username/package-name'})

  packager(opts)
    .then(paths => {
      t.equal(1, paths.length, '1 bundle created')
      const appExePath = path.join(paths[0], '@username-package-name.exe')
      return fs.pathExists(appExePath)
    }).then(exists => {
      t.true(exists, 'The sanitized EXE filename should exist')
      return t.end()
    }).catch(t.end)
})

util.packagerTest('win32 build version sets FileVersion test', setFileVersionTest('2.3.4.5'))
util.packagerTest('win32 app version sets ProductVersion test', setProductVersionTest('5.4.3.2'))
util.packagerTest('win32 app copyright sets LegalCopyright test', setCopyrightTest('Copyright Bar'))
util.packagerTest('win32 set LegalCopyright and CompanyName test', setCopyrightAndCompanyNameTest('Copyright Bar', 'MyCompany LLC'))
util.packagerTest('win32 set CompanyName test', setCompanyNameTest('MyCompany LLC'))
util.packagerTest('win32 set requested-execution-level test', setRequestedExecutionLevelTest('asInvoker'))
util.packagerTest('win32 set application-manifest test', setApplicationManifestTest('/path/to/manifest.xml'))
