'use strict'

const asar = require('asar')
const camelize = require('camelize')
const debug = require('debug')('electron-packager')
const download = require('electron-download')
const fs = require('fs-extra')
const ignore = require('./ignore')
const minimist = require('minimist')
const os = require('os')
const path = require('path')
const pruneModules = require('./prune').pruneModules
const sanitize = require('sanitize-filename')
const semver = require('semver')
const series = require('run-series')
const targets = require('./targets')

function parseCLIArgs (argv) {
  var args = minimist(argv, {
    boolean: [
      'all',
      'deref-symlinks',
      'download.strictSSL',
      'overwrite',
      'prune',
      'quiet'
    ],
    default: {
      'deref-symlinks': true,
      'download.strictSSL': true,
      prune: true
    },
    string: [
      'electron-version',
      'out'
    ]
  })

  args.dir = args._[0]
  args.name = args._[1]

  args = camelize(args)

  var protocolSchemes = [].concat(args.protocol || [])
  var protocolNames = [].concat(args.protocolName || [])

  if (protocolSchemes && protocolNames && protocolNames.length === protocolSchemes.length) {
    args.protocols = protocolSchemes.map(function (scheme, i) {
      return {schemes: [scheme], name: protocolNames[i]}
    })
  }

  if (args.out === '') {
    args.out = null
  }

  // Overrides for multi-typed arguments, because minimist doesn't support it

  // asar: `Object` or `true`
  if (args.asar === 'true' || args.asar instanceof Array) {
    args.asar = true
  }

  // osx-sign: `Object` or `true`
  if (args.osxSign === 'true') {
    args.osxSign = true
  }

  // tmpdir: `String` or `false`
  if (args.tmpdir === 'false') {
    args.tmpdir = false
  }

  return args
}

function asarApp (appPath, asarOptions, cb) {
  var dest = path.join(appPath, '..', 'app.asar')
  debug(`Running asar with the options ${JSON.stringify(asarOptions)}`)
  asar.createPackageWithOptions(appPath, dest, asarOptions, function (err) {
    if (err) return cb(err)
    fs.remove(appPath, function (err) {
      if (err) return cb(err)
      cb(null, dest)
    })
  })
}

function copyExtraResources (operations, resourcesPath, extraResources) {
  if (!Array.isArray(extraResources)) extraResources = [extraResources]

  for (const resource of extraResources) {
    operations.push(cb => {
      fs.copy(resource, path.join(resourcesPath, path.basename(resource)), cb)
    })
  }
}

function isPlatformMac (platform) {
  return platform === 'darwin' || platform === 'mas'
}

function sanitizeAppName (name) {
  return sanitize(name, {replacement: '-'})
}

function generateFinalBasename (opts) {
  return `${sanitizeAppName(opts.name)}-${opts.platform}-${opts.arch}`
}

function generateFinalPath (opts) {
  return path.join(opts.out || process.cwd(), generateFinalBasename(opts))
}

function info (message, quiet) {
  if (!quiet) {
    console.error(message)
  }
}

function warning (message, quiet) {
  if (!quiet) {
    console.warn(`WARNING: ${message}`)
  }
}

function subOptionWarning (properties, optionName, parameter, value, quiet) {
  if (properties.hasOwnProperty(parameter)) {
    warning(`${optionName}.${parameter} will be inferred from the main options`, quiet)
  }
  properties[parameter] = value
}

function baseTempDir (opts) {
  return path.join(opts.tmpdir || os.tmpdir(), 'electron-packager')
}

function createAsarOpts (opts) {
  let asarOptions
  if (opts.asar === true) {
    asarOptions = {}
  } else if (typeof opts.asar === 'object') {
    asarOptions = opts.asar
  } else if (opts.asar === false || opts.asar === undefined) {
    return false
  } else {
    warning(`asar parameter set to an invalid value (${opts.asar}), ignoring and disabling asar`)
    return false
  }

  return asarOptions
}

function createDownloadOpts (opts, platform, arch) {
  let downloadOpts = Object.assign({}, opts.download)

  subOptionWarning(downloadOpts, 'download', 'platform', platform, opts.quiet)
  subOptionWarning(downloadOpts, 'download', 'arch', arch, opts.quiet)
  subOptionWarning(downloadOpts, 'download', 'version', opts.electronVersion, opts.quiet)

  return downloadOpts
}

