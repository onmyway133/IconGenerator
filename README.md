# 𝕴𝖈𝖔𝖓 𝕲𝖊𝖓𝖊𝖗𝖆𝖙𝖔𝖗

<div align = "center">
<img src="Screenshots/gif.gif" width="800"/>
</div>

## Description

- An `electron.js` app used for generating app icons
- Support macOS
- Follow [Human Interface Guidelines iOS](https://developer.apple.com/ios/human-interface-guidelines/graphics/app-icon/)
- Generate based on latest Xcode [Contents.json](https://developer.apple.com/library/content/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/Contents.html)

## How to install

- Download latest release from https://github.com/onmyway133/IconGenerator/releases

## How to use

- Drag image onto left box
- Support `png`, `jpeg`, `jpg`, `webp`, `tiff`, `gif`, `svg`
- Choose platform to generate
- Generated `AppIcon.appiconset` and save to `Downloads` folder

<div align = "center">
<img src="Screenshots/banner.png" width="600"/>
</div>

### Generate `icns`

- `IconGenerator` names file in `icon_size` format, to make it work for `iconutil`
- Go to the folder where `AppIcon.appiconset` is stored, rename it to `AppIcon.iconset`, delete `Contents.json`, then run

```sh
iconutil -c icns "AppIcon.iconset"
```


## Credit

- Icon http://emojione.com/
- Use [sharp](https://github.com/lovell/sharp) to resize images

## Author

Khoa Pham, onmyway133@gmail.com

## License

**IconGenerator** is available under the MIT license. See the [LICENSE](https://github.com/onmyway133/IconGenerator/blob/master/LICENSE.md) file for more info.
