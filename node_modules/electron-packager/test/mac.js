'use strict'

const config = require('./config.json')
const exec = require('mz/child_process').exec
const fs = require('fs-extra')
const mac = require('../mac')
const packager = require('..')
const path = require('path')
const plist = require('plist')
const test = require('tape')
const util = require('./util')

function getHelperExecutablePath (helperName) {
  return path.join(`${helperName}.app`, 'Contents', 'MacOS', helperName)
}

function parseInfoPlist (t, opts, basePath) {
  const plistPath = path.join(basePath, `${opts.name}.app`, 'Contents', 'Info.plist')

  return fs.stat(plistPath)
    .then(stats => {
      t.true(stats.isFile(), 'The expected Info.plist file should exist')
      return fs.readFile(plistPath, 'utf8')
    }).then(file => plist.parse(file))
}

function packageAndParseInfoPlist (t, opts) {
  return packager(opts)
    .then(paths => parseInfoPlist(t, opts, paths[0]))
}

function createHelperAppPathsTest (baseOpts, expectedName) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    let opts = Object.create(baseOpts)
    let frameworksPath

    if (!expectedName) {
      expectedName = opts.name
    }

    packager(opts)
      .then(paths => {
        frameworksPath = path.join(paths[0], `${expectedName}.app`, 'Contents', 'Frameworks')
        // main Helper.app is already tested in basic test suite; test its executable and the other helpers
        return fs.stat(path.join(frameworksPath, getHelperExecutablePath(`${expectedName} Helper`)))
      }).then(stats => {
        t.true(stats.isFile(), 'The Helper.app executable should reflect sanitized opts.name')
        return fs.stat(path.join(frameworksPath, `${expectedName} Helper EH.app`))
      }).then(stats => {
        t.true(stats.isDirectory(), 'The Helper EH.app should reflect sanitized opts.name')
        return fs.stat(path.join(frameworksPath, getHelperExecutablePath(`${expectedName} Helper EH`)))
      }).then(stats => {
        t.true(stats.isFile(), 'The Helper EH.app executable should reflect sanitized opts.name')
        return fs.stat(path.join(frameworksPath, `${expectedName} Helper NP.app`))
      }).then(stats => {
        t.true(stats.isDirectory(), 'The Helper NP.app should reflect sanitized opts.name')
        return fs.stat(path.join(frameworksPath, getHelperExecutablePath(`${expectedName} Helper NP`)))
      }).then(stats => {
        t.true(stats.isFile(), 'The Helper NP.app executable should reflect sanitized opts.name')
        return t.end()
      }).catch(t.end)
  }
}

function createIconTest (baseOpts, icon, iconPath) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    const opts = Object.assign({}, baseOpts, {icon: icon})

    let resourcesPath
    let outputPath

    packager(opts)
      .then(paths => {
        outputPath = paths[0]
        resourcesPath = path.join(outputPath, util.generateResourcesPath(opts))
        return fs.stat(resourcesPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        return parseInfoPlist(t, opts, outputPath)
      }).then(obj => {
        return util.areFilesEqual(iconPath, path.join(resourcesPath, obj.CFBundleIconFile))
      }).then(equal => {
        t.true(equal, 'installed icon file should be identical to the specified icon file')
        return t.end()
      }).catch(t.end)
  }
}

function createExtendInfoTest (baseOpts, extraPathOrParams) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    const opts = Object.assign({}, baseOpts, {
      appBundleId: 'com.electron.extratest',
      appCategoryType: 'public.app-category.music',
      buildVersion: '3.2.1',
      extendInfo: extraPathOrParams
    })

    packageAndParseInfoPlist(t, opts)
      .then(obj => {
        t.equal(obj.TestKeyString, 'String data', 'TestKeyString should come from extendInfo')
        t.equal(obj.TestKeyInt, 12345, 'TestKeyInt should come from extendInfo')
        t.equal(obj.TestKeyBool, true, 'TestKeyBool should come from extendInfo')
        t.deepEqual(obj.TestKeyArray, ['public.content', 'public.data'], 'TestKeyArray should come from extendInfo')
        t.deepEqual(obj.TestKeyDict, { Number: 98765, CFBundleVersion: '0.0.0' }, 'TestKeyDict should come from extendInfo')
        t.equal(obj.CFBundleVersion, opts.buildVersion, 'CFBundleVersion should reflect buildVersion argument')
        t.equal(obj.CFBundleIdentifier, 'com.electron.extratest', 'CFBundleIdentifier should reflect appBundleId argument')
        t.equal(obj.LSApplicationCategoryType, 'public.app-category.music', 'LSApplicationCategoryType should reflect appCategoryType argument')
        t.equal(obj.CFBundlePackageType, 'APPL', 'CFBundlePackageType should be Electron default')
        return t.end()
      }).catch(t.end)
  }
}

