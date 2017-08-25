const React = require('react')
const ReactDOM = require('react-dom')
const Paper = require('material-ui').Paper

class InputComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      
    }
  }

  render() {
    const divOptions = {
      style: {
        display: 'flex',
        alignSelf: 'stretch',
        width: '100%'
      }
    }

    return React.createElement('div', divOptions, 
      this.makeImage(),
      this.makeChoices()    
    )
  }

  makeImage() {
    const divOptions = {
      style: {
        flex: 1
      }
    }

    const paperOptions = {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center'
      }
    }

    const imgOptions = {
      style: {
        width: '50%',
        alignSelf: 'center'
      },
      src: 'http://html.com/wp-content/uploads/flamingo.jpg'
    }

    return React.createElement('div', divOptions,
      React.createElement(Paper, paperOptions,
        React.createElement('img', imgOptions)
      )
    )
  }

  makeChoices() {
    const divOptions = {
      style: {
        flex: 1
      }
    }

    return React.createElement('div', divOptions,
      React.createElement(Paper, {})
    )
  }
}

module.exports = InputComponent