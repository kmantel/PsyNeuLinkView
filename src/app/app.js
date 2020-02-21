// import packages
import React from 'react';

// import css
import '../css/app.css';

// import components
import WorkSpace from '../components/workspace'

var log = require('electron-log');

log.transports.console.level = "debug";

export default class App extends React.Component{
  render() {
    return (
        <div className = "app">
          <WorkSpace/>
        </div>
    );
  }
}

// export default App;
