// import logo from './logo.svg';
import './App.css';
import Body from './body.js';
import {useState, useEffect} from 'react';

function App() {
  const [data, setData] = useState("");
  useEffect(()=>{
    fetch('/api/')
    .then( (res) =>res.json())
    .then( (data) => setData(data) );
  },[]);
  // if(data !== ""){
  //   console.log(`data::: ${data}`)
  // }
  // console.log(data.tokenabi);
  return (
    <div className="App">
      {/* <Header/>    */}
      <Body  data={data}/>
    </div>
  );
}

export default App;
