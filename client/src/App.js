// import logo from './logo.svg';
import { Header } from './components/header/header';
import { WelcomeBox } from './pages/home';
import { SelectCreateOption } from './pages/CreateOptions';
import { RandomGenerator } from './pages/generator';
import { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StateContext } from './context/StateContext';
import { LoadingBox, showLoading, hideLoading } from "./components/ui/loading";

const pumpum = window.location.host;

let baseServerUri =(pumpum  === "localhost:3000")?'api/':'https://yaadlabs.herokuapp.com/api/';
const homeSate = { state:"", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:"createbox", temp_index: null, baseServerUri,};

function App() {
    const [ data, setData ] = useState(null);
    const [ loading, setLoading ] =  useState(true);
    const [ state, setState ] = useState(homeSate);
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

    return (
        <BrowserRouter>
            <div className="App">
                <StateContext.Provider value={{ state, setState }}>
                    <Routes>
                        <Route path='/' element={ <> <LoadingBox data={{class:activeStatus}}/> <Header/> <WelcomeBox data={{message: "De-Fi"}} /> </> } />
                        <Route path='/SelectCreateOption' element={<> <SelectCreateOption /> </>} />
                        <Route path='/pfpgenerator' element={ <RandomGenerator/> } />
                    </Routes>
                </StateContext.Provider>
            </div>
        </BrowserRouter>
    );
}

export default App;
