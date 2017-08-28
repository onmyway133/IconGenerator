class Asset {
  constructor(size, scale) {
    this.size = size
    this.scale = scale
  }

  // https://developer.apple.com/ios/human-interface-guidelines/graphics/app-icon/#app-icon-sizes
  iOS() {
    this.iOS_iPhone() + this.iOS_iPad()
  }

  iOS_iPhone() {

  }

  iOS_iPad() {

  }

  // https://developer.apple.com/macos/human-interface-guidelines/icons-and-images/app-icon/
  macOS() {

  }

  // https://developer.apple.com/watchos/human-interface-guidelines/icons-and-images/app-icon/
  watchOS() {

  }

  // https://developer.apple.com/tvos/human-interface-guidelines/icons-and-images/app-icon/
  tvOS() {

  }
}

module.exports = Asset