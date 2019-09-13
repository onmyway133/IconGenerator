const React = require('react')
const ReactDOM = require('react-dom')
const Application = require('./components/Application.js')
const Path = require('path')

// Reload
function reload(state = {file: nil, error: nil}) {
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
    
    if (e.dataTransfer.files.length <= 0) {
      return
    }

    const file = e.dataTransfer.files[0]
    const extension = Path.extname(file.path).replace('.', '').toLowerCase()
    const support = ['png', 'jpeg', 'jpg', 'webp', 'tiff', 'gif', 'svg']

    if (support.includes(extension)) {
      reload({
        file,
        error: nil
      })
    } else {
      reload({
        file: nil,
        error: 'This file is not yet supported'
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