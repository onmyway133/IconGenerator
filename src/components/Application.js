const React = require('react')
const ReactDOM = require('react-dom')
const Paper = require('@material-ui/core/Paper')
const MuiThemeProvider = require('material-ui/styles/').MuiThemeProvider
const InputComponent = require('./InputComponent.js')

// http://www.material-ui.com/#/get-started/installation
// injectTapEventPlugin()

class Application extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const divOptions = {
      style: {
        width: '100%',
        alignSelf: 'stretch',
        display: 'flex',
        backgroundColor: '#F8F8F0'
      }
    }

    const inputOptions = {
      file: this.props.file
    }

    return React.createElement(MuiThemeProvider, {},
      React.createElement('div', divOptions,
        React.createElement(InputComponent, inputOptions) 
      )
    )
  }
}

module.exports = Application