'use strict';

var _jsxFileName = 'src/components/InputComponent.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _Paper = require('@material-ui/core/Paper');

var _Paper2 = _interopRequireDefault(_Paper);

var _RadioGroup = require('@material-ui/core/RadioGroup');

var _RadioGroup2 = _interopRequireDefault(_RadioGroup);

var _Radio = require('@material-ui/core/Radio');

var _Radio2 = _interopRequireDefault(_Radio);

var _Button = require('@material-ui/core/Button');

var _Button2 = _interopRequireDefault(_Button);

var _FormControlLabel = require('@material-ui/core/FormControlLabel');

var _FormControlLabel2 = _interopRequireDefault(_FormControlLabel);

var _DialogContentText = require('@material-ui/core/DialogContentText');

var _DialogContentText2 = _interopRequireDefault(_DialogContentText);

var _imageSize = require('image-size');

var _imageSize2 = _interopRequireDefault(_imageSize);

var _Generator = require('../library/Generator');

var _Generator2 = _interopRequireDefault(_Generator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InputComponent = function (_React$Component) {
  _inherits(InputComponent, _React$Component);

  function InputComponent(props) {
    _classCallCheck(this, InputComponent);

    var _this = _possibleConstructorReturn(this, (InputComponent.__proto__ || Object.getPrototypeOf(InputComponent)).call(this, props));

    _this.state = {
      choice: 'iOS (iPhone)'
    };

    _this.handleChoiceChange = _this.handleChoiceChange.bind(_this);
    _this.handleGenerate = _this.handleGenerate.bind(_this);
    return _this;
  }

  _createClass(InputComponent, [{
    key: 'render',
    value: function render() {
      var styles = {
        div: {
          display: 'flex',
          alignSelf: 'stretch',
          width: '100%'
        }
      };

      return _react2.default.createElement(
        'div',
        { style: styles.div, __source: {
            fileName: _jsxFileName,
            lineNumber: 34
          }
        },
        this.makeImage(),
        this.makeChoices()
      );
    }

    // action

  }, {
    key: 'handleChoiceChange',
    value: function handleChoiceChange(event, value) {
      this.setState({
        choice: value
      });
    }
  }, {
    key: 'handleGenerate',
    value: function handleGenerate() {
      var generator = new _Generator2.default();
      generator.generate(this.props.file.path, this.state.choice);
    }

    // make

  }, {
    key: 'makeImage',
    value: function makeImage() {
      var divOptions = {
        style: {
          flex: 1.5,
          padding: '10px'
        }
      };

      var paperOptions = {
        style: {
          width: '100%',
          height: '100%'
        }
      };

      return _react2.default.createElement(
        'div',
        { style: divOptions.style, __source: {
            fileName: _jsxFileName,
            lineNumber: 72
          }
        },
        _react2.default.createElement(
          _Paper2.default,
          { style: paperOptions.style, __source: {
              fileName: _jsxFileName,
              lineNumber: 73
            }
          },
          this.makeImageElement(),
          this.makeImageDescriptionElement()
        )
      );
    }
  }, {
    key: 'makeImageElement',
    value: function makeImageElement() {
      var path = void 0;
      if (this.props.file !== null) {
        path = this.props.file.path;
      } else {
        path = '';
      }

      var styles = {
        div: {
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '20px'
        },
        image: {
          width: '300px',
          height: '300px',
          border: '1px solid black'
        }
      };

      return _react2.default.createElement(
        'div',
        { style: styles.div, __source: {
            fileName: _jsxFileName,
            lineNumber: 103
          }
        },
        _react2.default.createElement('img', { style: styles.image, src: path, __source: {
            fileName: _jsxFileName,
            lineNumber: 104
          }
        })
      );
    }
  }, {
    key: 'makeImageDescriptionElement',
    value: function makeImageDescriptionElement() {
      var text = void 0;
      if (this.props.file !== null) {
        var size = (0, _imageSize2.default)(this.props.file.path);
        var sizeDescription = size.width + 'x' + size.height;
        text = this.props.file.name + ' (' + sizeDescription + ')';
      } else if (this.props.error !== null) {
        text = this.props.error;
      } else {
        text = 'Drag image onto the above box. Prefer 1024x1024 or larger';
      }

      var styles = {
        div: {
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px'
        },
        text: {
          textAlign: 'center'
        }
      };

      return _react2.default.createElement(
        'div',
        { style: styles.div, __source: {
            fileName: _jsxFileName,
            lineNumber: 133
          }
        },
        _react2.default.createElement(
          _DialogContentText2.default,
          { style: styles.text, __source: {
              fileName: _jsxFileName,
              lineNumber: 134
            }
          },
          text
        )
      );
    }
  }, {
    key: 'makeChoices',
    value: function makeChoices() {
      var styles = {
        div: {
          flex: 1,
          padding: '10px'
        },
        paper: {
          paddingTop: '10px',
          paddingBottom: '10px'
        },
        group: {
          paddingLeft: '10px'
        }
      };

      var choices = ["iOS (iPhone)", "iOS (iPad)", "iOS (Universal)", "macOS", "macOS (Icns)", "watchOS"];

      var choiceElements = choices.map(function (name) {
        return _react2.default.createElement(_FormControlLabel2.default, { value: name, control: _react2.default.createElement(_Radio2.default, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 160
            }
          }), label: name, key: name, __source: {
            fileName: _jsxFileName,
            lineNumber: 160
          }
        });
      });

      return _react2.default.createElement(
        'div',
        { style: styles.div, __source: {
            fileName: _jsxFileName,
            lineNumber: 165
          }
        },
        _react2.default.createElement(
          _Paper2.default,
          { style: styles.paper, __source: {
              fileName: _jsxFileName,
              lineNumber: 166
            }
          },
          _react2.default.createElement(_RadioGroup2.default, {
            style: styles.group,
            defaultselected: this.state.choice,
            onChange: this.handleChoiceChange,
            children: choiceElements, __source: {
              fileName: _jsxFileName,
              lineNumber: 167
            }
          }),
          this.makeGenerateButton()
        )
      );
    }
  }, {
    key: 'makeGenerateButton',
    value: function makeGenerateButton() {
      var styles = {
        div: {
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px'
        },
        button: {
          width: '80%'
        }
      };

      return _react2.default.createElement(
        'div',
        { style: styles.div, __source: {
            fileName: _jsxFileName,
            lineNumber: 191
          }
        },
        _react2.default.createElement(
          _Button2.default,
          {
            style: styles.button,
            color: 'secondary',
            onClick: this.handleGenerate,
            disabled: this.props.file === undefined,
            variant: 'contained', __source: {
              fileName: _jsxFileName,
              lineNumber: 192
            }
          },
          'Generate'
        )
      );
    }
  }]);

  return InputComponent;
}(_react2.default.Component);

module.exports = InputComponent;