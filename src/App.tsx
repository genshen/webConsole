import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Console from './components/Console';
import Home from './components/Home';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/console" exact component={Console} />
        <Route path="/" component={Home} />
      </Switch>
    </div>
  );
}

export default App
