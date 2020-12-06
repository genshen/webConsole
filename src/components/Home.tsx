import React from 'react';
import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom';
import { Button, Pane, Heading } from 'evergreen-ui';

import Footer from './layout/Footer'
import Header from './layout/Header'
import Signin from './Signin'

import "./home.less"
import headerLogo from '../assets/ssh.png'

const MainPage = () => {
  return (<>
    <Pane alignItems="center" justifyContent="center" display="flex" flexDirection="column">
      <div style={{minHeight: "360px", marginTop: "10rem", textAlign: 'center'}}>
        <img src={headerLogo} className="App-logo" alt="logo" />
        <Heading marginBottom="0.6rem" marginTop="0.6rem"  size={700}>@Welcome to SSH Web Console!</Heading>
        <div>
          <NavLink to="/signin"  className="focus-ring-link">    
            <Button appearance="primary">@Goto Signin Page</Button>
          </NavLink>
        </div>
      </div>
    </Pane>
  </>)
}

const Home = () => {
  const { path } = useRouteMatch()
  return (
    <div className="home-container" >
      <header className="home-content-header">
        <Header/>
      </header>
      <main className="home-content-main main-content-container">
        <Switch>
          <Route exact path={`/`} component={MainPage} />
          <Route path={`/signin`} component={Signin} />
        </Switch>
      </main>
      <footer className="home-content-footer">
        <Footer/>
      </footer>
    </div>
  );
}

export default Home
