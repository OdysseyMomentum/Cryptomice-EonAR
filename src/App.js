import logo from './logo.svg';
import './App.css';
import WebCamStream from './components/WebCamStream';
import WebCamAframe from './components/WebCamAframe';
import Details from './components/Details';
 
function App() {
  return (
    <div className="App">
      <header className="App-header">
		<WebCamStream/>
		<Details/>
		<img src="http://localhost:3000/OdysseyMomentum/Cryptomice-EonAR/gs1-resolver.jpg" height="150px"/>
      </header>
    </div>
  );
}

export default App;
