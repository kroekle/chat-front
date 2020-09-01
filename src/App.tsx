import React, { useState } from 'react';
import logo from './logo.png';
import Paper from '@material-ui/core/Paper';
import './App.css';
import Chat from './Chat';
import { People } from './gen/chat_pb';
import Users from './Users';

function App() {
  const [people, setPeople] = useState<People|undefined>(undefined);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className="App-body">
        <Paper className="User-body">
          <Users people={people}/>
        </Paper>
        <Paper className="Message-body">
          <Chat setPeople={setPeople}/> 
        </Paper>
      </div>
    </div>
  );
}

export default App;
