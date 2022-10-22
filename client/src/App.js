import { WelcomeBox } from './pages/home';
import { SelectCreateOption } from './pages/CreateOptions';
import { RandomGenerator } from './pages/generator';
import { SingleNft } from './pages/singleNFT';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { StateContext } from './context/StateContext';
import { MsgContext } from './context/msgcontext';
import { LoadingBox, showLoading, hideLoading } from "./components/ui/loading";
import { MsgBox } from "./components/errorbox/errorbox";

const pumpum = window.location.host;

let baseServerUri = (pumpum  === "localhost:3000")?'api/':'https://yaadlabs.herokuapp.com/api/';
const homeSate = { state:"", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:"createbox", temp_index: null, baseServerUri: baseServerUri,};
const defaultErrorStack = { intervalId:null, formdata:[], substate:null };
const App = ()=>{
    const [ state, setState ] = useState( { state:"", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:"createbox", temp_index: null, baseServerUri: baseServerUri } );

    let [ msgStacks, setMsgStacks ] = useState(defaultErrorStack);
console.log(`base uri: ${state.baseServerUri}, state: ${JSON.stringify(state)}`)
    let activeStatus = 'inactive';
    useEffect(()=>{
        showLoading(); let db; const req_localDB = indexedDB.open("yaad", 1);

        req_localDB.addEventListener('upgradeneeded', ()=>{
            db = req_localDB.result;
            console.log(`store names:::::`);
            if(!db.objectStoreNames.contains("state")){
                const project = db.createObjectStore("state", { keyPath:"state" });
                project.createIndex("state", "state", { unique:true });
                window.sessionStorage.setItem("state", state.state);
                project.put({...state,});
                
            }
        });

        req_localDB.onsuccess = ()=>{
            db = req_localDB.result;
            const tx = db?.transaction("state", "readonly");
            const yaadState = tx.objectStore("state").index("state");
            const state_request = yaadState.get( window.sessionStorage.getItem("state") );
            state_request.onsuccess = ()=>{
                const cursorState = state_request.result;
                // console.log(`cursorState: ${JSON.stringify(cursorState)}`);
                hideLoading();
                setState( cursorState );
            }
        };

    }, []);

    useEffect(()=>{
        showLoading(); let db; const req_localDB = indexedDB.open("yaad", 1);
        req_localDB.addEventListener('upgradeneeded', ()=>{
            db = req_localDB.result;
            // console.log(`store names:::::`);
            if(!db.objectStoreNames.contains("state")){
                const project = db.createObjectStore("state", { keyPath:"state" });
                project.createIndex("state", "state", { unique:true });
                window.sessionStorage.setItem("state", state.state);
                project.put({...state});
            }
        });

        req_localDB.onsuccess = ()=>{
            db = req_localDB.result;
            const tx = db?.transaction("state", "readwrite");
            const yaadState = tx.objectStore("state");
            window.sessionStorage.setItem("state", state.state);
            const updateYaad = yaadState.put({...state});
            updateYaad.onsuccess = ()=>{
                hideLoading();
            }
        };
    }, [ state ]);

    useEffect(()=>{
        setMsgStacks( defaultErrorStack )
    }, [ state.state, state.currsubState])
    let currentState;
    switch ( state.state ) {
        case 'createnft':
            currentState = <> <LoadingBox data={{class:activeStatus}}/> <SingleNft/> </>;
            break;
        case 'RandomGenerator':
            currentState = <RandomGenerator/>
            break;
        case 'SelectCreateOption':
            currentState = <> <MsgBox subState={ state.currsubState } /> <SelectCreateOption /> </>
            break;
        default:
            currentState = <> <LoadingBox data={{ data:activeStatus }}/> <MsgBox subState={ state.currsubState } /> <div className='popupdark'> <WelcomeBox data={{message: "De-Fi"}} /> </div> </>
            // currentState = <div style={{ backgroundColor: "rgba(0, 3, 40, 0.7)", backdropFilter: "blur(5px)", minHeight:"100vh", width:"100%"}}><Header data={state}/>{/* <div style={{padding:"20px", backgroundColor:"yellow", height: "fit-content", margin: "20px 0px"}}> <h1 style={{color:"#000"}}> Create & deploy assets to the blockchain! </h1> <span style={{display: "block", textAlign: "center", fontSize:"15px", fontWeight: "500"}}>-Generate and Store NFT projects(no code needed)<br></br><br></br>-Create NFTs -Create Tokens<br></br></span></div> <button className="enableEthereumButton" onClick={mintNEW}>mint</button> <button className="enableEthereumButton" onClick={iswalletConnected}>Enable Ethereum</button> */}<WelcomeBox/></div>;
            break;
    }

    return (
        <div className="App">
            <MsgContext.Provider value={{ msgStacks, setMsgStacks }}>
                <StateContext.Provider value={{ state, setState }}>
                    {currentState}
                </StateContext.Provider>
            </MsgContext.Provider>
        </div>
    );
}

export default App;
