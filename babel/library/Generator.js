'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sharp = require('sharp');
var Fs = require('fs');
var Os = require('os');
var rimraf = require('rimraf');
var Shell = require('electron').shell;
var execSync = require('child_process').execSync;

var Generator = function () {
  function Generator() {
    _classCallCheck(this, Generator);
  }

  _createClass(Generator, [{
    key: 'generate',
    value: function generate(originalImagePath, choice) {
      var _this = this;

      var contentsJson = this.makeContentsJson(choice);
      var downloadPath = Os.homedir().concat('/Downloads');
      var folderPath = downloadPath.concat('/AppIcon.appiconset');

      this.writeFolder(folderPath);
      this.writeContentsJson(contentsJson, folderPath);
      this.writeImages(originalImagePath, contentsJson, folderPath).then(function () {
        console.log(originalImagePath, folderPath, choice);
        if (choice === 'macOS (Icns)') {
          var iconsetPath = downloadPath.concat('/AppIcon.iconset');
          Fs.renameSync(folderPath, iconsetPath);
          Fs.unlinkSync(iconsetPath + '/Contents.json');
          execSync('iconutil -c icns ' + iconsetPath);
          _this.showFinder(iconsetPath);
          if (Fs.existsSync(iconsetPath)) {
            rimraf.sync(iconsetPath);
          }
        } else {
          _this.showFinder(folderPath);
        }
      });
    }

    // Helper

  }, {
    key: 'showFinder',
    value: function showFinder(path) {
      Shell.showItemInFolder(path);
    }
  }, {
    key: 'writeFolder',
    value: function writeFolder(folderPath) {
      if (Fs.existsSync(folderPath)) {
        rimraf.sync(folderPath);
      }

      Fs.mkdirSync(folderPath);
    }
  }, {
    key: 'writeContentsJson',
    value: function writeContentsJson(json, folderPath) {
      var path = folderPath.concat('/Contents.json');
      Fs.writeFileSync(path, JSON.stringify(json, null, 2).replace(new RegExp(": ", "g"), " : "));
    }
  }, {
    key: 'writeImages',
    value: function writeImages(originalImagePath, contentsJson, folderPath) {
      return Promise.all(contentsJson.images.map(function (object) {
        var output = folderPath.concat('/' + object.filename);
        var size = object.size.split('x')[0];
        var scale = object.scale.replace('x', '');
        var finalSize = size * scale;

        return new Promise(function (resolve) {
          Sharp(originalImagePath).resize(finalSize, finalSize).toFile(output, function (error, info) {
            resolve();
          });
        });
      }));
    }
  }, {
    key: 'makeContentsJson',
    value: function makeContentsJson(choice) {
      var idioms = this.idioms(choice);
      var content = Fs.readFileSync(__dirname + '/Contents.json', 'utf8');
      var json = JSON.parse(content);

      json.images = json.images.filter(function (object) {
        return idioms.includes(object.idiom);
      }).map(function (object) {
        var size = object.size.split('x')[0];
        object.filename = 'icon_' + size + '@' + object.scale + '.png';

        return object;
      });

      return json;
    }
  }, {
    key: 'idioms',
    value: function idioms(choice) {
      switch (choice) {
        case 'iOS (iPhone)':
          return ['iphone', 'ios-marketing'];
        case 'iOS (iPad)':
          return ['ipad', 'ios-marketing'];
        case 'iOS (Universal)':
          return ['iphone', 'ipad', 'ios-marketing'];
        case 'macOS':
          return ['mac'];
        case 'macOS (Icns)':
          return ['mac'];
        case 'watchOS':
          return ['watch', 'watch-marketing'];
        default:
          return [];
      }
    }
  }]);

  return Generator;
}();

module.exports = Generator;