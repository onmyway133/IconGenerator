const React = require('react')
const ReactDOM = require('react-dom')
const Application = require('./components/Application.js')

// Reload
function reload(state = {}) {
  ReactDOM.render(
    React.createElement(Application, state),
    document.getElementById('root')
  )
}

// Drag and Drop
function handleDragDrop() {
  document.addEventListener('drop', (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.dataTransfer.files.length > 0) {
      reload({
        file: e.dataTransfer.files[0]
      })
    }
  })

  document.addEventListener('dragover', (e) =>  {
    e.preventDefault()
    e.stopPropagation()
  })
}

// Initially
handleDragDrop()
reload()