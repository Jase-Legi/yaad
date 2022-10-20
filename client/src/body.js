import { useState, memo, useEffect, useContext } from 'react';
import { providers, Contract, utils, BigNumber, ContractFactory } from "ethers";
import yaadtokenAbi from './contracts/ABIs/Yaad.json';
import { Header } from './components/header/header';
import { imgToBase64String, imgURLFromBase64String } from "./helpers/imgBLOBto64";
import { validateIMGtype } from "./helpers/imgdatahelpers";
import { BoxTitle, Buttonz, DaInput} from './components/form/formcomps';
import { MsgBox } from './components/errorbox/errorbox';
import yaadcontract from './contracts/yaad.json';
import { LoadingBox, showLoading, hideLoading } from "./components/ui/loading";
import nftcontract from './contracts/the_yaad.sol';
import { StateContext } from './context/StateContext';

const pumpum = window.location.host;
let baseServerUri = ( pumpum  === "localhost:3000" )?'./':'https://yaadlabs.herokuapp.com/';
let provider = null, signer = null, intervalId, currentNetwork;

if (typeof window.ethereum !== 'undefined') {
    provider = new providers.Web3Provider(window.ethereum, "any");
    
    provider.on("network", (newNetwork, oldNetwork) => {
        currentNetwork = newNetwork;
        console.log(`new Network: ${JSON.stringify(newNetwork)}`);

        // When a Provider makes its initial connection, it emits a "network"
        // event with a null oldNetwork along with the newNetwork. So, if the
        // oldNetwork exists, it represents a changing network
        if (oldNetwork) {
            console.log(`oldNetwork: ${JSON.stringify(oldNetwork)}`);
            // window.location = '/';
        }
    });

    window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        //handle user switching accounts here, reload metamask interface or connect to new interface
        console.log(`accounts: ${JSON.stringify(accounts)}`);
    })

    signer = provider.getSigner();
}

const addBinanceNetwork = ()=>{
    window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com']
        }]
    }).catch((error) => {

        console.log(error);

    }) 
}

const addFantomNetwork = ()=>{
    window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
        chainId: '0x250',
        chainName: 'FANTOM OPERA',
        nativeCurrency: {
            name: 'FANTOM_OPERA',
            symbol: 'FTM',
            decimals: 18
        },
        rpcUrls: ['https://rpc.ftm.tools/'],
        blockExplorerUrls: ['https://ftmscan.com/']
        }]
    }).catch((error) => {

        console.log(error);

    }) 
}

const etherTokenAddy = '0x0DDfBF1E76F37eE8545595ce6AD772d5a326B33A';

const etherToken = new Contract(etherTokenAddy, yaadtokenAbi.abi, signer);

document.addEventListener('submit', (e)=>{ e.preventDefault(); });

// let showLoading = ()=>{ document.getElementById('loadingpopup').classList.remove('inactive'); }

// let hideLoading = ()=>{ document.getElementById('loadingpopup').classList.add('inactive'); }

const getGas = async (trans)=>{ return (trans)?trans.estimateGas():false; };

const iswalletConnected = async ()=>{
    if(window.ethereum){
        const accounts = await window.ethereum.request({method:'eth_accounts'});
        // let gaslimit = gasNow.add(50000)

        if(accounts.length  > 0){
            return accounts[0];
        }else{
            try {
                const accounts = await window.ethereum.request({method: "eth_requestAccounts"}).finally((rez)=>rez).catch((error)=>error);
                return accounts[0];
            } catch (error) {
                return error;
            }            
        }
    }else{
        return window.location = "https://metamask.app.link/send/pay-https://www.yaadlabs.com?value=0e17";
    }
};

const logit = async ( itemToLog )=>{
    console.log(itemToLog);
};

const shuffle = (arra1)=> {
  var ctr = arra1.length, temp, index;
  // While there are elements in the array
  while (ctr > 0) {
      // Pick a random index
      index = Math.floor(Math.random() * ctr);
      // Decrease ctr by 1
      ctr--;
      // And swap the last element with it
      temp = arra1[ctr];
      arra1[ctr] = arra1[index];
      arra1[index] = temp;
  }
  return arra1;
}

const isAplhaNumeric = (str)=>{
    
    for (let ind = 0; ind < str.length; ind++) {
        let  get_code = str.charCodeAt(ind);

        if (!(get_code > 47 && get_code < 58) && /* numeric (0-9) */ !(get_code > 64 && get_code < 91) && /* upper alpha (A-Z)*/ !(get_code > 96 && get_code < 123) && !(get_code === 95)) /* lower alpha (a-z)*/ {
            return false;
        }
    }
    return true;
};


const nullFunc = (e)=>{ return; };

// function LoadingBox(props){
//     return(
//         <div id='loadingpopup' className='inactive'>
//             <div id='loadingbttn' >
//                 <img src="./loading.svg" alt=""/>
//                 <div className='loadingbttn_text_box'>
//                     <span style={{color:"white"}}>Please Wait</span>
//                 </div>
//             </div>
//         </div>
//     )
// }

