import React from 'react'
import ReactDOM from 'react-dom'
import Paper from '@material-ui/core/Paper'
import RadioButtonGroup from '@material-ui/core/RadioGroup'
import RadioButton from '@material-ui/core/Radio'
import RaisedButton from '@material-ui/core/Button'
import CardText from '@material-ui/core/DialogContentText'
import sizeOf from 'image-size'
import Generator from '../library/Generator'

class InputComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      choice: 'iOS (iPhone)'
    }

    this.handleChoiceChange = this.handleChoiceChange.bind(this)
    this.handleGenerate = this.handleGenerate.bind(this)
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

  handleChoiceChange(event, value) {
    this.setState({
      choice: value
    })
  }

  handleGenerate() {
    const generator = new Generator()
    generator.generate(this.props.file.path, this.state.choice)
  }

  // make

  makeImage() {
    const divOptions = {
      style: {
        flex: 1.5,
        padding: '10px'
      }
    }

    const paperOptions = {
      style: {
        width: '100%',
        height: '100%'
      }
    }

    return (
      <div style={divOptions.style}>
        <Paper style={paperOptions.style}>
          {this.makeImageElement()}
          {this.makeImageDescriptionElement()}
        </Paper>
      </div>
    )
  }

  makeImageElement() {
    let path
    if (this.props.file !== undefined) {
      path = this.props.file.path
    } else {
      path = ''
    }

    const divOptions = {
      style: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '20px'
      }
    }

    const imgOptions = {
      style: {
        width: '300px',
        height: '300px',
        border: '1px solid black'
      },
      src: path
    }

    return React.createElement('div', divOptions,
      React.createElement('img', imgOptions)
    )
  }

  makeImageDescriptionElement() {
    let text
    if (this.props.file !== undefined) {
      const size = sizeOf(this.props.file.path)
      const sizeDescription = size.width + 'x' + size.height
      text = this.props.file.name + ' (' + sizeDescription + ')'
    } else {
      text = 'Drag image onto the above box. Prefer 1024x1024 or larger'
    }

    const divOptions = {
      style: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px'
      }
    }

    const textOptions = {
      style: {
        textAlign: 'center'
      }
    }

    return React.createElement('div', divOptions, 
      React.createElement(CardText, textOptions, text)
    )
  }

  makeChoices() {
    const divOptions = {
      style: {
        flex: 1,
        padding: '10px'
      }
    }

    const paperOptions = {
      style: {
        paddingTop: '10px',
        paddingBottom: '10px'
      }
    }

    const choices = [
      "iOS (iPhone)", "iOS (iPad)", "iOS (Universal)", "macOS", "macOS (Icns)"
    ]

    const choiceElements = choices.map((name) => {
      const options = {
        value: name,
        label: name,
        key: name
      }

      return React.createElement(RadioButton, options)
    })

    const groupOptions = {
      name: 'choices',
      defaultselected: this.state.choice,
      onChange: this.handleChoiceChange,
      style: {
        paddingLeft: '10px'
      }
    }

    return React.createElement('div', divOptions,
      React.createElement(Paper, paperOptions,
        React.createElement(RadioButtonGroup, groupOptions, 
          choiceElements
        ),
        this.makeGenerateElement()
      )
    )
  }

  makeGenerateElement() {
    const divOptions = {
      style: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px'
      }
    }

    const buttonOptions = {
      backgroundcolor: '#EB394E', 
      onChange: this.handleGenerate,
      disabled: this.props.file === undefined,
      variant: "contained",
      style: {
        width: '80%'
      }
    }

    return React.createElement('div', divOptions, 
      React.createElement(RaisedButton, buttonOptions, 'Generate')
    )
  }
}

module.exports = InputComponent