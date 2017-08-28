const GraphicsMagick = require('gm')
const Asset = require('./Asset.js')
const Fs = require('fs')

class Generator {

  generate(path, choice) {
    const assets = this.makeAssets(choice)

    // folder

    // json

    // images
  }

  // Helper

  makeAssets(choice) {
    switch (choice) {
      case 'iOS (iPhone)':
        return Asset.iOS_iPhone()
      case 'iOS (iPad)':
        return Asset.iOS_iPad()
      case 'iOS (Universal)':
        return Asset.iOS()
      case 'macOS':
        return Asset.macOS()
      case 'tvOS':
        return Asset.tvOS()
      case 'watchOS':
        return Asset.watchOS()
    }
  }
}


module.exports = Generator