function Body(props){
    const homeSate = {state:"", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:"createbox", temp_index: null};
    
    const { state, setState } = useContext(StateContext);

    // console.log(`current context state: ${JSON.stringify(state)}`)
    
    // let [state, setState] = useState(homeSate);

    const defaultErrorStack = { intervalId:null, formdata:[], substate:null };

    let [errStacks, setErrStacks] = useState(defaultErrorStack);
    
    let [scrollPosition, setScrollPosition] = useState(0);

    // const ipfs_gateway = 'https://gateway.pinata.cloud/ipfs/';
    const ipfs_gateway = 'https://ipfs.io/ipfs/';

    const changeStack = (val, setname)=>{
        showLoading();
        let mounted = true;
        if(mounted){
            setname((prev)=>(val));
        }
        hideLoading();
        return ()=> mounted = false;
    }

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

    useEffect(() => {
        return ()=>{
            // if(errStacks.substate !== state.currsubState && errStacks.substate != null){
            setErrStacks((prev)=>({ intervalId:null, formdata:[], substate:null }));
        }
    }, [state.currsubState, state.state])

    const timeOutBox = (interval, callback)=>{
        if((errStacks.intervalId === null) && (errStacks.formdata?.length > 0)){
            errStacks.intervalId = setTimeout(()=>{
                callback();
            }, interval)
        }
    }
    
    const changeState = (val, scrollval)=>{
        showLoading();
        let mounted = true;
        if(mounted){
            setState(val);
            if(scrollval){
                setScrollPosition(scrollval)
            }
        }

        hideLoading();
        return ()=> mounted = false;
    }

    const mintNEW = async (uri)=>{
        let isconnected = await iswalletConnected();
        if(isconnected !== false){
            console.log(`uri: ${JSON.stringify(uri)}`);
            const gasNow = await getGas(signer).finally((eee)=>eee).catch((err)=>err);
            logit(`gas:: ${gasNow}`);

            let options = { gasLimit: BigNumber.from(gasNow).add(5000000), value:utils.parseEther('.015') };
            
            try {
                const minted = await etherToken.payToMint(isconnected, JSON.stringify(uri), options).finally((res)=>res);
                // https://goerli.etherscan.io/tx/0x7b34252866bb39a045b04aa1ddd745f507a67f1fe2784a91a8db939e077aa9e2
                logit(`minted::: ${JSON.stringify(minted)}`);
                return minted;
            } catch (error) {
                console.log(`mint error:: ${error}`);
                return error;
            }
        }
        // IpfsHash: 'QmZuPdu8HACXJo5LUB6MUYCs2HpWndsqaZmYBSUpUFYR4M',
        // window.ethereum.on('accountsChanged', function (accounts) {
            // Time to reload your interface with accounts[0]!
        // });
        console.log(isconnected);
        return isconnected;
    }
    
    const deployContract = async (e)=>{
        showLoading();
        const ele = e.target;
        ele.classList.add("inactive");
        if(!state.data.coll_name || state.data.coll_name.trim() === ""){
            return setErrStacks( (prev)=>({...prev, formdata:[{id:"contractName", value: document.getElementById("contractName").value, msg: "Enter a project/NFT name!"}], substate:state.currsubState }) );
        }
        
        if(!state.data.coll_symbol || state.data.coll_symbol.trim() === ""){
            return setErrStacks( (prev)=>({...prev, formdata:[{id:"contractSymbol", value: document.getElementById("contractSymbol").value, msg: "Enter a symbol!"}], substate:state.currsubState }) );
        }

        try {
            fetch(nftcontract).then(r=>r.text()).then( async (contract)=>{
                // console.log(`contract: ${text}`)
                let contractOptions = {
                    language: "Solidity", 
                    sources: {
                    'yaad.sol': {
                        content: contract
                    }
                    },
                    settings:{
                    outputSelection:{
                        '*': {
                        '*':['*']
                        }
                    }
                    }
                };

                const connected = await iswalletConnected();
                let contractData = new FormData();
                if(connected === false) { hideLoading(); return false; }
                contractData.append('contractJSON', JSON.stringify(contractOptions));
                const compiledContract = await fetch(baseServerUri+"api/compileContract", {method:'POST',body: contractData} ).then((theresponse)=>theresponse.json()).then((compiled)=>compiled);
                const abi = compiledContract.abi;
                const bytecode = compiledContract.bytecode;
                const factory = new ContractFactory(abi, bytecode, signer);
                const nftToken = await factory.deploy(state.data.coll_name, state.data.coll_symbol).then((tx)=>tx).catch((e)=>e);
                contractData = null;
                if(nftToken.code === "ACTION_REJECTED"){
                    ele.classList.remove("inactive");
                    hideLoading();
                    return;
                }

                // {"name":"ropsten","chainId":3,"ensAddress":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"}
                if(nftToken.address){
                    hideLoading();
                    logit(`deployed token details: ${nftToken}`);
                    setState( (prev)=>( { ...prev, currsubState: "RandomGenerator-ContractDeployed", data:{...prev.data, contract_address: nftToken.address, contract_link: `https://${currentNetwork.name}.etherscan.io/address/${nftToken.address}`} } ));
                }
            });
        } catch (error) {
            console.log(`error: ${error}`)
            return error;
        }
    };
    
    const clickCreate = async (dastate)=>{
        showLoading();
        const connected = await iswalletConnected();
        
        if(connected === false){
            // handle login failed logic here
            hideLoading();
            return false;
            
        }
        hideLoading();
        return changeState(dastate);
    }
    
    Array.prototype.swapItems = function(a, b){
        this[a] = this.splice(b, 1, this[a])[0];
        return this;
    }
    
    const handlesingleUload = async (e)=>{
        let body = new FormData();
        let newItemName = ( state.data.filename )? state.data.filename.split('.'):null;
        
        newItemName?.pop();
        let conntd = await iswalletConnected();

        if ( conntd !== false ) { body.append('account', conntd) } else { return false; }
        let assetName = conntd+"__"+Date.now()+"."+e.target.files[0].name.split('.')[e.target.files[0].name.split('.').length-1];
        body.append('single_asset', e.target.files[0], assetName);
        
        if ( state.data.filename ) body.append( 'name', state.data.filename );
        
        const singleUploaded = await fetch(`${baseServerUri}api/upldSingle`, {method:"POST", body, }).then( (res)=> res.json() ).then( (piss)=> piss );
        logit(`path::: ${JSON.stringify(singleUploaded)}`);
        
        if(singleUploaded.error){
            setState( (prev)=> ( {...prev, data: singleUploaded } ) );
        }else{
            setState( (prev)=>( {...prev, state: "createbox", data: singleUploaded, currsubState: "SingleNFTDetailsForm" } ));    
        }
    }

    function SelectCreateOption(props) {
        return(
            <div>
                <button className='closeBox' onClick={ ()=>setState((prev)=>homeSate) } >X</button>
                <DaInput data={{ typeId:'single_asset', name:'single_asset', type:'file', hidden:true, accept:'image/*,video/*,audio/*,webgl/*', onChange:handlesingleUload}}/>
                <button className='popupBoxEle' id='createBox' onClick={()=>{document.getElementById('single_asset').click();}}>Single NFT</button>
                <form action={baseServerUri+'api/upldSingle'} method="post" id='createSingleAssetUpld' encType="multipart/form-data"> </form>
                <div>
                    <button className='popupBoxEle' id='generateNFT_Coll' onClick={()=>setState((prev)=>({...prev, state: "RandomGenerator"}))}>PFP Project</button>
                </div>
            </div>
        )
    };

    function SingleNft (props){
        function SingleNFTDetailsForm (props){
            const handlesingleCreate = async (e)=>{
                e.target.classList.add('inactive'); showLoading(); e.preventDefault();
                if(!state.data.name || state.data.name === "" || state.data.name === null || state.data.name  === undefined || !state.data.collection || state.data.collection === null || state.data.collection === "" || state.data.collection === undefined){
                    hideLoading();
                    return setErrStacks( (prev)=>({...prev, formdata:[{ id:"singleNFTName", value:"", msg:"Please enter a name & collection" }], substate:state.currsubState }));
                }
                
                let body = new FormData();
                body.append('data', JSON.stringify(state.data) );
                const createNft = await fetch(baseServerUri+"api/createone", { method:"POST", body,}).then((res)=> res.json()).then( (piss)=> piss );
                
                if(createNft.error){
                    if(createNft.error.message === "duplicate"){
                        hideLoading();
                        return setErrStacks( (prev)=>({...prev, formdata:[{ id:"createSingleBoxPreview", value:"", msg:"This NFT already exists, please select an original design." }], substate:state.currsubState }));
                    }
                    hideLoading();
                    setState( (prev)=>( {...prev, currsubState: "SingleNFTDetailsForm" } ));                
                }
                
                if( createNft.results ){
                    const minted = await mintNEW( createNft.results.IpfsHash ).finally((resp)=>resp);
                    if( minted.code === "ACTION_REJECTED" ){
                        hideLoading();
                        e.target.classList.remove('inactive');
                        return setErrStacks( (prev)=>({...prev, formdata:[{ id:"createSingleBoxPreview", value:"", msg:"Transaction rejected!" }], substate:state.currsubState }));
                    }
                    logit(`minted----- ${JSON.stringify(minted)}`);
                    if(minted.hash){
                        return setState( (prev)=>( {...prev, currsubState: "NFTminted" } ));
                    }
                    
                    e.target.classList.remove('inactive'); hideLoading();
                }
            }

            const inputChnages = async (e)=>{
                const ele = e.target;
                
                switch ( e.target.getAttribute('name') ) {
                    case 'name':
                        state.data.name = ele.value;
                        break;
                    case 'collection':
                        state.data.collection = ele.value;
                        break;
                    case 'price':
                        state.data.price = ele.value;
                        break;
                    case 'royalties':
                        state.data.royalties = ele.value;
                        break;
                    case 'desc':
                        state.data.description = ele.value;
                        break;
                    default:
                        break;
                }
            }
            
            return(
                <div>
                    <label className='popupBoxEleDetailsLabel' id='createSingleBoxPreview' htmlFor="createSingleAssetUpld" onClick={()=>{document.querySelector('#single_asset').click()}}>
                        <div className='popupBoxEleDetails'>
                            <img src={baseServerUri+state.data.path} style={{objectFit:"cover", height: "100%", width:"100%"}} alt=""/>
                        </div>
                    </label>
                    <input type="file" id='single_asset' name='single_asset' accept="image/*,video/*,audio/*,webgl/*,.glb,.gltf" style={{opacity:100, zIndex:1}} onChange={handlesingleUload} hidden/>
                    <input className='popupBoxTextEle' placeholder={(state.data.name)?state.data.name:'Name'} type="text" name='name' id='singleNFTName' onChange={inputChnages} style={{opacity:100, zIndex:1}} />
                    <DaInput data={{ typeId:'singleNFTDesc', typeClass:'popupBoxTextAreaEle', name:'desc', placeholder:(state.data.description)?state.data.description:'Description', type:'textarea', onChange:inputChnages}}/>
                    <input className='popupBoxTextEle' placeholder={(state.data.collection)?state.data.collection:'Collection'} type="text" name='collection' id='singleNFTColl' onChange={inputChnages}  style={{opacity:100, zIndex:1}} />
                    <input className='popupBoxSmallTextAreaLeftEle' placeholder={(state.data.price)?state.data.price:'Price'} type="number" name='price' id='singleNFTPrice' onChange={inputChnages}  style={{opacity:100, zIndex:1}} />
                    <input className='popupBoxSmallTextAreaRightEle' placeholder={(state.data.royalties)?state.data.royalties:'Royalties: max 50%'} type="number" name='royalties' id='singleNFTRoyalty' onChange={inputChnages} style={{opacity:100, zIndex:1}} />
                    <Buttonz data={{class:"popupBoxEle", id:'createBox', value:'create', func:handlesingleCreate}} />
                </div>
            )
                
        };

        let singleNFTDetailsForm = (state.currsubState === "SingleNFTDetailsForm")?<SingleNFTDetailsForm/>:"";
        return (
            <>
                <button className='closeBox' onClick={()=> setState((prev)=>homeSate) } >X</button>
                <div className='popupBox'> {singleNFTDetailsForm} </div>
            </>
        )
    }

    function RandomGenerator (props){
        let imgbody = new FormData(), da_files;
        var wrongFiles = [];
        state.data.activeContract = 0;

        const closeLayerOptionsBox = (e)=>{
            switch (state.currsubState) {
                case "RandomGenerator":
                    localStorage.clear();
                    setState((prev)=>({...prev, state:"", data:""}));
                    break;
                default:
                    setState((prev)=>({...prev, currsubState: "RandomGenerator" } ));
                    break;
            }
        }

        // const validateIMGtype = async ( demFiles, childClassName, parentEle ) => {
        //     parentEle.innerHTML = "";
        //     const demlen = demFiles.length;
        //     const last_indx = demFiles.length-1;
        //     for (let n = 0; n < demlen ; n++ ) {
        //         let dafile = demFiles[n];
        //         let readr = new FileReader();
        //         // eslint-disable-next-line no-loop-func
        //         readr.onloadend = ()=>{
        //             // convert file buffer array to  bit array and splice the first 4 elements of this array
        //             let buffArray = ( new Uint8Array( readr.result )).subarray(0, 4),
        //             fileSignature = "";
        //             // convert first 4 elements to hexadecimal string and contact them together to create file signature
        //             for(let m = 0; m < buffArray.length; m++){ fileSignature +=buffArray[m].toString(16); }
                    
        //             // check if signature matches the signatures of jpgs and png file
        //             switch (fileSignature) {
        //                 case '89504e47'.toLowerCase():
        //                 case 'FFD8FFE0'.toLowerCase():
        //                 case 'FFD8FFE1'.toLowerCase():
        //                 case 'FFD8FFE2'.toLowerCase():
        //                 case 'FFD8FFE8'.toLowerCase():
        //                     let img = document.createElement("img");
        //                     img.addEventListener("load", ()=>{
        //                         if( img.width <= 2000  && img.height <= 2000 ){
        //                             const para = document.createElement("div");
        //                             para.appendChild(img);
        //                             para.classList.add((childClassName)?childClassName:'LayerUpldContentBox')
        //                             parentEle.appendChild(para);
        //                         }else{
        //                             img.remove();
        //                             wrongFiles.push(n);
        //                         }
        //                     });
                            
        //                     img.src = URL.createObjectURL(dafile);
        //                     break;
        //                 default:
        //                     wrongFiles.push(n);
        //                     console.log(`wrong file value:: ${JSON.stringify(wrongFiles)}`);
        //                     if(demFiles.length === wrongFiles.length){
        //                         logit(`lengths are equal!`);
        //                         return setErrStacks((prev)=>({...prev, substate: state.currsubState, formdata: [{id: "LayerUpldLabel", value: "", msg:"Unsupported file types! JPG, JPEG, PNG only."}] }));
        //                     }
        //                     break;
        //             }
        //             if ( last_indx === n ){ hideLoading(); }
        //         }
        //         // Read file as array buffer 
        //         readr.readAsArrayBuffer(dafile);
        //     }
        // }

        const handleAddBGLayer = (e)=>{
            return setState((prev)=>({...prev, currsubState:"RandomGenerator-LayerOptions-BG-Upld" }));
        };

        const handleAddLayer = (e)=>{
            showLoading();
            const elementID = e.target.getAttribute('id');
            let eleIndex = [].indexOf.call(document.getElementsByClassName(e.target.getAttribute('class')), e.target);
            
            switch (elementID) {
                case null:
                    setState((prev)=>({...prev, temp_index: eleIndex, currsubState: "RandomGenerator-LayerOptions-AddLayer" }));
                    break;
                case "selectBG":
                    setState((prev)=>({...prev, currsubState: "RandomGenerator-LayerOptions-BG-Upld" }));
                    break;
                default:
                    setState((prev)=>({...prev, currsubState: "RandomGenerator-LayerOptions-AddLayer" }));
                    break;
            }
        }
        
        const handleAddLayerUpld = async (e)=>{
            showLoading();
            e.target.classList.add('inactive'); e.preventDefault();
            let layerName, bgElement = false;
            
            if(e.target.getAttribute('type') === 'file' && ( e.target.getAttribute('name') === 'multi_asset' || e.target.getAttribute('name') === 'bg_asset' ) ){
                await validateIMGtype( e.target.files, 'LayerUpldContentBox', 'layerContentBox', [], ([err, wrongfiles])=>{
                    wrongFiles = wrongfiles;

                    if( err !== null || ( wrongfiles.length === e.target.files.length )) { 
                        return setErrStacks((prev)=>({...prev, substate: state.currsubState, formdata:(err !== null)?[err]:[{id: "LayerUpldLabel", value: "", msg:"Images too large Max height: 2000px, max width: 2000px."}] }));
                    }

                    if( document.getElementById('bg_upld') ) document.getElementById('bg_upld').textContent = (e.target.files.length > 0)?'NEXT':'No Background';
                    
                    da_files = (e.target.files.length === 0 )?[]:e.target.files;
                    
                    hideLoading();
                });
                return;
            }
            
            if(e.target.getAttribute("id") !== "bg_upld"){
                layerName = ( state.temp_index === null )? state.formVals:document.getElementById("LayerName").value.trim();
                if( layerName === null || document.getElementById("multi_asset").files.length < 1){
                    
                    if( ( layerName === null && document.getElementById("multi_asset").files.length < 1 )  || (  layerName === null)) {
                        setErrStacks((prev)=>({...prev, substate: state.currsubState, formdata: [{id: "LayerName", value: "", msg:"This field cannot be empty!"}] }));
                    }
                    if( document.getElementById("multi_asset").files.length < 1 ) {
                        setErrStacks((prev)=>({...prev, substate: state.currsubState, formdata: [{id: "LayerUpldLabel", value: "", msg:"Click the '+' to upload files!"}] }));
                    }

                    e.target.classList.remove('inactive');
                    hideLoading();
                    return false;
                }
            }
            
            bgElement=(e.target.getAttribute("id") === "bg_upld")&& true;

            if((da_files === undefined || da_files.length === 0 || da_files.length === "") && e.target.getAttribute("id") === "bg_upld"){
                state.data.background = (  state.data.background.length === 0 )?[]:state.data.background;
                return closeLayerOptionsBox();
            }
            
            let exists = false, indxx = null;
            state.data.layers.forEach((val,indx, arr)=>{
                if( val.name === layerName ){
                    exists = true;
                    indxx = indx;
                }
            })

            let file_len = da_files.length, last_index = file_len-1, loadedindx = 0;
            const filesToLoadLen = da_files.length - wrongFiles.length;
            showLoading();
            loop1:
            for ( let n = 0; n < file_len; n++ ){
                loop2:
                for( const p of wrongFiles ){
                    if( p  === n ) { continue loop1; }
                }
                
                let img = new Image();
                // eslint-disable-next-line no-loop-func
                img.addEventListener("load", async ()=>{
                    loadedindx++;
                    const imgURL = await imgToBase64String(img);
                    console.log(`first character of base 64 string:: ${imgURL[0]}`)
                    let imgEXT = (imgURL[0] === '/' )?"jpg":"png";
                    if(bgElement){
                        if( Array.isArray(state.data.background) ){
                            state.data.background.push({trait_name: n, path: imgURL, ext: imgEXT });
                        }else{
                            state.data.background = [{trait_name: n, path: imgURL, ext: imgEXT }]
                        }
                    }else{
                        if(exists === true){
                            await state.data.layers[indxx].traits.push({ trait_name: n, path: imgURL, ext: imgEXT });
                        }else{
                            state.data.layers.push({ name: layerName, traits: [{ trait_name: n, path: imgURL, ext: imgEXT }] });
                            exists = true;
                            indxx = state.data.layers.length-1;
                        }
                    }
                    
                    if ( loadedindx === filesToLoadLen ){ return closeLayerOptionsBox(); }
                })

                img.src = URL.createObjectURL(da_files[n]);
            }
        }

        const delLayer = async (e)=>{
            if(state.currsubState === "RandomGenerator-LayerOptions-Edit-Layer"){
                return setState((prev)=>( {...prev, currsubState: "RandomGenerator-LayerOptions-Del-Layer", previous: prev.currsubState} ));
            }else{
                showLoading();
                if( state.temp_index !== null ){
                    state.data.layers.splice( state.temp_index, 1);
                    hideLoading();
                    return closeLayerOptionsBox();
                }
                return closeLayerOptionsBox();
            }
        }
        
        const renameLayer = (e)=>{
            e.preventDefault();
            const ele = e.target;
            if(state.currsubState === "RandomGenerator-LayerOptions-Edit-Layer"){
                setState((prev)=>({...prev, currsubState: "RandomGenerator-LayerOptions-Rename_Layer" }));
            }else{
                if(ele.value){
                    state.data.layers[ state.temp_index ].name = ele.value;
                    ele.setAttribute('placeholder', ele.value);
                }
            }
        };
        
        const prioritizeLayer = async (e)=>{
            const ele = e.target;
            if(state.temp_index){
                
                console.log(`prioritizezd! \n temp index ${state.temp_index}, isPriority: ${JSON.stringify(state.data.layers[ state.temp_index ])}`);
                let isPriority = state.data.layers[ state.temp_index ].priority;
                console.log(`prioritizezd! \n temp index ${state.temp_index}, isPriority: ${isPriority}`);
                let priorityLayerBttn = document.getElementById("priorityLayerBttn");
                let priorityLayerOption = document.getElementById("makepriorityLayerOption");
                
                state.data.layers[ state.temp_index ].priority = ( isPriority === true )?false:true;
                priorityLayerBttn.classList.toggle("disablepriorityLayerBttn");
                priorityLayerBttn.classList.toggle("makepriorityLayerBttn");
                priorityLayerOption.classList.toggle('ispriorityLayerOption');
                priorityLayerOption.classList.toggle('notpriorityLayerOption');
                priorityLayerOption.children[0].innerText = ( isPriority === true )?"NO":"YES";

                // <button id="priorityLayerBttn" className={( state.data.layers[ state.temp_index ].priority === true )?'disablepriorityLayerBttn':'makepriorityLayerBttn'} onClick={(e)=>prioritizeLayer} >
                //     <div id='makepriorityLayerOption' className={( state.data.layers[ state.temp_index ].priority === true )?'ispriorityLayerOption':'notpriorityLayerOption'}>
                //         <span>{( state.data.layers[ state.temp_index ].priority === true )?"YES":"NO"}</span>
                //     </div>
                // </button>
            }
        };

        const expandbox = (e)=>{
            showLoading();
            const ele = e.target;
            const indx = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);
            let me = 0;
            while( me < document.getElementsByClassName('detail-edit-trait-box' ).length){
                if(me !== indx){
                    if(!document.getElementsByClassName('detail-edit-trait-box')[me].classList.contains('inactive')){
                        document.getElementsByClassName('detail-edit-trait-box')[me].classList.add('inactive');
                    }
                    if(document.getElementsByClassName('generatorRightPanelLayerBox-title-img')[me].classList.contains('rotateExpander')){
                        document.getElementsByClassName('generatorRightPanelLayerBox-title-img')[me].classList.remove('rotateExpander');
                    }
                }
                me++;
            }

            if(document.getElementsByClassName('detail-edit-trait-box')[indx].classList.contains('inactive')){
                document.getElementsByClassName('generatorRightPanelLayerBox-title-img')[indx].classList.add('rotateExpander');
                document.getElementsByClassName('detail-edit-trait-box')[indx].classList.remove('inactive');
                document.getElementsByClassName("expander-box")[indx].style.backgroundColor = "rgb(129, 129, 129)";
            }else{
                document.getElementsByClassName('generatorRightPanelLayerBox-title-img')[indx].classList.remove('rotateExpander');
                document.getElementsByClassName('detail-edit-trait-box')[indx].classList.add('inactive');
                document.getElementsByClassName("expander-box")[indx].style.backgroundColor = "rgb(190, 190, 190)";
            }

            hideLoading();
        };

        const checkWorkInterval = async ( url, interval, callback )=>{
            if(!intervalId){
                intervalId = setInterval( async () => {
                    const checkedWork = await fetch(url).then((res)=>res.json()).then((rez)=> rez );
                    callback( checkedWork );
                }, interval);
            }
        };

        const stopCheckWork = ()=>{ clearInterval(intervalId); intervalId = null; };
        
        const generate_it = async (e)=>{
            showLoading();
            let conntd = await iswalletConnected();
            if( conntd === false ){ return false; }
            
            state.data.account = conntd;
            
            const get_all_possible_combos =  async ( input, output, n, da_path )=>{
                da_path = (da_path === null || da_path === undefined)? []: da_path;
                n = (n === null || n === undefined)? 0:n;
                if(n < input.length){
                    const current_item = input[n]; let gogo = 0;
                    while(gogo < current_item.length){
                        let val = current_item[gogo];
                        da_path.push(val);
                        get_all_possible_combos(input, output, n+1, da_path);
                        da_path.pop();
                        gogo++;
                    }
                }else{
                    output.push(da_path.slice());
                }
            };

            const loop_and_pin_layers = async (collName, layers)=>{
                let emptyComboArray = []; state.data.newlayers = [];
                layers.reverse();
                for(let indx = 0; indx < layers.length; indx++){
                    emptyComboArray.push( { name: layers[indx].name, priority: layers[indx].priority, traits:[] } );
                    for( let pin = 0; pin < layers[indx].traits.length; pin++ ){
                        const options = {
                            pinataMetadata:{
                            name: `${layers[indx].name}: ${layers[indx].traits[pin].trait_name}`,
                            keyvalues: {
                                description: `nft trait element from collection, generated by Yaad labs.`,
                                name: `${layers[indx].name}: ${layers[indx].traits[pin].trait_name}`
                            }
                            },
                            pinataOptions: {
                                cidVersion: 0
                            }
                        };
                        let assetName = conntd+"__"+Date.now()+"."+layers[indx].traits[pin].ext;
                        let pin_body = new FormData();
                        const fetchBlob = await fetch(imgURLFromBase64String(layers[indx].traits[pin].path));
                        const newimgBlob = await fetchBlob.blob();
                        pin_body.append( 'img', newimgBlob, assetName );
                        pin_body.append( 'the_options', JSON.stringify(options) );
                        const pinnedItem = await fetch( `${baseServerUri}api/pinnit`, {method:'POST', body: pin_body} ).then((resp)=>resp.json()).then((pinned)=> pinned );
                        layers[indx].traits[pin].ipfsHash = pinnedItem.IpfsHash;
                        state.data.newlayers.push({ trait_name: layers[indx].traits[pin].trait_name, layer_index:indx, trait_index:pin, ipfsHash:pinnedItem.IpfsHash })
                        emptyComboArray[indx].traits.push({ trait_name: layers[indx].traits[pin].trait_name, layer_index:indx, trait_index:pin, ipfsHash:pinnedItem.IpfsHash });
                    }
                }
                
                return emptyComboArray;
            };

            const loop_and_pin_background = async (backgrounds)=>{
                let newBGArray = [];
                for(let f = 0; f < backgrounds.length; f++){
                    const options = {
                        pinataMetadata:{
                        name: `background ${f}.`,
                        keyvalues: {
                            description: `nft trait element from collection, generated by Yaad labs.`,
                        }
                        },
                        pinataOptions: {
                            cidVersion: 0
                        }
                        
                    };

                    let assetName = conntd+"__"+Date.now()+"."+backgrounds[f].ext;
                    let pin_body = new FormData();
                    const fetchBlob = await fetch( imgURLFromBase64String( backgrounds[f].path ) );
                    const newimgBlob = await fetchBlob.blob();
                    pin_body.append( 'img', newimgBlob, assetName );
                    // pin_body.append( 'path',backgrounds[f].path );
                    pin_body.append( 'the_options', JSON.stringify(options) );
                    console.log(`pinning layers!`);
                    const pinnedBG = await fetch( `${baseServerUri}api/pinnit`, {method:'POST', body: pin_body}).then((resp)=>resp.json()).then((pinned)=>pinned);
                    backgrounds[f].ipfsHash = pinnedBG.IpfsHash;
                    newBGArray.push({ trait_name: backgrounds[f].trait_name, trait_index: f, ipfsHash: pinnedBG.IpfsHash});
                }
                return newBGArray;
            };

            const mapTraitTypes = async (comboz) => {
                let len = 0; let traitTypes = []; let ego, isPriority = [];
                while( len < comboz.length ){
                    if(comboz[len].priority){
                        isPriority.push(comboz[len].name);
                    }
                    ego = comboz[len].traits.map(( x, v ) => {
                        return { trait_type: comboz[len].name, trait_name: comboz[len].traits[v].trait_name, value: x.ipfsHash};
                    });

                    traitTypes.push(ego);            
                    len++;
                }
                ego = null;
                return [traitTypes, isPriority];
            };
            
            const traitTypesPushNA = async (traitTypes, priorities) => {
                let endo = 0;
                while ( endo < traitTypes.length ) {
                    if(!priorities.includes(traitTypes[endo][0].trait_type)){
                        traitTypes[endo].push({trait_type: traitTypes[endo][0].trait_type, value: 'N/A'});
                    }
                    endo++;
                }
                return traitTypes
            };

            const insertBackground = async (comboz) =>{
                let d = 0; const backgrounds = await loop_and_pin_background( state.data.background );
                while( d < comboz.length ){
                    let newBG = backgrounds[ Math.floor(Math.random() * backgrounds.length) ];
                    comboz[d].splice(0, 0, { trait_type: "background", trait_name: newBG.trait_name, value: newBG.ipfsHash });
                    d++;
                }
            };

            const allPossibleCombos = async ()=> {
                let comboz = [];
                // let layerz = JSON.parse( JSON.stringify(state.data.layers) );
                const loop_and_pin = await loop_and_pin_layers( state.data.coll_name, state.data.layers );
                const map_traits = await mapTraitTypes(loop_and_pin);
                const traittypes_fin = await traitTypesPushNA(map_traits[0], map_traits[1]);
                
                await get_all_possible_combos(traittypes_fin, comboz);
                await shuffle(comboz);
                await insertBackground(comboz);
                return comboz;
            };

            let combo =  await allPossibleCombos();
            const possibleCombos = combo.length;
            const byteSize = async (obj)=>{
                let str = null;
                if( typeof(obj) === 'string' ){
                    str = obj;
                }else{
                    str = JSON.stringify(obj);
                }
                const bytes = new TextEncoder().encode(str).length;
                return bytes;
            };

            const getBytes = await byteSize(combo).then((res)=>res);

            console.log(`size of combo: ${getBytes} bytes`);

            const pinCombo = async (combo, optns, pinUrl)=> {
                let pin_body = new FormData();
                pin_body.append('path', JSON.stringify(combo)); 
                pin_body.append('the_options', JSON.stringify(optns));
                const pinnedCombo = await fetch( pinUrl, {method:'POST', body: pin_body}).then((rezz)=>rezz.json()).then((pinned)=>pinned);
                pin_body = null;
                return pinnedCombo;
            }

            let optns = { pinataMetadata:{ name: state.data.coll_name, keyvalues: {} }, pinataOptions: { cidVersion: 0 } };
            
            let pinnedCombo;
            if(getBytes < 20000000){
                pinnedCombo = await pinCombo( combo, optns, `${baseServerUri}api/pinnitcombo` );
            }
            else{
                pinnedCombo = {IpfsHash: null};
            }

            const drawimage = async (traitTypes, width, height) => {
                let sampleArray = []; const cap_it = traitTypes.length;
                for( let v = 0; v < cap_it; v++ ){
                    console.log(`traits: ${v}`)
                    const  drawableTraits = traitTypes[v].filter( x=> x.value !== 'N/A');
                    const drawableTraits_length = drawableTraits.length;
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    let loadedimgs = 1;
                    for(let p = 0; p < drawableTraits_length; p++) {
                        let  drawableTrait = drawableTraits[p];
                        // try {
                            // newlayers =  { trait_name: layers[indx].traits[pin].trait_name, layer_index:indx, trait_index:pin, ipfsHash:pinnedItem.IpfsHash }
                            let iterlength = (p === 0)?state.data.background.length:state.data.newlayers.length;
                            loop1:
                            for( let i = 0; i < iterlength; i++ ) {
                                const traitinfo = (p === 0)?state.data.background[i]:state.data.newlayers[i];
                                if( traitinfo.ipfsHash === drawableTrait.value ){
                                    // console.log(`trait ipfsHash: ${traitinfo.ipfsHash}, drawableTrait value: ${ drawableTrait.value }, name:: ${JSON.stringify(state.data.layers[traitinfo.layer_index].traits[traitinfo.trait_index].trait_name)}`);
                                    let img = new Image();
                                    let base4path = (p === 0)?traitinfo.path:state.data.layers[traitinfo.layer_index].traits[traitinfo.trait_index].path;
                                    img.src = imgURLFromBase64String(base4path);
                                    // eslint-disable-next-line no-loop-func
                                    img.addEventListener( "load", async ()=>{
                                        // console.log(`loaded img: ${loadedimgs}, drawableTraits length: ${drawableTraits_length}, sample index: ${v}`);
                                        ctx.drawImage(img, 0, 0, width, height);
                                        if( loadedimgs === drawableTraits_length ){
                                            const sampleimage = await imgToBase64String(null, canvas.toDataURL("image/png"));
                                            sampleArray.push( { name: `sample turd #${v}`, attributes: drawableTraits, path: sampleimage } );
                                            const updateDB = async ( data, collname, account, thesamples, combo_ipfs_hash )=>{
                                                let payload = new FormData();
                                                payload.append('data', JSON.stringify(state.data));
                                                payload.append('collname', state.data.coll_name);
                                                payload.append('collSym', state.data.coll_symbol);
                                                payload.append('account', conntd);
                                                payload.append('ipfs_uri', combo_ipfs_hash);
                                                // payload.append('samples', JSON.stringify(thesamples));
                                                // let saveCollection = await fetch(`${baseServerUri}api/savenftcollection`, {method:'POST', body:payload}).then((response)=>response.json()).then((ress)=>ress);
                                                payload = null;
                                                let newcontract = JSON.parse(JSON.stringify(yaadcontract));
                                                newcontract.name = state.data.coll_name.split(" ").join("_");
                                                return setState((prev)=>({...prev, data: {...prev.data, coll_name: prev.data.coll_name, coll_symbol: prev.data.coll_symbol, samples: thesamples, possibleCombos, contracts: [newcontract] }, currsubState: "RandomGenerator-RandomGenerated" }));
                                            };
                                            if( v === (cap_it-1) ){
                                                await updateDB(state.data, state.data.coll_name, conntd, sampleArray, pinnedCombo);
                                            }
                                        }
                                        loadedimgs++;
                                    });
                                    break loop1;
                                }
                            }
                        // } catch (error) {
                        //     // return res.json({error, current_state: `looping through attributes, failed to draw index ${p}. Details: ${JSON.stringify(traits[p])}`})
                        // }
                    }
                }
            };

            const getSamplesAndClearComboData = async (comboz, cap)=>{
                const cap_it = (cap)?cap:comboz.length;
                let sampleImgs = [];
                for(let v = 0; v < cap_it; v++){
                    sampleImgs.push(comboz[v]);
                }

                combo = null;
                // console.log(`sample images: ${JSON.stringify(sampleImgs)}`)
                return drawimage(sampleImgs, 1000, 1000);
            };

            const samples = await getSamplesAndClearComboData(combo, 200);
        }
        
        const handleSol = async (e)=>{
            showLoading();
            let elem  = (e)?e.target:null;
            let elemFiles = elem.files;
            
            const  readAndShowFiles = async (demFiles) => {
                let contractArray = [];
                for (let dafile of demFiles) {
                    let readr = new FileReader();
                    readr.onloadend = async ()=>{
                        let  nameArray = dafile.name.split('.');
                        nameArray.splice((dafile.name.split('.').length-1),1);
                        contractArray.push({name: nameArray.join('.'), contract: readr.result});
                        
                        if(contractArray.length === demFiles.length){
                            state.data.contracts = contractArray;
                            state.currsubState = "RandomGenerator-LayerOptions-ContractName";
                            setState((prev)=>prev);
                            hideLoading();
                        }
                    }
                    // readr.
                    readr.readAsText(dafile);
                }
            }

            await readAndShowFiles(elemFiles);
        };

        const collNameBox = (e)=>{
            const ele = e.target;
            const the_value = ele.value.trim();
            
            if( the_value === "" ) return false;
            
            if(ele.getAttribute("id") === "contractSymbol"){
                if(the_value.length > 4 || !isAplhaNumeric(the_value)){
                    ele.value = state.data.coll_symbol;
                    return;
                }

                state.data["coll_symbol"] = the_value;
                ele.setAttribute("placeholder", the_value);
                return;
            }
            
            if(ele.getAttribute("id") === "contractName"){
                if(contractZone){
                    ele.value = state.data.coll_name;
                    return;
                }

                state.data.coll_name = the_value;
                ele.setAttribute("placeholder", the_value);
            }

            if(ele.getAttribute("id") === "LayerName"){
                state.formVals = the_value;
                ele.setAttribute("placeholder", the_value);
            }
        }
        
        function GenLayers (){
            function Layerz(props){
                let mouseUpFired;
                let initPositions = [];
                let elebox = document.getElementById('LayerGenBoxx');
                let initDivIndx = null; let newindex = null;

                useEffect(()=>{
                    [].forEach.call(document.getElementsByClassName('generatorRightPanelLayerBox'), (element) => {
                        initPositions.push( element.getBoundingClientRect().top + document.getElementById('popup').scrollTop );
                        // console.log(`positions; ${JSON.stringify(initPositions)}, popup:: ${document.getElementById('popup').getBoundingClientRect().top}`)
                    });
                },[elebox, initPositions])
                
                function swapSibling(node1, node2) {
                    node1.parentNode.replaceChild(node1, node2);
                    node1.parentNode.insertBefore(node2, node1); 
                }

                const layer_move_initializer = (event)=>{
                    if(event.target.getAttribute('class') === 'generatorRightPanelLayerBox'){
                        mouseUpFired = false;

                        if(event.type === 'mousedown' || event.type === 'touchstart'){
                            if(mouseUpFired === true){ return false; }
                            let div = event.target, divWitdh = div.clientWidth,
                            popup = document.getElementById('popup');
                            // popup.style.overflowY = 'hidden';
                            div.classList.add("sortable-handler");

                            let indexOfSelectedItem = [].indexOf.call(document.getElementsByClassName('generatorRightPanelLayerBox'), div),
                            arrayOfEles = document.getElementsByClassName('generatorRightPanelLayerBox'),
                            centerofdiv = div.clientHeight/2;
                            newindex = indexOfSelectedItem;
                            div.style.width = divWitdh+'px';
                            
                            div.style.top = (event.type === 'touchstart')?((event.touches[0].clientY + popup.scrollTop) - centerofdiv)+'px':((event.clientY + popup.scrollTop) - centerofdiv)+'px';
                            initDivIndx = indexOfSelectedItem;
                            // console.log(`mouse location: ${event.clientY}, div loaction ${popup.scrollTop}`);
                            window.onmousemove = (e)=>{
                                if(mouseUpFired === false){
                                    div.style.top = ((e.clientY + popup.scrollTop) - centerofdiv)+'px';
                                    initPositions.forEach((element, i) => {
                                        if ( indexOfSelectedItem > i ) {
                                            if ( ( ( e.clientY + popup.scrollTop ) - 35 ) < ( element ) && ( ( e.clientY + popup.scrollTop ) - 35 ) > ( element - 70 ) ) {
                                                swapSibling(arrayOfEles[i].parentNode, div.parentNode);
                                                newindex = i;
                                                indexOfSelectedItem = i;
                                            }
                                        }

                                        if( indexOfSelectedItem < i ) {
                                            if ( ( ( e.clientY + popup.scrollTop ) + 35 ) > ( element + 70 ) && ( ( e.clientY + popup.scrollTop ) + 35 ) < ( element + 140 ) ) {
                                                swapSibling(div.parentNode, arrayOfEles[i].parentNode);
                                                newindex = i;
                                                indexOfSelectedItem = i;
                                            }
                                        }
                                    });
                                }
                            };
                            
                            window.ontouchmove = (e)=>{
                                if(mouseUpFired === false){
                                    div.style.top = ( ( e.touches[0].clientY + popup.scrollTop ) - centerofdiv )+'px';
                                    initPositions.forEach((element, i) => {
                                        if ( indexOfSelectedItem > i ) {
                                            if( ( ( e.touches[0].clientY + popup.scrollTop ) - 35 ) < (element) && ( ( e.touches[0].clientY + popup.scrollTop ) - 35 ) > ( element - 70 ) ){
                                                swapSibling(arrayOfEles[i].parentNode, div.parentNode);
                                                newindex = i;
                                                indexOfSelectedItem = i;
                                            }
                                        }

                                        if ( indexOfSelectedItem < i ) {
                                            if( ( ( e.touches[0].clientY + popup.scrollTop ) + 35 ) > ( element + 70 ) && ( ( e.touches[0].clientY + popup.scrollTop ) + 35 ) < ( element + 140 )){
                                                swapSibling( div.parentNode, arrayOfEles[i].parentNode );
                                                newindex = i;
                                                indexOfSelectedItem = i;
                                            }
                                        }
                                    });
                                    
                                }
                            };
                        }
                    }
                };

                const layer_move_ender = (event)=>{
                    if(event.target.getAttribute('class') === 'generatorRightPanelLayerBox'){
                        showLoading();
                    }
                    
                    mouseUpFired = true;
                    
                    if(event.type === 'mouseup' || event.type === 'touchend' ){
                        let popup = document.getElementById('popup');
                        // popup.style.height = 'auto';
                        // popup.style.overflowY = 'auto';
                        let div = event.target;
                        div.classList.remove("sortable-handler");
                        let arrayOfEles = document.getElementsByClassName('generatorRightPanelLayerBox');
                        let p = 0;
        
                        while ( p < arrayOfEles.length ) {
                            arrayOfEles[p].classList.remove('betweenItem_two');
                            arrayOfEles[p].classList.remove('betweenItem');
        
                            p++;
                        }
        
                        mouseUpFired = true;
        
                        if(event.target.getAttribute('class') === 'generatorRightPanelLayerBox'){
                            if(initDivIndx !== newindex){
                                let tempArray = state.data.layers.splice(initDivIndx,1)[0];
                                state.data.layers.splice(newindex, 0, tempArray);
                            }
                            // let scrollEle = (document.getElementById('popup'))?document.getElementById('popup'):document.getElementById('popupdark');
                            return setState((prev)=>({...prev}));
                            // hideLoading();
                        }
                        
                    }
                    
                };

                const setTrait = async (e)=>{

                    e.preventDefault();
    
                    const ele = e.target;
                    
                    if(ele.value){
                            // let eleindex = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);
                            let eleindex = parseInt(ele.getAttribute('id').split('_')[1]);
                            // let key = props.obj.key;
                            let eleparentNode = ele.parentNode.parentNode.parentNode.parentNode;
                            let eleClassName = eleparentNode.getAttribute('class');
                            let eleKey = [].indexOf.call(document.getElementsByClassName(eleClassName), eleparentNode);
                            
                            console.log(`this key is ${[].indexOf.call(document.getElementsByClassName(eleClassName), eleparentNode)}`);
                            state.data.layers[eleKey].traits[eleindex].trait_name = ele.value;
                            ele.setAttribute('placeholder', ele.value);
                            // trait_name
                    }
                };

                const delTrait = async (e)=>{
                    showLoading();
                    e.preventDefault();
                    const ele = e.target;
                    let eleindex = parseInt(ele.getAttribute('id').split('_')[1]);
                    let eleparentNode = ele.parentNode.parentNode.parentNode.parentNode;
                    let eleClassName = eleparentNode.getAttribute('class');
                    let eleKey = [].indexOf.call(document.getElementsByClassName(eleClassName), eleparentNode);
                    let delVal = state.data.layers[eleKey].traits.splice(eleindex, 1);
                    let boddy = new FormData();
                    let conntd = await iswalletConnected();
                    
                    if(conntd !== false){
                        boddy.append('account', conntd);
                    }else{
                        console.log(`Wallet not connected!!`);
                        return false;
                    }
                    
                    boddy.append('value', JSON.stringify(delVal));

                    // let deletedTrait = await fetch(baseServerUri+'api/delTrait', {method:"post", body: boddy,}).then((res)=> res.json()).then((piss)=>piss);
                    
                    // if(deletedTrait.error){
                    //     state.data.msg = deletedTrait.error;
                    //     hideLoading();
                    //     return setState((prev)=>( prev ));
                    // }

                    if(state.data.layers[eleKey].traits.length === 0) state.data.layers.splice(eleKey, 1);

                    hideLoading();
                    return setState((prev)=>({...prev}));
                };

                let editLayer = (e)=>{
                    e.preventDefault();
                    let ele = e.target;
                    let eleIndex = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);
                    setState((prev)=>({...prev, temp_index: eleIndex, currsubState: "RandomGenerator-LayerOptions-Edit-Layer" } ));
                }
        
                const DetailEditTraitBox = ()=>{
                    let boxcont = [];
                    for  (let indxx = 0; indxx < state.data.layers[props.obj.key].traits.length; indxx++){
                        let imgsrc = imgURLFromBase64String(state.data.layers[props.obj.key].traits[indxx].path);
                        boxcont.push(<div key={indxx} className='LayerUpldContentBx'>
                            <div className='LayerUpldContent'>
                                <img src={imgsrc} alt=''/>
                                <div className='traitName'>
                                    <input className='traitNameBox' id={"traitName_"+indxx} placeholder={state.data.layers[props.obj.key].traits[indxx].trait_name} type="text" name='name' onClick={(e)=>{ e.target.value = state.data.layers[props.obj.key].traits[parseInt(e.target.getAttribute("id").split("_")[1])].trait_name}} onChange={setTrait} />
                                    <Buttonz data={{class:"edit-trait-img-svg", id:'delele_'+indxx, value:'X', func: delTrait}} />
                                </div>
                            </div>
                        </div>)                             
                    };
                    return(boxcont);
                }
                
                return(
                    <div className='layer-box-content' onMouseDown={layer_move_initializer} onMouseUp={layer_move_ender} onTouchStart={layer_move_initializer} onTouchCancel={layer_move_ender} onTouchEnd={layer_move_ender}>
                        <div className='generatorRightPanelLayerBox'>
                            <button className='expander-box' onClick={expandbox} >
                                <div className="prioBox" style={{width:"10px", float: "left", height:"10px", borderRadius:"5px", left:"-10px", top:"-10px", boxSizing:"border-box", backgroundColor:"rgb(140, 140, 140)"}} onClick={nullFunc}>
                                    <div className="prioBoxx" style={{width:"70%", height:"70%", margin:"15%", borderRadius:"35%", backgroundColor:(state.data.layers[props.obj.key].priority)?"rgb(0, 172, 7)":"#F0000", boxSizing:"border-box", borderLeft:(state.data.layers[props.obj.key].priority)?"1px solid rgb(159, 255, 162)":"1px solid rgb(190, 190, 190)", borderTop:(state.data.layers[props.obj.key].priority)?"1px solid rgb(159, 255, 162)":"1px solid rgb(190, 190, 190)"}}>
                                        <div className="prioBoxxx" style={{width:"30%", height:"30%", top:"1px", right:"1px", borderRadius:"35%", backgroundColor:(state.data.layers[props.obj.key].priority)?"rgb(159, 255, 162)":"rgb(190, 190, 190)", boxSizing:"border-box",}}>
                                        </div>
                                    </div>
                                </div>
                                <div className='generatorRightPanelLayerBox-title' >
                                    <span className='generatorRightPanelLayerBox-title-Span'> {props.obj.name} </span>
                                </div>
                                <div className='generatorRightPanelLayerBox-title-img-div' >
                                    <img height='12px' width='12px' className='generatorRightPanelLayerBox-title-img' src='./inverted-triangle.svg' alt='' />
                                </div>
                            </button>
                            <div className='edit-trait-box'>
                                <div className='edit-trait-img-div' onClick={editLayer}>
                                    <img className='edit-trait-img' src='./edit icon.svg' alt='Edit layer' />
                                </div>
                            </div>
                        </div>
                        <div className='detail-edit-trait-box inactive'>
                            <button className='LayerUpldContentBxAdd' onClick={handleAddLayer} >+</button>
                            <DetailEditTraitBox/>
                        </div>
                    </div>
                )
            }

            if(state.currsubState === "RandomGenerator" && state.data.layers ){

                if(state.data.layers.length > 0){
                    
                    let layerlen = 0; let boxcont = [];

                    while (layerlen < state.data.layers.length){
                        
                        boxcont.push(<Layerz obj={{name:state.data.layers[layerlen].name, key:layerlen}} key={layerlen}/>)

                        layerlen++;
                    }
                    
                    return(boxcont)

                }else{
                    return('')
                }
            }
        }
        
        // console.log(`char code for space: ${" ".charCodeAt(0)}`);
        
        function Dabttn(){
            const setBGTrait = (e)=>{
                e.preventDefault();
                const ele = e.target;
                
                if(ele.value){
                    if(ele.getAttribute('id').split('_')[0] === 'BGName'){
                        let eleKey = [].indexOf.call(document.getElementsByClassName('BG_traitNameBox'), ele);
                        state.data.background[eleKey].trait_name = ele.value;
                        ele.setAttribute('placeholder', ele.value);
                    }
                }
            };

            const delBG = async (e)=>{
                showLoading(); e.preventDefault(); const ele = e.target;
                
                const eleindex = parseInt(ele.getAttribute('id').split('_')[1]);
                const delVal = state.data.background.splice(eleindex, 1);
                let boddy = new FormData();

                // const conntd = await iswalletConnected();
                // if(conntd !== false){
                //     boddy.append('account', conntd);
                // }else{
                //     hideLoading();
                //     return false;
                // }
                
                // boddy.append('value', JSON.stringify(delVal))
    
                // let deletedTrait = await fetch(baseServerUri+'api/delTrait', {method:"post", body: boddy,}).then((res)=>res.json()).then((piss)=>piss);
                
                // if(deletedTrait.error){
                //     state.data.msg = deletedTrait.error;
                //     hideLoading();
                //     return setState((prev)=>( prev ));
                // }

                if( state.data.background?.length === 0 ) delete state.data.background;

                hideLoading();
                return setState((prev)=>({...prev}));
            };
            
            if(state.data.layers?.length > 1){
                let Bgwords = (state.data.background)?'GENERATE':'Choose Backgrounds';
                
                function TheBGs(){
                    if(state.data.background){
                        let indxx = 0; let bgstack = [];
                        
                        while ( indxx < state.data.background.length ){
                            const imgURL = imgURLFromBase64String( state.data.background[indxx].path );
                            bgstack.push(<div key={indxx} className='BG_UpldContentBx'><div className='BG_UpldContent'><img src={imgURL} alt=''/><DaInput data={{class:'traitName', typeClass:'BG_traitNameBox', typeId:"BGName_"+indxx, placeholder:state.data.background[indxx].trait_name, type:'text', name:'name', onClick:(e)=>{ e.target.value = state.data.background[parseInt(e.target.getAttribute("id").split("_")[1])].trait_name}, onChange:setBGTrait }}/></div><Buttonz data={{class:"delBG", id:'deleteBGUpldContentBx_'+indxx, value:'X', func: delBG}} /></div>)
                            indxx++;
                        }

                        return(
                            <div>
                                <div className='bg_title_box'> <span> Backgrounds </span> </div>
                                {bgstack}
                                <div className='LayerbgAdd' id='selectBG' style={{zIndex:"1"}} onClick={handleAddBGLayer}>
                                    <div className='LayerbgContentadd'> <span>+</span> </div>
                                    <span> Add image. </span>
                                </div>
                            </div>
                        )
                    }
                }

                return(
                    <div>
                        <TheBGs/>
                        <Buttonz data={{class:"LayerUpldBttn", id:(state.data.background)?'Generate-pfp':'selectBG', value: Bgwords, func: (state.data.background)?generate_it:handleAddLayer}} />
                    </div>
                )
            }
        }
        
        let activeContract = state.data["activeContract"], conDetails = {};
        
        useEffect(()=>{
            if(state.data["contracts"] && activeContract){
                conDetails["name"] = state.data["contracts"][activeContract].name;
                conDetails["contract"] = state.data["contracts"][activeContract].contract;
            }
        },[activeContract])

        function ThaSamples (){
            if(state.data.samples?.length > 0){
                let sampleLen = 0; let boxcont = [];

                while (sampleLen < state.data.samples?.length){
                    // console.log(`samples length:: ${state.data.samples.length}, samples index:: ${state.data.samples} ${JSON.stringify(state.data.samples)}`);
                    const imgurl = imgURLFromBase64String(state.data.samples[sampleLen].path);
                    boxcont.push(<div key={sampleLen} className='LayerUpldContentBx'><div className={(state.currsubState === "RandomGenerator-ContractDeployed")?"LayerUpldContent":"LayerUpldContent"}><img className='sampleImage' src={imgurl} alt=''/></div></div>);
                    sampleLen++;
                }
                
                return(boxcont)
            }

            // showLoading();
            // checkWorkInterval(`${baseServerUri}progress/generator/${state.data.coll_name}`, 45000, (piss)=>{
            //     console.log(`meeehh its done-- ${JSON.stringify(piss)}`);
            //     if(piss !== null && piss !== undefined){
            //         stopCheckWork();
            //         state.data.samples = piss.data.samples;
            //         setState((prev)=>prev);
            //         hideLoading();
            //     }

            //     return (<span style={{color:"white"}}>homoooo: {piss}</span> )
            // });
        }
        
        let contractZone = (state.currsubState === "RandomGenerator-RandomGenerated")?true:false;
        
        function ContractBox(){
            let boxxcont = [];
            if(state.data.contracts?.length > 0 && state.currsubState !== "RandomGenerator-ContractDeployed"){
                const expandContractBox  = (e)=>{
                    let ele = e.target;
                    let cntrctbox = document.getElementById('contract-container');
                    if (cntrctbox.classList.contains("contract-container-expanded")){
                        cntrctbox.classList.remove('contract-container-expanded');
                        cntrctbox.classList.add('contract-container');
                        ele.innerText = "expand"
                    }else{
                        cntrctbox.classList.add('contract-container-expanded');
                        cntrctbox.classList.remove('contract-container');
                        ele.innerText = "less"
                    }
                };

                let sampleLen = 0;
                const the_contracts = state.data.contracts;
                const showContract = (e)=>{
                    showLoading();
                    e.preventDefault();
                    e.stopPropagation();
                    const da_ele = e.target;
                    const daindex = parseInt(da_ele.getAttribute('id').split("_")[1]);
                    state.data.activeContract = daindex;
                    setState((prev)=>({...prev}));
                    hideLoading();
                };
                
                while (sampleLen < the_contracts.length){
                    boxxcont.push(
                        <button key={sampleLen} onClick={showContract} className={"contractBox"} id={"contractBox_"+sampleLen}>
                            <img src='./solidity_icon.svg' id={"contractBoxImg_"+sampleLen} alt=''/>
                            <span id={"contractBoxSpan_"+sampleLen} >{ the_contracts[sampleLen].name }</span>
                        </button>
                    );
                    
                    sampleLen++;
                }
                
                // let contractDetailsBox = (typeof(activeContract) === "number")? <div className='contract-box'><div id='contract-container' className='contract-container'><h2>{state.data["contracts"][activeContract].name}.sol</h2><span>{state.data["contracts"][activeContract].contract}</span></div><Buttonz data={{class:"expand-contract", id: "expand_contract", value: "expand", func:expandContractBox}} /></div>:"";
                let contractDetailsBox = <div className='contract-box'><div id='contract-container' className='contract-container'><h2>{state.data.contracts[0]?.name}.sol</h2><span>{state.data.contracts[0]?.contract}</span></div><Buttonz data={{class:"expand-contract", id: "expand_contract", value: "expand", func:expandContractBox}} /></div>;
                return(
                    <div>
                        {/* <div id="pissingD"> {boxxcont} </div> */}
                        {contractDetailsBox}
                    </div>
                )
            }
        }

        function AddLayer(){
            return(
                <div style={{marginBottom:"20px"}}>
                    <input type="file" id={(contractZone)?'project_contract':'single_asset'} name={(contractZone)?'project_contract':'single_asset'} accept={(contractZone)?'*':"image/*"} multiple="multiple" style={{opacity:100, zIndex:1}} onChange={(contractZone)?handleSol:state.data.func} hidden/>
                    <button className='generatorRightPanelAddNewLayer' id='generatorRightPanelAddNewLayer' onClick={(e)=>{if(!contractZone){ if(state.data.coll_name?.length > 0){ state.temp_index = null; handleAddLayer(e); }else{ setErrStacks( (prev)=>({...prev, formdata:[{id:"contractName", value: document.getElementById("contractName").value, msg: "Enter a project/NFT name!"}], substate:state.currsubState }) )} }else{ return nullFunc(e)}}} > + </button>
                </div>
            )
        }

        function CollNameBox(){
            return(<div className='coll_name_box'>
                <div className='contractNameContainer'>
                    <BoxTitle data={{class:'contractNameText', type:'span', text:'Name:'}}/>
                    <DaInput data={{ type:'text', typeId:'contractName', typeClass:'contractName', placeholder:(state.data.coll_name)?state.data.coll_name:"Enter your project name.", onChange:collNameBox, onClick:(e)=>{e.target.value = state.data.coll_name}}}/>
                </div>
                <div className='contractSymbolContainer'>
                    <BoxTitle data={{class:'contractSymbolText', type:'span', text:'Symbol:'}}/>
                    <DaInput data={{ type:'text', typeId:'contractSymbol', typeClass:'contractSymbol', placeholder:(state.data.coll_symbol)?state.data.coll_symbol:"Enter project symbol.", onChange:collNameBox}}/>
                </div>
            </div>)
        }

        let currentSubState, LayerUpldBoxTitle, mainBox, daButtn, addLayer, coll_Name_Box;

        switch (state.currsubState) {
            case "RandomGenerator-ContractDeployed":
                mainBox = <div className='contract-box' id='LayerGenBoxx'> 
                    <div className='contract-deployed-container'>
                        <BoxTitle data={{class:'generatorRightPanelTitle', type:'h2', text:'Contract Deployed.'}}/>
                        <a href={state.data.contract_link} target="_blank" rel="noreferrer"><BoxTitle data={{class:'regularText', type:'span', text:`Contract address: ${state.data.contract_address}`}}/></a>
                    </div>
                    <div className="contract-deployed-container" style={{marginTop:"20px"}}>
                        <BoxTitle data={{class:'generatorRightPanelTitle', type:'h4', text:'Generated Samples.'}}/>
                        <ThaSamples/>
                    </div>
                </div>;
                break;
            case "RandomGenerator-RandomGenerated":
                coll_Name_Box = <CollNameBox/>;
                daButtn = <Buttonz data={{class:"LayerUpldBttn", id:'Generate-pfp', value: 'Deploy Contract', func: deployContract}} />;
                mainBox = <div><div className='contract-deployed-container'><ContractBox/><div id='LayerGenBoxx'><div className='contract-deployed-container' style={{marginTop:"20px"}}><BoxTitle data={{class:'generatorRightPanelTitle', type:'h4', text:'Generated Samples.'}}/><ThaSamples/></div></div></div></div>;
                // LayerUpldBoxTitle = <div> <BoxTitle data={{class:'generatorRightPanelTitle', type:'h1', text:'Contract.'}}/><BoxTitle data={{class:'generatorRightPanelTitle', type:'span', text:`Click the "${(activeContract)?state.data["contracts"][activeContract]?.name:state.data["contracts"][0]?.name}" button to view the NFT contract. \nIf you already have a contract, click "Already have a contract" to link your contract.` }}/></div>
                break;
            case "RandomGenerator-LayerOptions-AddLayer":
                currentSubState = <div className='LayerUpldBox'>
                    <DaInput data={( state.temp_index  !== null )? { typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', hidden:true, value:state.data.layers[ state.temp_index ]?.name } : { typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:(state.formVals !== null)?state.formVals:'Enter layer name.', onChange:collNameBox, onClick:(e)=>{ e.target.value = state.formVals;} } }/>
                    <BoxTitle data={{class:"generatorRightPanelTitle", type:'span', text:`Click the "+" to upload layer images${( state.temp_index !== null)?" for: "+state.data.layers[ state.temp_index ]?.name:""}.`}}/>
                    <label className='LayerUpldBttn' id='LayerUpldLabel' htmlFor='multi_asset' onClick={(e)=>{ let ele_val = state.formVals; if( !ele_val && state.temp_index === null ) { e.preventDefault(); setErrStacks((prev)=>( {...prev, formdata:[{id:"LayerName", value: document.getElementById("LayerName").value, msg: "Enter a layer name!"}], substate:state.currsubState } )) } }}>
                        <h1>+</h1>
                        <DaInput data={{hidden:true, type:'file', typeId:'multi_asset', class:'inactive', name:'multi_asset', multiple:'multiple', accept:'image/*', onChange:handleAddLayerUpld}}/>
                    </label>
                    <div id='layerContentBox'></div>
                    <Buttonz data={{class:"LayerUpldBttn", id:'', value: (typeof( state.temp_index ) === "number")?'Add':'Create', func: handleAddLayerUpld}} />
                </div>;
                break;
            case "RandomGenerator-LayerOptions-BG-Upld":
                currentSubState = <div className='LayerUpldBox'>
                    <BoxTitle data={{class:"generatorRightPanelTitle", type:'span', text:'Click the "+" to upload background images.'}}/>
                    <label className='LayerUpldBttn' htmlFor='multi_asset'>
                        <h1>+</h1>
                        <DaInput data={{typeClass:'LayerName', typeId:'multi_asset', name:'bg_asset', type:'file', multiple:'multiple', hidden:true, accept:'image/*', onChange:handleAddLayerUpld}}/>
                    </label>
                    <div id='layerContentBox'></div>
                    <Buttonz data={{class:"LayerUpldBttn", id:'bg_upld', value: 'No Background', func: handleAddLayerUpld}} />
                </div>;
                break;
            case "RandomGenerator-LayerOptions-Edit-Layer":
                currentSubState = <div className='LayerUpldBox'>
                    <BoxTitle data={{class:"editBoxTitle", type:'h2', text:`Edit '${state.data.layers[ state.temp_index ]?.name}' layer.`}}/>
                    <div style={{ padding:"0px 10px 10px 10px"}}>
                        <BoxTitle data={{class:"generatorRightPanelTitle", type:'h4', text:`Rename layer.`}}/>
                        <Buttonz data={{class:'renameLayerBttn', id:'bg_upld', value:'Rename', func: renameLayer}} />
                    </div>
                    <div style={{ padding: "0px 10px 10px 10px", width: "30%", boxSizing: "border-box", display: "inline-block"}}>
                        <BoxTitle data={{class:"generatorRightPanelTitle", type:'h4', text:`Prioritized.`}}/>
                        <button id="priorityLayerBttn" className={( state.data.layers[ state.temp_index ].priority === true )?'disablepriorityLayerBttn':'makepriorityLayerBttn'} onClick={(e)=>{ let isPriority = state.data.layers[ state.temp_index ].priority; state.data.layers[ state.temp_index ].priority = ( isPriority === true )?false:true; document.getElementById("priorityLayerBttn").classList.toggle("disablepriorityLayerBttn"); document.getElementById("priorityLayerBttn").classList.toggle("makepriorityLayerBttn"); document.getElementById("makepriorityLayerOption").classList.toggle('ispriorityLayerOption'); document.getElementById("makepriorityLayerOption").classList.toggle('notpriorityLayerOption'); document.getElementById("makepriorityLayerOptionSpan").innerText =( isPriority === true )?"NO":"YES"; }}>
                            <div id='makepriorityLayerOption' className={( state.data.layers[ state.temp_index ].priority === true )?'ispriorityLayerOption':'notpriorityLayerOption'}>
                                <span id='makepriorityLayerOptionSpan'>{( state.data.layers[ state.temp_index ].priority === true )?"YES":"NO"}</span>
                            </div>
                        </button>
                    </div>
                    <div style={{ padding: "0px 10px 10px 10px", width: "70%", boxSizing: "border-box", display: "inline-block", float:"right"}}>
                        <BoxTitle data={{class:"generatorRightPanelTitle", type:'h4', text:`Delete layer.`}}/>
                        <Buttonz data={{class:"delLayerBttn", id:'bg_upld', value: 'DELETE', func: delLayer}} />
                    </div>
                </div>
                break;
            case "RandomGenerator-LayerOptions-Rename_Layer":
                currentSubState = <div className='LayerUpldBox'>
                    <BoxTitle data={{class:"generatorRightPanelTitle", type:'h4', text:'Change layer name.'}}/>
                    <DaInput data={{typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:state.data.layers[ state.temp_index ]?.name, onChange:renameLayer}}/>
                    <Buttonz data={{class:"nodelLayerBttn", id:'', value:'SUBMIT', func: closeLayerOptionsBox}} />
                </div>
                break;
            case "RandomGenerator-LayerOptions-Del-Layer":
                currentSubState = <div className='LayerUpldBox'>
                    <BoxTitle data={{class:"generatorRightPanelTitle", type:'h4', text:`Select yes to delete ${state.data.layers[ state.temp_index ]?.name} layer.`}}/>
                    <Buttonz data={{class:'delLayerBttn', id:'', value:'YES', func: delLayer}} />
                    <Buttonz data={{class:'nodelLayerBttn', id:'', value:'NO', func: closeLayerOptionsBox}} />
                </div>
                break;
            case "RandomGenerator-LayerOptions-ContractName":
                currentSubState = <div className='LayerUpldBox'>
                    <BoxTitle data={{class:"generatorRightPanelTitle", type:'h2', text:'enter contract name.'}}/>
                    <DaInput data={{typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:"Enter main contract name.", onChange:collNameBox}}/>
                    <ContractBox/>
                    <Buttonz data={{class:"nodelLayerBttn", id:'', value:'SUBMIT', func: nullFunc}} />
                </div>
                break;
            default:
                daButtn = <Dabttn/>
                currentSubState = "";
                state.formVals = null; state.temp_index = null;
                coll_Name_Box = <CollNameBox/>; addLayer = <AddLayer/>;
                mainBox = <div id='LayerGenBoxx'><GenLayers/></div>;
                LayerUpldBoxTitle = <div> <BoxTitle data={{class:'generatorRightPanelTitle', type:'h2', text:'LAYERS'}}/> <BoxTitle data={{class:'generatorRightPanelTitle', type:'span', text:`Click the "+" icon to create new layer`}}/></div>;
                break;
        }
        
        function MainContainer (){
            hideLoading();
            if(!currentSubState){
                return(
                    <>
                        <button className='closeBox' onClick={()=> setState((prev)=>homeSate) }>X</button>
                        <div className='RandomGenerator'>
                            {coll_Name_Box}
                            <div className='LayerGenBox'>
                                {LayerUpldBoxTitle}
                                {addLayer}
                                {mainBox}
                                {daButtn}
                            </div>
                        </div>
                    </>
                )
            }else{
                return(
                    <>
                        <Buttonz data={{class:"closeBox", id:'', value:'X', func: closeLayerOptionsBox}} />
                        <div className='LayerOptionsBox'>{currentSubState}</div>
                    </>
                )
            }
        }
        
        return( <div> <MainContainer/> </div> )
    };

    function Bet (props){
        return (
            <div className='popup'>
                {/* <Buttonz data={{class:'closeBox', value:'X',}}/> */}
                <button className='closeBox' onClick={()=> setState((prev)=>homeSate) } >
                    X
                </button>
                <div className='popupBox'>
                    {/* <Competition state={state}/> */}
                    {/* <CollNFTForm state={state}/> */}
                </div>
            </div>
        )
    }

    function WelcomeBox(){
        return (
            <div className='welcomeBox'>
                <div className="welcomeBoxElement">
                    <button className='containerbox' onClick={ async()=>{ showLoading(); const conndt = await iswalletConnected(); if(conndt === false){ hideLoading(); }else{ hideLoading(); setState((prev)=>({...prev, state: "SelectCreateOption"})) } }} >
                        <div className='title'>
                            <h1>Create</h1>
                            <span style={{display:"block", textAlign:"center", }}> NFTs, Tokens(ERC20, 721, 1155) </span> 
                        </div>
                    </button>
                </div>
                <div className="welcomeBoxElement">
                    <button className='containerbox' onClick={()=>nullFunc} >
                        <div className='title'>
                            <h1> De-Fi </h1>
                            <span style={{display:"block", textAlign:"center", }}> coming soon </span>
                        </div>
                    </button>
                </div>
                <div className="welcomeBoxElement">
                    <button className='containerbox' onClick={()=>''} >
                        <div className='title'>
                            <h1> De-fi </h1>
                            <span style={{display:"block", textAlign:"center"}}> coming soon </span>
                        </div>
                    </button>
                </div>
                <div className="welcomeBoxElement">
                    <button className='containerbox' onClick={()=>''} >
                        <div className='title'>
                            <h1> trade </h1>
                            <span style={{display:"block", textAlign:"center"}}> coming soon </span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }
    

    let currentState;
    switch (state.state) {
        case 'bet':
            currentState = <div className='popup'><Bet/></div>;
            break;
        case 'createbox':
            currentState = <div className='popup'> <SingleNft/> </div>;
            break;
        case 'RandomGenerator':
            currentState = <div id='popup' className='popupdark'> <RandomGenerator/> </div>;
            break;
        case 'SelectCreateOption':
            currentState = <> <div className='createOptions'> <SelectCreateOption state={state}/> </div> </>;
            break;
        default:
            currentState = <div className='popupdark'> <Header data={state}/> <WelcomeBox/> </div>;
            // currentState = <div style={{ backgroundColor: "rgba(0, 3, 40, 0.7)", backdropFilter: "blur(5px)", minHeight:"100vh", width:"100%"}}><Header data={state}/>{/* <div style={{padding:"20px", backgroundColor:"yellow", height: "fit-content", margin: "20px 0px"}}> <h1 style={{color:"#000"}}> Create & deploy assets to the blockchain! </h1> <span style={{display: "block", textAlign: "center", fontSize:"15px", fontWeight: "500"}}>-Generate and Store NFT projects(no code needed)<br></br><br></br>-Create NFTs -Create Tokens<br></br></span></div> <button className="enableEthereumButton" onClick={mintNEW}>mint</button> <button className="enableEthereumButton" onClick={iswalletConnected}>Enable Ethereum</button> */}<WelcomeBox/></div>;
            break;
    }

    return( <> <LoadingBox/> <MsgBox errStacks={errStacks} subState= { state.currsubState } /> {currentState} </> );
}

export default memo(Body);