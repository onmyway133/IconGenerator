'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Application = require('./components/Application.js');
var Path = require('path');

// Reload
function reload() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { file: null, error: null };

  ReactDOM.render(React.createElement(Application, state), document.getElementById('root'));
}

// Drag and Drop
function handleDragDrop() {
  document.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files.length <= 0) {
      return;
    }

    var file = e.dataTransfer.files[0];
    var extension = Path.extname(file.path).replace('.', '').toLowerCase();
    var support = ['png', 'jpeg', 'jpg', 'webp', 'tiff', 'gif', 'svg'];

    if (support.includes(extension)) {
      reload({
        file: file,
        error: null
      });
    } else {
      reload({
        file: null,
        error: 'This file is not yet supported!'
      });
    }
  });

  document.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
}

// Initially
handleDragDrop();
reload();