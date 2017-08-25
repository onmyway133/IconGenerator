const React = require('react')
const ReactDOM = require('react-dom')
const injectTapEventPlugin = require('react-tap-event-plugin')
const Paper = require('material-ui').Paper

// http://www.material-ui.com/#/get-started/installation
injectTapEventPlugin()

class Application extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      
    }
  }

  render() {
    return React.createElement('div', {},
      this.makeImage(),
      this.makeChoices()
    )
  }

  makeImage() {
    return React.createElement('div', {},
      React.createElement(Paper, {})
    )
  }

  makeChoices() {
    return React.createElement('div', {},
      React.createElement(Paper, {})
    )
  }
}

module.exports = Application