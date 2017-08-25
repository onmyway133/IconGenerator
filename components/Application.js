const React = require('react')
const ReactDOM = require('react-dom')
const Paper = require('material-ui').Paper

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