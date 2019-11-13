// import packages
import React from 'react';

// import css
import '../css/app.css';

// import components
import Workspace from '../components/workspace'

var log = require('electron-log');

log.transports.console.level = "debug";
console.log('hey');

function App() {
  return (
    <div className = "app">
      <Workspace/>
    </div>
  );
}

export default App;
