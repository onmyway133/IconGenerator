'use strict'

const config = require('./config.json')
const targets = require('../targets')
const test = require('tape')
const util = require('./util')

function createMultiTargetOptions (extraOpts) {
  return Object.assign({
    name: 'basicTest',
    dir: util.fixtureSubdir('basic'),
    electronVersion: config.version
  }, extraOpts)
}

function testMultiTarget (testcaseDescription, extraOpts, expectedPackageCount, packageExistenceMessage) {
  test(testcaseDescription, (t) => {
    const opts = createMultiTargetOptions(extraOpts)
    const platforms = targets.validateListFromOptions(opts, 'platform')
    const archs = targets.validateListFromOptions(opts, 'arch')
    const combinations = targets.createPlatformArchPairs(opts, platforms, archs)

    t.equal(combinations.length, expectedPackageCount, packageExistenceMessage)
    t.end()
  })
}

function testCombinations (testcaseDescription, arch, platform) {
  testMultiTarget(testcaseDescription, {arch: arch, platform: platform}, 4,
                  'Packages should be generated for all combinations of specified archs and platforms')
}

test('validateListFromOptions does not take non-Array/String values', (t) => {
  targets.supported.digits = new Set(['64', '65'])
  t.notOk(targets.validateListFromOptions({digits: 64}, 'digits') instanceof Array,
          'should not be an Array')
  delete targets.supported.digits
  t.end()
})

testMultiTarget('build for all available official targets', {all: true, electronVersion: '1.8.0'},
                util.allPlatformArchCombosCount,
                'Packages should be generated for all possible platforms')
testMultiTarget('build for all available official targets for a version without arm64 support',
                {all: true},
                util.allPlatformArchCombosCount - 1,
                'Packages should be generated for all possible platforms (except arm64)')
testMultiTarget('platform=all (one arch)', {arch: 'ia32', platform: 'all'}, 2,
                'Packages should be generated for both 32-bit platforms')
testMultiTarget('arch=all test (one platform)', {arch: 'all', platform: 'linux'}, 3,
                'Packages should be generated for all expected architectures')

testCombinations('multi-platform / multi-arch test, from arrays', ['ia32', 'x64'], ['linux', 'win32'])
testCombinations('multi-platform / multi-arch test, from strings', 'ia32,x64', 'linux,win32')
testCombinations('multi-platform / multi-arch test, from strings with spaces', 'ia32, x64', 'linux, win32')

util.packagerTest('fails with invalid arch', util.invalidOptionTest({
  arch: 'z80',
  platform: 'linux'
}))
util.packagerTest('fails with invalid platform', util.invalidOptionTest({
  arch: 'ia32',
  platform: 'dos'
}))

testMultiTarget('invalid official combination', {arch: 'ia32', platform: 'darwin'}, 0, 'Package should not be generated for invalid official combination')
testMultiTarget('platform=linux and arch=arm64 with a supported official Electron version', {arch: 'arm64', platform: 'linux', electronVersion: '1.8.0'}, 1, 'Package should be generated for arm64')
testMultiTarget('platform=linux and arch=arm64 with an unsupported official Electron version', {arch: 'arm64', platform: 'linux'}, 0, 'Package should not be generated for arm64')
testMultiTarget('unofficial arch', {arch: 'z80', platform: 'linux', download: {mirror: 'mirror'}}, 1,
                'Package should be generated for non-standard arch from non-official mirror')
testMultiTarget('unofficial platform', {arch: 'ia32', platform: 'minix', download: {mirror: 'mirror'}}, 1,
                'Package should be generated for non-standard platform from non-official mirror')
