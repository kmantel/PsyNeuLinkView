// import packages
import React from 'react';

// import css
import '../css/app.css';

// import components
import Workspace from '../components/workspace'

var log = require('electron-log');

log.transports.console.level = "debug";
console.log('hey');

export default class App extends React.Component{
  render() {
    return (
        <div className = "app">
          <Workspace/>
        </div>
    );
  }
}

// export default App;
