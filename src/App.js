import logo from './logo.svg';
import './App.css';
import WebCamStream from './components/WebCamStream';
 
function App() {
  return (
    <div className="App">
      <header className="App-header">
		<WebCamStream/>
        <p>
          EonPass & Poort8 = OdysseyMomentum
        </p>
      </header>
    </div>
  );
}

export default App;
