class Asset {
  constructor(size, scale) {
    this.size = size
    this.scale = scale
  }

  // https://developer.apple.com/ios/human-interface-guidelines/graphics/app-icon/#app-icon-sizes
  static iOS() {
    this.iOS_iPhone() + this.iOS_iPad()
  }

  static iOS_iPhone() {

  }

  static iOS_iPad() {

  }

  // https://developer.apple.com/macos/human-interface-guidelines/icons-and-images/app-icon/
  static macOS() {

  }

  // https://developer.apple.com/watchos/human-interface-guidelines/icons-and-images/app-icon/
  static watchOS() {

  }

  // https://developer.apple.com/tvos/human-interface-guidelines/icons-and-images/app-icon/
  static tvOS() {
    return this.tvOS_38mm() + this.tvOS_42mm()
  }

  static tvOS_38mm() {
    return [
      Asset(24, [2]),
      Asset(40, [2]),
      Asset(86, [2]),
      Asset(29, [2])
    ]
  }
  
  static tvOS_42mm() {
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