function createBinaryNameTest (baseOpts, expectedAppName) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    const opts = Object.create(baseOpts)
    let binaryPath
    let appName = expectedAppName || opts.name

    packager(opts)
      .then(paths => {
        binaryPath = path.join(paths[0], `${appName}.app`, 'Contents', 'MacOS')
        return fs.stat(path.join(binaryPath, appName))
      }).then(stats => {
        t.true(stats.isFile(), 'The binary should reflect a sanitized opts.name')
        return t.end()
      }).catch(t.end)
  }
}

function createAppVersionTest (baseOpts, appVersion, buildVersion) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    let opts = Object.assign({}, baseOpts, {appVersion: appVersion, buildVersion: appVersion})

    if (buildVersion) {
      opts.buildVersion = buildVersion
    }

    packageAndParseInfoPlist(t, opts)
      .then(obj => {
        t.equal(obj.CFBundleVersion, '' + opts.buildVersion, 'CFBundleVersion should reflect buildVersion')
        t.equal(obj.CFBundleShortVersionString, '' + opts.appVersion, 'CFBundleShortVersionString should reflect appVersion')
        t.equal(typeof obj.CFBundleVersion, 'string', 'CFBundleVersion should be a string')
        t.equal(typeof obj.CFBundleShortVersionString, 'string', 'CFBundleShortVersionString should be a string')
        return t.end()
      }).catch(t.end)
  }
}

function createAppVersionInferenceTest (baseOpts) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    packageAndParseInfoPlist(t, Object.create(baseOpts))
      .then(obj => {
        t.equal(obj.CFBundleVersion, '4.99.101', 'CFBundleVersion should reflect package.json version')
        t.equal(obj.CFBundleShortVersionString, '4.99.101', 'CFBundleShortVersionString should reflect package.json version')
        return t.end()
      }).catch(t.end)
  }
}

function createAppCategoryTypeTest (baseOpts, appCategoryType) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    const opts = Object.assign({}, baseOpts, {appCategoryType: appCategoryType})

    packageAndParseInfoPlist(t, opts)
      .then(obj => {
        t.equal(obj.LSApplicationCategoryType, opts.appCategoryType, 'LSApplicationCategoryType should reflect opts.appCategoryType')
        return t.end()
      }).catch(t.end)
  }
}

function createAppBundleTest (baseOpts, appBundleId) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    let opts = Object.create(baseOpts)
    if (appBundleId) {
      opts.appBundleId = appBundleId
    }
    const defaultBundleName = `com.electron.${opts.name.toLowerCase()}`
    const appBundleIdentifier = mac.filterCFBundleIdentifier(opts.appBundleId || defaultBundleName)

    packageAndParseInfoPlist(t, opts)
      .then(obj => {
        t.equal(obj.CFBundleDisplayName, opts.name, 'CFBundleDisplayName should reflect opts.name')
        t.equal(obj.CFBundleName, opts.name, 'CFBundleName should reflect opts.name')
        t.equal(obj.CFBundleIdentifier, appBundleIdentifier, 'CFBundleName should reflect opts.appBundleId or fallback to default')
        t.equal(typeof obj.CFBundleDisplayName, 'string', 'CFBundleDisplayName should be a string')
        t.equal(typeof obj.CFBundleName, 'string', 'CFBundleName should be a string')
        t.equal(typeof obj.CFBundleIdentifier, 'string', 'CFBundleIdentifier should be a string')
        t.equal(/^[a-zA-Z0-9-.]*$/.test(obj.CFBundleIdentifier), true, 'CFBundleIdentifier should allow only alphanumeric (A-Z,a-z,0-9), hyphen (-), and period (.)')
        return t.end()
      }).catch(t.end)
  }
}

