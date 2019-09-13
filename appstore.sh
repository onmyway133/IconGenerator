npx electron-packager . "IconGenerator" --app-bundle-id=com.onmyway133.IconGenerator --helper-bundle-id=com.onmyway133.IconGenerator.helper --app-version=1.3.0 --build-version=3 --platform=mas --arch=x64 --icon=Icon/Icon.icns --overwrite
npx electron-osx-sign "IconGenerator-mas-x64/IconGenerator.app" --verbose
npx electron-osx-flat "IconGenerator-mas-x64/IconGenerator.app" --verbose
