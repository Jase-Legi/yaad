import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { providers, Contract, utils, BigNumber, ContractFactory, getDefaultProvider } from 'ethers';
import { connectToChain, getNetwork, blockchainNetworks, currentAddress } from "./helpers/web3Helpers";
import { StateContext } from './context/StateContext';
import { MsgContext } from './context/msgcontext';
import { LoadingBox, showLoading, hideLoading } from "./components/ui/loading";

const RandomGenerator = lazy(()=> import('./pages/generator'));
const SelectCreateOption = lazy(()=> import('./pages/CreateOptions'));
const SingleNft = lazy(()=> import('./pages/singleNFT'));
const WelcomeBox = lazy(()=> import('./pages/home').then(home=>home));
const WalletBox = lazy(()=> import('./components/ui/walletmodal').then( wallet=> wallet));
const SideBar = lazy(()=> import('./components/ui/sideBar'));
const CodeEditor = lazy(()=> import('./components/codeEditor/codeEditor'));
const MsgBox = lazy(()=> import("./components/msgbox/msgbox") );
const Header = lazy(()=> import("./components/header/header") );

let baseServerUri = ( window.location.host  === "localhost:3000" )?'api/':'https://yaadlabs.herokuapp.com/api/';
const homeState = { state:"home", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:null, temp_index: null, baseServerUri, chainData: null, chainID: null, account: null, sideBar:false };
const defaultErrorStack = { intervalId:null, formdata:[], substate:null };
const { log } = console;
let provider = null, signer = null, currentNetwork = null, oldNetwork = null;

const App = ()=>{
    const [ state, setState ] = useState( homeState );

    const [ msgStacks, setMsgStacks ] = useState( defaultErrorStack );

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
        // log(`ethereum type: ${typeof window.ethereum}`)
        if( typeof window.ethereum === 'undefined' ){
            return;
        }

        provider = new providers.Web3Provider( window.ethereum, 'any' );
        provider.on( 'network', async ( newNetwork, old_Network )=>{
            try {
                let chain_id = await window.ethereum.request({ method: 'eth_chainId' });
                
                // console.log(`chain id:::: ${chain_id}`)
                
            } catch (error) {
                log(`error getting chain ID, error: ${error}`);
            }
        });

        signer = provider.getSigner();

        window.ethereum.on('connect', ( connectData )=>{
            log(`connected: ${ JSON.stringify(connectData) }`);
        });
        
        window.ethereum.on('disconnect', ( disconnectedData )=>{
            log(`disconnected: ${JSON.stringify(disconnectedData)}`);
        });

        window.ethereum.on('accountsChanged', async (accounts)=> {
            // Time to reload your interface with accounts[0]!
            //handle user switching accounts here, reload metamask interface or connect to new interface
            console.log(`accounts changed. Account: ${JSON.stringify(accounts[0])}`);
            let chainID = await window.ethereum.request({ method: 'eth_chainId' });

            if( accounts[0] === undefined ){
                // state.account = null;
                return setState((prev)=>({...prev, account: null, chainID: null, chainData:null }));
            }else{
                // console.log(`chain id:::: ${chain_id}`)
                const balance = await provider.getBalance( accounts[0] );
                const balanceInEth = utils.formatEther(balance);
                let chainData;
                blockchainNetworks.forEach((val, i)=>{
                    if( val.networkParameters.chainId === chainID ){
                        chainData = val;
                    }
                })

                return setState((prev)=>({...prev, account: accounts[0], chainID, ethBalance: balanceInEth, chainData, }));
            }
        });

        window.ethereum.on('chainChanged', async (chainid)=>{

            log(`chain changed, chain id: ${chainid}`);
            const chainID = await window.ethereum.request({ method: 'eth_chainId' });
            let chainData;
            blockchainNetworks.forEach((val, i)=>{
                if( val.networkParameters.chainId === chainID ){
                    chainData = val;
                }
            })
            
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            const balance = await provider.getBalance( accounts[0] );
            const balanceInEth = utils.formatEther(balance);
            return setState((prev)=>({...prev, account: accounts[0], chainID, ethBalance: balanceInEth, chainData, }));
        });

        // window.ethereum.on('message', (chainid)=>{

        // });

        return;
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
        setMsgStacks( defaultErrorStack );
        // setMsgStacks( (prev)=>({...prev, }) );
    }, [ state.state, state.currsubState])
    let currentState;
    let bgimg = "url('./yaadfavicon_bg.svg') no-repeat center fixed";
    switch ( state.state ) {
        case 'connect':
            currentState = <div className='popupdark'> <Header/> <WalletBox/> </div>;
            break;
        case 'createnft':
            bgimg = "url('./yaadfavicon_bg_white.svg') no-repeat center fixed";
            currentState = <div className='popupdark'> <Header/> <SingleNft/> </div>;
            break;
        case 'RandomGenerator':
            currentState = <div className='popupdark' id='popup'> <Header/> <RandomGenerator/> </div>
            break;
        case 'SelectCreateOption':
            currentState = <div className='popupdark'> <Header/> <SelectCreateOption /> </div>;
            break;
        case 'create_std_token':
            currentState = <div className='popupdark'> <Header/> <CodeEditor/> </div>;
            break;
        default:
            currentState = <div className='popupdark'> <Header/> <WelcomeBox data={{message: "De-Fi"}} /> </div>;
            break;
    }

    document.body.style.background = bgimg;
    document.body.style.backgroundSize = "cover";
    return (
        <div className="App">
            <LoadingBox/>
            <MsgContext.Provider value={{ msgStacks, setMsgStacks }}>
                <StateContext.Provider value={{ state, setState }}>
                    {/* catch delay betweeen component switch caused by the lazy load & show the loading svg*/}
                    <Suspense fallback={<img src="./loading.svg" alt=""/>}>
                        <MsgBox subState={ state.currsubState } />
                        <SideBar/>
                        {currentState}
                    </Suspense>
                </StateContext.Provider>
            </MsgContext.Provider>
        </div>
    );
}

export default App;
