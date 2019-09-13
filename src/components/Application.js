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
    const styles = {
      div: {
        width: '100%',
        alignSelf: 'stretch',
        display: 'flex',
        backgroundcolor: '#F8F8F0'
      }
    }

    return (
      <MuiThemeProvider>
        <div style={styles.div}>
          <InputComponent file={this.props.file} error={this.props.error} />
        </div>
      </MuiThemeProvider>
    )
  }
}

module.exports = Application