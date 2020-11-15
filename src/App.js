import logo from './logo.svg'
import './App.css'
import WebCamStream from './components/WebCamStream'
import WebCamAframe from './components/WebCamAframe'
import Details from './components/Details'
import { NavLink, Switch, Route, Link } from 'react-router-dom'

const App = () => (
  <div className='app'>
    <Main />
  </div>
)

const Home = () => (
  <div className='home'>
    <WebCamStream />
    <img src={process.env.PUBLIC_URL +'/gs1-resolver.jpg'} height='150px' />
  </div>
)

const Detail = () => (
  <div className='detail'>
    <Details />
    <img src={process.env.PUBLIC_URL +'/gs1-resolver.jpg'} height='150px' />
  </div>
)

const Main = () => (
  <Switch>
    <Route exact path='/' component={Home} />
    <Route exact path='/detail' component={Detail} />
  </Switch>
)

export default App
