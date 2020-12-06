import React from 'react';
import { Route } from 'react-router-dom';
import Console from './components/Console';
import Home from './components/Home';

function App() {
  return (
    <div className="App">
      <Route path="/" component={Home} />
      <Route path="/console" exact component={Console} />
    </div>
  );
}

export default App
