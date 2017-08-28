const Sharp = require('sharp')
const Asset = require('./Asset.js')
const Fs = require('fs')
const Os = require('os')
const rimraf = require('rimraf')

class Generator {

  generate(path, choice) {
    const assets = this.makeAssets(choice)
    const downloadPath = Os.homedir().concat('/Downloads')
    const folderPath = downloadPath.concat('/Icon.appiconset')

    this.writeFolder(folderPath)
    this.writeContents(assets, folderPath)
    this.writeImages(path, assets, folderPath)
  }

  // Helper

  writeFolder(folderPath) {
    if (Fs.existsSync(folderPath)) {
      rimraf.sync(folderPath)
    }

    Fs.mkdirSync(folderPath)
  }

  writeContents(assets, folderPath) {
    const path = folderPath.concat('/Contents.json')
    const json = this.makeContentsJson(assets)
    Fs.writeFileSync(path, JSON.stringify(json))
  }

  writeImages(path, assets, folderPath) {
    assets.forEach((asset) => {
      const output = folderPath.concat(`/${asset.filename}`)
      
    })
  }

  makeContentsJson(assets) {
    const images = assets.map((asset) => {
      return {
        size: `${asset.size}x${asset.size}`,
        idiom: asset.idiom,
        filename: asset.filename,
        scale: `${asset.scale}x`
      }
    })

    return {
      images,
      info: {
        version: 1,
        author: 'xcode'
      }
    }
  }

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
      default:
        console.log('huh')
    }
  }
}


module.exports = Generator