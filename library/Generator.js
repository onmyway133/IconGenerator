const GraphicsMagick = require('gm')
const Asset = require('./Asset.js')

class Generator {

  generate(path, choice) {
    const assets = this.makeAssets(choice)

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
    }
  }
}


module.exports = Generator