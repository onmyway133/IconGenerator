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
    return this.tvOS_38mm() + this.tvOS_42mm()
  }

  tvOS_38mm() {
    return [
      Asset(24, [2]),
      Asset(40, [2]),
      Asset(86, [2]),
      Asset(29, [2])
    ]
  }
  
  tvOS_42mm() {
    return [
      Asset(27.5, [2]),
      Asset(44, [2]),
      Asset(40, [2]),
      Asset(98, [2]),
      Asset(29, [3])
    ]
  }
}

module.exports = Asset