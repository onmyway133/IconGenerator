class Asset {
  constructor(size, scale, idiom = '') {
    this.size = size
    this.scale = scale
    this.idiom = idiom
  }

  // https://developer.apple.com/ios/human-interface-guidelines/graphics/app-icon/#app-icon-sizes
  static iOS() {
    return this.iOS_iPhone().concat(this.iOS_iPad())
  }

  static iOS_iPhone() {
    return [
      new Asset(1, [])
    ]
  }

  static iOS_iPad() {
    return [
      new Asset(1, [])
    ]
  }

  // https://developer.apple.com/macos/human-interface-guidelines/icons-and-images/app-icon/
  static macOS() {
    return [
      new Asset(1, [])
    ]
  }

  // https://developer.apple.com/watchos/human-interface-guidelines/icons-and-images/app-icon/
  static watchOS() {
    return [
      new Asset(1, [])
    ]
  }

  // https://developer.apple.com/tvos/human-interface-guidelines/icons-and-images/app-icon/
  static tvOS() {
    return this.tvOS_38mm().concat(this.tvOS_42mm())
  }

  static tvOS_38mm() {
    return [
      new Asset(24, [2]),
      new Asset(40, [2]),
      new Asset(86, [2]),
      new Asset(29, [2])
    ]
  }
  
  static tvOS_42mm() {
    return [
      new Asset(27.5, [2]),
      new Asset(44, [2]),
      new Asset(40, [2]),
      new Asset(98, [2]),
      new Asset(29, [3])
    ]
  }
}

module.exports = Asset