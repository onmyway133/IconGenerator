'use strict';

var _jsxFileName = 'src/components/Application.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var ReactDOM = require('react-dom');
var Paper = require('@material-ui/core/Paper');
var MuiThemeProvider = require('material-ui/styles/').MuiThemeProvider;
var InputComponent = require('./InputComponent.js');

// http://www.material-ui.com/#/get-started/installation
// injectTapEventPlugin()

var Application = function (_React$Component) {
  _inherits(Application, _React$Component);

  function Application(props) {
    _classCallCheck(this, Application);

    return _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).call(this, props));
  }

  _createClass(Application, [{
    key: 'render',
    value: function render() {
      var styles = {
        div: {
          width: '100%',
          alignSelf: 'stretch',
          display: 'flex',
          backgroundcolor: '#F8F8F0'
        }
      };

      return React.createElement(
        MuiThemeProvider,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 26
          }
        },
        React.createElement(
          'div',
          { style: styles.div, __source: {
              fileName: _jsxFileName,
              lineNumber: 27
            }
          },
          React.createElement(InputComponent, { file: this.props.file, error: this.props.error, __source: {
              fileName: _jsxFileName,
              lineNumber: 28
            }
          })
        )
      );
    }
  }]);

  return Application;
}(React.Component);

module.exports = Application;