module.exports = {
  parseCLIArgs: parseCLIArgs,

  isPlatformMac: isPlatformMac,

  subOptionWarning: subOptionWarning,

  baseTempDir: baseTempDir,

  createAsarOpts: createAsarOpts,

  createDownloadCombos: function createDownloadCombos (opts, selectedPlatforms, selectedArchs, ignoreFunc) {
    return targets.createPlatformArchPairs(opts, selectedPlatforms, selectedArchs, ignoreFunc).map((combo) => {
      const platform = combo[0]
      const arch = combo[1]
      return createDownloadOpts(opts, platform, arch)
    })
  },
  createDownloadOpts: createDownloadOpts,

  deprecatedParameter: function deprecatedParameter (properties, oldName, newName, newCLIName) {
    if (properties.hasOwnProperty(oldName)) {
      warning(`The ${oldName} parameter is deprecated, use ${newName} (or --${newCLIName} in the CLI) instead`)
      if (!properties.hasOwnProperty(newName)) {
        properties[newName] = properties[oldName]
      }
      delete properties[oldName]
    }
  },

  downloadElectronZip: function downloadElectronZip (downloadOpts, cb) {
    // armv7l builds have only been backfilled for Electron >= 1.0.0.
    // See: https://github.com/electron/electron/pull/6986
    if (downloadOpts.arch === 'armv7l' && semver.lt(downloadOpts.version, '1.0.0')) {
      downloadOpts.arch = 'arm'
    }
    debug(`Downloading Electron with options ${JSON.stringify(downloadOpts)}`)
    download(downloadOpts, cb)
  },

  generateFinalBasename: generateFinalBasename,
  generateFinalPath: generateFinalPath,

  info: info,

  initializeApp: function initializeApp (opts, templatePath, appRelativePath, callback) {
    // Performs the following initial operations for an app:
    // * Creates temporary directory
    // * Copies template into temporary directory
    // * Copies user's app into temporary directory
    // * Prunes non-production node_modules (if opts.prune is either truthy or undefined)
    // * Creates an asar (if opts.asar is set)

    var tempPath
    if (opts.tmpdir === false) {
      tempPath = generateFinalPath(opts)
    } else {
      tempPath = path.join(baseTempDir(opts), `${opts.platform}-${opts.arch}`, generateFinalBasename(opts))
    }

    debug(`Initializing app in ${tempPath} from ${templatePath} template`)

    // Path to `app` directory
    var appPath = path.join(tempPath, appRelativePath)
    var resourcesPath = path.resolve(appPath, '..')

    var operations = [
      function (cb) {
        fs.move(templatePath, tempPath, {clobber: true}, cb)
      },
      function (cb) {
        fs.copy(opts.dir, appPath, {filter: ignore.userIgnoreFilter(opts), dereference: opts.derefSymlinks}, cb)
      },
      function (cb) {
        var afterCopyHooks = (opts.afterCopy || []).map(function (afterCopyFn) {
          return function (cb) {
            afterCopyFn(appPath, opts.electronVersion, opts.platform, opts.arch, cb)
          }
        })
        series(afterCopyHooks, cb)
      },
      function (cb) {
        // Support removing old default_app folder that is now an asar archive
        fs.remove(path.join(resourcesPath, 'default_app'), cb)
      },
      function (cb) {
        fs.remove(path.join(resourcesPath, 'default_app.asar'), cb)
      }
    ]

    // Prune and asar are now performed before platform-specific logic, primarily so that
    // appPath is predictable (e.g. before .app is renamed for mac)
    if (opts.prune || opts.prune === undefined) {
      operations.push(function (cb) {
        pruneModules(opts, appPath, cb)
      })
      operations.push(function (cb) {
        var afterPruneHooks = (opts.afterPrune || []).map(function (afterPruneFn) {
          return function (cb) {
            afterPruneFn(appPath, opts.electronVersion, opts.platform, opts.arch, cb)
          }
        })
        series(afterPruneHooks, cb)
      })
    }

    let asarOptions = createAsarOpts(opts)
    if (asarOptions) {
      operations.push(function (cb) {
        asarApp(appPath, asarOptions, cb)
      })
    }

    if (opts.extraResource) {
      copyExtraResources(operations, resourcesPath, opts.extraResource)
    }

    series(operations, function (err) {
      if (err) return callback(err)
      // Resolve to path to temporary app folder for platform-specific processes to use
      callback(null, tempPath)
    })
  },

  moveApp: function finalizeApp (opts, tempPath, callback) {
    var finalPath = generateFinalPath(opts)

    if (opts.tmpdir === false) {
      callback(null, finalPath)
      return
    }

    debug(`Moving ${tempPath} to ${finalPath}`)
    fs.move(tempPath, finalPath, function (err) {
      callback(err, finalPath)
    })
  },

  normalizeExt: function normalizeExt (filename, targetExt, cb) {
    // Forces a filename to a given extension and fires the given callback with the normalized filename,
    // if it exists.  Otherwise reports the error from the fs.stat call.
    // (Used for resolving icon filenames, particularly during --all runs.)

    // This error path is used by win32.js if no icon is specified
    if (!filename) return cb(new Error('No filename specified to normalizeExt'))

    var ext = path.extname(filename)
    if (ext !== targetExt) {
      filename = filename.slice(0, filename.length - ext.length) + targetExt
    }

    fs.stat(filename, function (err) {
      cb(err, err ? null : filename)
    })
  },

  rename: function rename (basePath, oldName, newName, cb) {
    debug(`Renaming ${oldName} to ${newName} in ${basePath}`)
    fs.rename(path.join(basePath, oldName), path.join(basePath, newName), cb)
  },
  sanitizeAppName: sanitizeAppName,
  warning: warning
}
