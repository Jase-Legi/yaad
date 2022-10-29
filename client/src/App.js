import { WelcomeBox } from './pages/home';
import { SelectCreateOption } from './pages/CreateOptions';
import { RandomGenerator } from './pages/generator';
import { SingleNft } from './pages/singleNFT';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { connectToChain, signer,  currentNetwork, blockchainNetworks, currentAddress } from "./helpers/web3Helpers";
import { StateContext } from './context/StateContext';
import { MsgContext } from './context/msgcontext';
import { LoadingBox, showLoading, hideLoading } from "./components/ui/loading";
import { WalletBox } from './components/ui/walletmodal';
import { MsgBox } from "./components/errorbox/errorbox";
// import './styles/walletModal.css';

let baseServerUri = ( window.location.host  === "localhost:3000" )?'api/':'https://yaadlabs.herokuapp.com/api/';
const homeState = { state:"home", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:null, temp_index: null, baseServerUri, chainID: null, address: null };
const defaultErrorStack = { intervalId:null, formdata:[], substate:null };
const App = ()=>{
    const [ state, setState ] = useState( homeState );

    let [ msgStacks, setMsgStacks ] = useState(defaultErrorStack);
    
    let activeStatus = 'inactive';
    useEffect(()=>{
        showLoading();
        if( window.sessionStorage.getItem( "state" ) ){
            let db; const req_localDB = indexedDB.open( "yaad", 1);

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
                const tx = db?.transaction( "state", "readonly" );
                const yaadState = tx.objectStore("state").index("state");
                const state_request = yaadState.get( window.sessionStorage.getItem("state") );
                state_request.onsuccess = ()=>{
                    const cursorState = state_request.result;
                    // console.log(`cursorState: ${JSON.stringify(cursorState)}`);
                    hideLoading();
                    setState( cursorState );
                }
            };
        }

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
        case 'connect':
            currentState = <WalletBox/>;
            break;
        case 'createnft':
            currentState = <SingleNft/>;
            break;
        case 'RandomGenerator':
            currentState = <RandomGenerator/>
            break;
        case 'SelectCreateOption':
            currentState = <div className='popupdark'> <SelectCreateOption /> </div>;
            break;
        default:
            currentState =<div className='popupdark'> <WelcomeBox data={{message: "De-Fi"}} /> </div>;
            break;
    }

    return (
        <div className="App">
            <LoadingBox/>
            <MsgContext.Provider value={{ msgStacks, setMsgStacks }}>
                <StateContext.Provider value={{ state, setState }}>
                    <MsgBox subState={ state.currsubState } />
                    {currentState}
                </StateContext.Provider>
            </MsgContext.Provider>
        </div>
    );
}

export default App;