function createAppBundleFrameworkTest (baseOpts) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    let frameworkPath

    packager(baseOpts)
      .then(paths => {
        frameworkPath = path.join(paths[0], `${baseOpts.name}.app`, 'Contents', 'Frameworks', 'Electron Framework.framework')
        return fs.stat(frameworkPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'Expected Electron Framework.framework to be a directory')
        return fs.lstat(path.join(frameworkPath, 'Electron Framework'))
      }).then(stats => {
        t.true(stats.isSymbolicLink(), 'Expected Electron Framework.framework/Electron Framework to be a symlink')
        return fs.lstat(path.join(frameworkPath, 'Versions', 'Current'))
      }).then(stats => {
        t.true(stats.isSymbolicLink(), 'Expected Electron Framework.framework/Versions/Current to be a symlink')
        return t.end()
      }).catch(t.end)
  }
}

function createAppHelpersBundleTest (baseOpts, helperBundleId, appBundleId) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    let tempPath, plistPath
    let opts = Object.create(baseOpts)
    if (helperBundleId) {
      opts.helperBundleId = helperBundleId
    }
    if (appBundleId) {
      opts.appBundleId = appBundleId
    }
    const defaultBundleName = `com.electron.${opts.name.toLowerCase()}`
    const appBundleIdentifier = mac.filterCFBundleIdentifier(opts.appBundleId || defaultBundleName)
    const helperBundleIdentifier = mac.filterCFBundleIdentifier(opts.helperBundleId || appBundleIdentifier + '.helper')

    packager(opts)
      .then(paths => {
        tempPath = paths[0]
        plistPath = path.join(tempPath, opts.name + '.app', 'Contents', 'Frameworks', opts.name + ' Helper.app', 'Contents', 'Info.plist')
        return fs.stat(plistPath)
      }).then(stats => {
        t.true(stats.isFile(), 'The expected Info.plist file should exist in helper app')
        return fs.readFile(plistPath, 'utf8')
      }).then(file => {
        const obj = plist.parse(file)
        t.equal(obj.CFBundleName, opts.name, 'CFBundleName should reflect opts.name in helper app')
        t.equal(obj.CFBundleIdentifier, helperBundleIdentifier, 'CFBundleIdentifier should reflect opts.helperBundleId, opts.appBundleId or fallback to default in helper app')
        t.equal(typeof obj.CFBundleName, 'string', 'CFBundleName should be a string in helper app')
        t.equal(typeof obj.CFBundleIdentifier, 'string', 'CFBundleIdentifier should be a string in helper app')
        t.equal(/^[a-zA-Z0-9-.]*$/.test(obj.CFBundleIdentifier), true, 'CFBundleIdentifier should allow only alphanumeric (A-Z,a-z,0-9), hyphen (-), and period (.)')
        // check helper EH
        plistPath = path.join(tempPath, opts.name + '.app', 'Contents', 'Frameworks', opts.name + ' Helper EH.app', 'Contents', 'Info.plist')
        return fs.stat(plistPath)
      }).then(stats => {
        t.true(stats.isFile(), 'The expected Info.plist file should exist in helper EH app')
        return fs.readFile(plistPath, 'utf8')
      }).then(file => {
        const obj = plist.parse(file)
        t.equal(obj.CFBundleName, opts.name + ' Helper EH', 'CFBundleName should reflect opts.name in helper EH app')
        t.equal(obj.CFBundleDisplayName, opts.name + ' Helper EH', 'CFBundleDisplayName should reflect opts.name in helper EH app')
        t.equal(obj.CFBundleExecutable, opts.name + ' Helper EH', 'CFBundleExecutable should reflect opts.name in helper EH app')
        t.equal(obj.CFBundleIdentifier, helperBundleIdentifier + '.EH', 'CFBundleName should reflect opts.helperBundleId, opts.appBundleId or fallback to default in helper EH app')
        t.equal(typeof obj.CFBundleName, 'string', 'CFBundleName should be a string in helper EH app')
        t.equal(typeof obj.CFBundleDisplayName, 'string', 'CFBundleDisplayName should be a string in helper EH app')
        t.equal(typeof obj.CFBundleExecutable, 'string', 'CFBundleExecutable should be a string in helper EH app')
        t.equal(typeof obj.CFBundleIdentifier, 'string', 'CFBundleIdentifier should be a string in helper EH app')
        t.equal(/^[a-zA-Z0-9-.]*$/.test(obj.CFBundleIdentifier), true, 'CFBundleIdentifier should allow only alphanumeric (A-Z,a-z,0-9), hyphen (-), and period (.)')
        // check helper NP
        plistPath = path.join(tempPath, opts.name + '.app', 'Contents', 'Frameworks', opts.name + ' Helper NP.app', 'Contents', 'Info.plist')
        return fs.stat(plistPath)
      }).then(stats => {
        t.true(stats.isFile(), 'The expected Info.plist file should exist in helper NP app')
        return fs.readFile(plistPath, 'utf8')
      }).then(file => {
        const obj = plist.parse(file)
        t.equal(obj.CFBundleName, opts.name + ' Helper NP', 'CFBundleName should reflect opts.name in helper NP app')
        t.equal(obj.CFBundleDisplayName, opts.name + ' Helper NP', 'CFBundleDisplayName should reflect opts.name in helper NP app')
        t.equal(obj.CFBundleExecutable, opts.name + ' Helper NP', 'CFBundleExecutable should reflect opts.name in helper NP app')
        t.equal(obj.CFBundleIdentifier, helperBundleIdentifier + '.NP', 'CFBundleName should reflect opts.helperBundleId, opts.appBundleId or fallback to default in helper NP app')
        t.equal(typeof obj.CFBundleName, 'string', 'CFBundleName should be a string in helper NP app')
        t.equal(typeof obj.CFBundleDisplayName, 'string', 'CFBundleDisplayName should be a string in helper NP app')
        t.equal(typeof obj.CFBundleExecutable, 'string', 'CFBundleExecutable should be a string in helper NP app')
        t.equal(typeof obj.CFBundleIdentifier, 'string', 'CFBundleIdentifier should be a string in helper NP app')
        t.equal(/^[a-zA-Z0-9-.]*$/.test(obj.CFBundleIdentifier), true, 'CFBundleIdentifier should allow only alphanumeric (A-Z,a-z,0-9), hyphen (-), and period (.)')
        return t.end()
      }).catch(t.end)
  }
}

