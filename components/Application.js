const React = require('react')
const ReactDOM = require('react-dom')
const injectTapEventPlugin = require('react-tap-event-plugin')
const Paper = require('material-ui').Paper
const MuiThemeProvider = require('material-ui/styles/').MuiThemeProvider
const InputComponent = require('./InputComponent.js')

// http://www.material-ui.com/#/get-started/installation
injectTapEventPlugin()

class Application extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      
    }
  }

  render() {
    return React.createElement(MuiThemeProvider, {},
      React.createElement('div', {},
        React.createElement(InputComponent, {}) 
      )
    )
  }
}

module.exports = Application