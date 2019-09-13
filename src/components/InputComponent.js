import React from 'react'
import ReactDOM from 'react-dom'
import Paper from '@material-ui/core/Paper'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogContentText from '@material-ui/core/DialogContentText'
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
    const styles = {
      div: {
        display: 'flex',
        alignSelf: 'stretch',
        width: '100%'
      }
    }

    return (
      <div style={styles.div}>
        {this.makeImage()}
        {this.makeChoices()}
      </div>
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

    const styles = {
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
    }

    return (
      <div style={styles.div}>
        <img style={styles.image} src={path} />
      </div>
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
    
    const styles = {
      div: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px'
      },
      text: {
        textAlign: 'center'
      }
    }

    return (
      <div style={styles.div}>
        <DialogContentText style={styles.text}>{text}</DialogContentText>
      </div>
    )
  }

  makeChoices() {
    const styles = {
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
    }

    const choices = [
      "iOS (iPhone)", "iOS (iPad)", "iOS (Universal)", "macOS", "macOS (Icns)"
    ]

    const choiceElements = choices.map((name) => {
      return (
        <FormControlLabel value={name} control={<Radio />} label={name} key={name} />
      )
    })

    return (
      <div style={styles.div}>
        <Paper style={styles.paper}>
          <RadioGroup 
            style={styles.group} 
            defaultselected={this.state.choice} 
            onChange={this.handleChoiceChange}
            children={choiceElements} />
          {this.makeGenerateButton()}
        </Paper>
      </div>
    )
  }

  makeGenerateButton() {
    const styles = {
      div: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px'
      },
      button: {
        width: '80%'
      }
    }

    return (
      <div style={styles.div}>
        <Button 
          style={styles.button}
          onClick={this.handleGenerate}
          disabled={this.props.file === undefined} 
          variant='contained'>
          Generate
        </Button>
      </div>
    )
  }
}

module.exports = InputComponent