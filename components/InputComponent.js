const React = require('react')
const ReactDOM = require('react-dom')
const Paper = require('material-ui').Paper
const RadioButtonGroup = require('material-ui').RadioButtonGroup
const RadioButton = require('material-ui').RadioButton

class InputComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      choice: 'iOS'
    }

    this.handleChoiceChange = this.handleChoiceChange.bind(this)
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

  // action

  handleChoiceChange(value) {
    this.setState({
      choice: value
    })
  }

  // make

  makeImage() {
    const divOptions = {
      style: {
        flex: 1,
        padding: '10px'
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
        flex: 1,
        padding: '10px'
      }
    }

    const choices = [
      "iOS", "macOS", "tvOS", "watchOS"
    ]

    const choiceElements = choices.map((name) => {
      const options = {
        value: name,
        label: name,
        key: name
      }

      return React.createElement('RadioButton', options)
    })

    const groupOptions = {
      name: 'choices',
      defaultSelected: this.state.choice,
      onChange: this.handleChoiceChange
    }

    return React.createElement('div', divOptions,
      React.createElement(Paper, {},
        React.createElement(RadioButtonGroup, groupOptions, 
          choiceElements
        )
      )
    )
  }
}

module.exports = InputComponent