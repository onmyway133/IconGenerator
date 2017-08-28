class Asset {
  constructor(size, scale, idiom = '') {
    this.size = size
    this.scale = scale
    this.idiom = idiom
  }

  // https://developer.apple.com/ios/human-interface-guidelines/graphics/app-icon/#app-icon-sizes
  static iOS() {
    this.iOS_iPhone() + this.iOS_iPad()
  }

  static iOS_iPhone() {
    return [

    ]
  }

  static iOS_iPad() {
    return [

    ]
  }

  // https://developer.apple.com/macos/human-interface-guidelines/icons-and-images/app-icon/
  static macOS() {
    return [

    ]
  }

  // https://developer.apple.com/watchos/human-interface-guidelines/icons-and-images/app-icon/
  static watchOS() {
    return [
      
    ]
  }

  // https://developer.apple.com/tvos/human-interface-guidelines/icons-and-images/app-icon/
  static tvOS() {
    return this.tvOS_38mm() + this.tvOS_42mm()
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