import { WelcomeBox } from './pages/home';
import { SelectCreateOption } from './pages/CreateOptions';
import { RandomGenerator } from './pages/generator';
import { SingleNft } from './pages/singleNFT';
import { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { StateContext } from './context/StateContext';
import { MsgContext } from './context/msgcontext';
import { LoadingBox, showLoading, hideLoading } from "./components/ui/loading";
import { MsgBox } from "./components/errorbox/errorbox";

const pumpum = window.location.host;

let baseServerUri =(pumpum  === "localhost:3000")?'api/':'https://yaadlabs.herokuapp.com/api/';
const homeSate = { state:"", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:"createbox", temp_index: null, baseServerUri,};
const defaultErrorStack = { intervalId:null, formdata:[], substate:null };
const App = ()=>{
    const [ state, setState ] = useState(homeSate);

    let [ msgStacks, setMsgStacks ] = useState(defaultErrorStack);

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
    return (
        <div className="App">
            <MsgContext.Provider value={{ msgStacks, setMsgStacks }}>
                <StateContext.Provider value={{ state, setState }}>
                {/* <Router> */}
                    <Routes>
                        <Route index element={ <> <LoadingBox data={{ data:activeStatus }}/> <MsgBox subState={ state.currsubState } /> <div className='popupdark'> <WelcomeBox data={{message: "De-Fi"}} /> </div> </> } />
                        <Route path='selectCreateOption' element={ <> <MsgBox subState={ state.currsubState } /> <SelectCreateOption /> </>} />
                        <Route path='pfpgenerator' element={ <> <RandomGenerator/> </> } />
                        <Route path='createnft' element={ <> <LoadingBox data={{class:activeStatus}}/> <SingleNft/> </> } />
                        <Route path='*' element={ <Navigate to='/'/> } />
                    </Routes>
                {/* </Router> */}
                </StateContext.Provider>
            </MsgContext.Provider>
        </div>
    );
}

export default App;
