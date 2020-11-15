import logo from './logo.svg'
import './App.css'
import WebCamStream from './components/WebCamStream'
//import WebCamAframe from './components/WebCamAframe'
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
  </div>
)

const Detail = () => (
  <div className='detail'>
    <Details />
  </div>
)

const Main = () => (
  <Switch>
    <Route exact path='/' component={Home} />
    <Route exact path='/detail/:id'  component={Detail} />
  </Switch>
)

export default App
