// import logo from './logo.svg';
import './App.css';
import Body from './body.js';
import {useState, useEffect} from 'react';
const baseServerUri = 'https://yaadlabs.herokuapp.com/api/'
function App() {
  const [data, setData] = useState("");
  useEffect(()=>{
    fetch(baseServerUri)
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