function createAppHumanReadableCopyrightTest (baseOpts, humanReadableCopyright) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    const opts = Object.assign({}, baseOpts, {appCopyright: humanReadableCopyright})

    packageAndParseInfoPlist(t, opts)
      .then(obj => {
        t.equal(obj.NSHumanReadableCopyright, opts.appCopyright, 'NSHumanReadableCopyright should reflect opts.appCopyright')
        return t.end()
      }).catch(t.end)
  }
}

function createProtocolTest (baseOpts) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    const opts = Object.assign({}, baseOpts, {
      protocols: [{
        name: 'Foo',
        schemes: ['foo']
      }, {
        name: 'Bar',
        schemes: ['bar', 'baz']
      }]
    })

    packageAndParseInfoPlist(t, opts)
      .then(obj => {
        t.deepEqual(obj.CFBundleURLTypes, [{
          CFBundleURLName: 'Foo',
          CFBundleURLSchemes: ['foo']
        }, {
          CFBundleURLName: 'Bar',
          CFBundleURLSchemes: ['bar', 'baz']
        }], 'CFBundleURLTypes did not contain specified protocol schemes and names')
        return t.end()
      }).catch(t.end)
  }
}

// Share testing script with platform darwin and mas
module.exports = (baseOpts) => {
  const iconBase = path.join(__dirname, 'fixtures', 'monochrome')
  const icnsPath = `${iconBase}.icns`
  const el0374Opts = Object.assign({}, baseOpts, {
    name: 'el0374Test',
    dir: util.fixtureSubdir('el-0374'),
    electronVersion: '0.37.4'
  })
  const extraInfoPath = path.join(__dirname, 'fixtures', 'extrainfo.plist')
  const extraInfoParams = plist.parse(fs.readFileSync(extraInfoPath).toString())

  util.packagerTest('helper app paths test', createHelperAppPathsTest(baseOpts))
  util.packagerTest('helper app paths test with app name needing sanitization', createHelperAppPathsTest(Object.assign({}, baseOpts, {name: '@username/package-name'}), '@username-package-name'))

  util.packagerTest('icon test: .icns specified', createIconTest(baseOpts, icnsPath, icnsPath))
  // This test exists because the .icns file basename changed as of 0.37.4
  util.packagerTest('icon test: el-0.37.4, .icns specified', createIconTest(el0374Opts, icnsPath, icnsPath))
  util.packagerTest('icon test: .ico specified (should replace with .icns)', createIconTest(baseOpts, `${iconBase}.ico`, icnsPath))
  util.packagerTest('icon test: basename only (should add .icns)', createIconTest(baseOpts, iconBase, icnsPath))

  util.packagerTest('extendInfo by filename test', createExtendInfoTest(baseOpts, extraInfoPath))
  util.packagerTest('extendInfo by params test', createExtendInfoTest(baseOpts, extraInfoParams))

  util.packagerTest('protocol/protocol-name argument test', createProtocolTest(baseOpts))

  test('osxSign argument test: default args', (t) => {
    const args = true
    const signOpts = mac.createSignOpts(args, 'darwin', 'out', 'version')
    t.same(signOpts, {identity: null, app: 'out', platform: 'darwin', version: 'version'})
    return t.end()
  })

  test('osxSign argument test: identity=true sets autodiscovery mode', (t) => {
    const args = {identity: true}
    const signOpts = mac.createSignOpts(args, 'darwin', 'out', 'version')
    t.same(signOpts, {identity: null, app: 'out', platform: 'darwin', version: 'version'})
    return t.end()
  })

  test('osxSign argument test: entitlements passed to electron-osx-sign', (t) => {
    const args = {entitlements: 'path-to-entitlements'}
    const signOpts = mac.createSignOpts(args, 'darwin', 'out', 'version')
    t.same(signOpts, {app: 'out', platform: 'darwin', version: 'version', entitlements: args.entitlements})
    return t.end()
  })

  test('osxSign argument test: app not overwritten', (t) => {
    const args = {app: 'some-other-path'}
    const signOpts = mac.createSignOpts(args, 'darwin', 'out', 'version')
    t.same(signOpts, {app: 'out', platform: 'darwin', version: 'version'})
    return t.end()
  })

  test('osxSign argument test: platform not overwritten', (t) => {
    const args = {platform: 'mas'}
    const signOpts = mac.createSignOpts(args, 'darwin', 'out', 'version')
    t.same(signOpts, {app: 'out', platform: 'darwin', version: 'version'})
    return t.end()
  })

  test('osxSign argument test: binaries not set', (t) => {
    const args = {binaries: ['binary1', 'binary2']}
    const signOpts = mac.createSignOpts(args, 'darwin', 'out', 'version')
    t.same(signOpts, {app: 'out', platform: 'darwin', version: 'version'})
    return t.end()
  })

  util.packagerTest('codesign test', (t) => {
    t.timeoutAfter(config.macExecTimeout)

    const opts = Object.assign({}, baseOpts, {osxSign: {identity: 'Developer CodeCert'}})
    let appPath

    packager(opts)
      .then(paths => {
        appPath = path.join(paths[0], opts.name + '.app')
        return fs.stat(appPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The expected .app directory should exist')
        return exec(`codesign -v ${appPath}`)
      }).then(
        (stdout, stderr) => {
          t.pass('codesign should verify successfully')
          return t.end()
        },
        (err) => {
          const notFound = err && err.code === 127
          if (notFound) console.log('codesign not installed; skipped')
          return t.end(notFound ? null : err)
        }
      ).catch(t.end)
  })

  util.packagerTest('binary naming test', createBinaryNameTest(baseOpts))
  util.packagerTest('sanitized binary naming test', createBinaryNameTest(Object.assign({}, baseOpts, {name: '@username/package-name'}), '@username-package-name'))

  util.packagerTest('CFBundleName is the sanitized app name and CFBundleDisplayName is the non-sanitized app name', (t) => {
    t.timeoutAfter(config.timeout)

    let plistPath
    const opts = Object.assign({}, baseOpts, {name: '@username/package-name'})
    const appBundleIdentifier = 'com.electron.username-package-name'
    const expectedSanitizedName = '@username-package-name'

    packager(opts)
      .then(paths => {
        plistPath = path.join(paths[0], `${expectedSanitizedName}.app`, 'Contents', 'Info.plist')
        return fs.stat(plistPath)
      }).then(stats => {
        t.true(stats.isFile(), 'The expected Info.plist file should exist')
        return fs.readFile(plistPath, 'utf8')
      }).then(file => {
        const obj = plist.parse(file)
        t.equal(typeof obj.CFBundleDisplayName, 'string', 'CFBundleDisplayName should be a string')
        t.equal(obj.CFBundleDisplayName, opts.name, 'CFBundleDisplayName should reflect opts.name')
        t.equal(typeof obj.CFBundleName, 'string', 'CFBundleName should be a string')
        t.equal(obj.CFBundleName, expectedSanitizedName, 'CFBundleName should reflect a sanitized opts.name')
        t.equal(typeof obj.CFBundleIdentifier, 'string', 'CFBundleIdentifier should be a string')
        t.equal(/^[a-zA-Z0-9-.]*$/.test(obj.CFBundleIdentifier), true, 'CFBundleIdentifier should allow only alphanumeric (A-Z,a-z,0-9), hyphen (-), and period (.)')
        t.equal(obj.CFBundleIdentifier, appBundleIdentifier, 'CFBundleIdentifier should reflect the sanitized opts.name')
        return t.end()
      }).catch(t.end)
  })

  util.packagerTest('app and build version test', createAppVersionTest(baseOpts, '1.1.0', '1.1.0.1234'))
  util.packagerTest('infer app version from package.json test', createAppVersionInferenceTest(baseOpts))
  util.packagerTest('app version test', createAppVersionTest(baseOpts, '1.1.0'))
  util.packagerTest('app and build version integer test', createAppVersionTest(baseOpts, 12, 1234))

  util.packagerTest('app categoryType test', createAppCategoryTypeTest(baseOpts, 'public.app-category.developer-tools'))

  util.packagerTest('app bundle test', createAppBundleTest(baseOpts, 'com.electron.basetest'))
  util.packagerTest('app bundle (w/ special characters) test', createAppBundleTest(baseOpts, 'com.electron."bãśè tëßt!@#$%^&*()?\''))
  util.packagerTest('app bundle app-bundle-id fallback test', createAppBundleTest(baseOpts))
  util.packagerTest('app bundle framework symlink test', createAppBundleFrameworkTest(baseOpts))

  util.packagerTest('app helpers bundle test', createAppHelpersBundleTest(baseOpts, 'com.electron.basetest.helper'))
  util.packagerTest('app helpers bundle (w/ special characters) test', createAppHelpersBundleTest(baseOpts, 'com.electron."bãśè tëßt!@#$%^&*()?\'.hęłpėr'))
  util.packagerTest('app helpers bundle helper-bundle-id fallback to app-bundle-id test', createAppHelpersBundleTest(baseOpts, null, 'com.electron.basetest'))
  util.packagerTest('app helpers bundle helper-bundle-id fallback to app-bundle-id (w/ special characters) test', createAppHelpersBundleTest(baseOpts, null, 'com.electron."bãśè tëßt!!@#$%^&*()?\''))
  util.packagerTest('app helpers bundle helper-bundle-id & app-bundle-id fallback test', createAppHelpersBundleTest(baseOpts))

  util.packagerTest('app humanReadableCopyright test', createAppHumanReadableCopyrightTest(baseOpts, 'Copyright © 2003–2015 Organization. All rights reserved.'))

  util.packagerTest('app named Electron packaged successfully', (t) => {
    const opts = Object.assign({}, baseOpts, {name: 'Electron'})
    let appPath

    packager(opts)
      .then(paths => {
        appPath = path.join(paths[0], 'Electron.app')
        return fs.stat(appPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The Electron.app folder exists')
        return fs.stat(path.join(appPath, 'Contents', 'MacOS', 'Electron'))
      }).then(stats => {
        t.true(stats.isFile(), 'The Electron.app/Contents/MacOS/Electron binary exists')
        return t.end()
      }).catch(t.end)
  })
}
