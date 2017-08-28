const Sharp = require('sharp')
const Asset = require('.Asset.js')

class Generator {

  generate(platform) {
    const assets = this.makeAssets(platform)
  }

  // Helper

  makeAssets(platform) {
    switch (platform) {
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