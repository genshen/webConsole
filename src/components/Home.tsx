import React from 'react'
import { NavLink, Route, Switch } from 'react-router-dom'
import { Button, Pane, Heading } from 'evergreen-ui'
import { useTranslation } from 'react-i18next'

import Footer from './layout/Footer'
import Header from './layout/Header'
import Signin from './Signin'

import './home.less'
import headerLogo from '../assets/ssh.png'

const MainPage = () => {
  const { t } = useTranslation(['home'])
  return (
    <>
      <Pane
        alignItems="center"
        justifyContent="center"
        display="flex"
        flexDirection="column">
        <div
          style={{
            minHeight: '360px',
            marginTop: '10rem',
            textAlign: 'center',
          }}>
          <img src={headerLogo} className="App-logo" alt="logo" />
          <Heading marginBottom="0.6rem" marginTop="0.6rem" size={700}>
            {t('home:welcome')}
          </Heading>
          <div>
            <NavLink to="/signin" className="focus-ring-link">
              <Button appearance="primary"> {t('home:goto_signin')} </Button>
            </NavLink>
          </div>
        </div>
      </Pane>
    </>
  )
}

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-content-header">
        <Header />
      </header>
      <main className="home-content-main main-content-container">
        <Switch>
          <Route exact path={`/`} component={MainPage} />
          <Route path={`/signin`} component={Signin} />
        </Switch>
      </main>
      <footer className="home-content-footer">
        <Footer />
      </footer>
    </div>
  )
}

export default Home
