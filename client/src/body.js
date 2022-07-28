import './body.css'; import './App.css'; import './header.css';

import {useState, memo, useEffect, useRef} from 'react'; //useEffect
import {providers, Contract, utils, BigNumber, HDNode} from "ethers";
import yaadtokenAbi from './contracts/Yaad.json';
import { createCanvas, loadImage, canvas } from 'canvas';
// import legitokenAbi from './contracts/Legi.json';
const pumpum = window.location.host;

let baseServerUri = (pumpum  === "localhost:3000")?'./':'https://yaadlabs.herokuapp.com/';
let provider = null, signer = null;
let intervalId;

if (typeof window.ethereum !== 'undefined') {
    
    // console.log('MetaMask is installed!');
    
    provider = new providers.Web3Provider(window.ethereum, "any");
    
    provider.on("network", (newNetwork, oldNetwork) => {
        // When a Provider makes its initial connection, it emits a "network"
        // event with a null oldNetwork along with the newNetwork. So, if the
        // oldNetwork exists, it represents a changing network
        if (oldNetwork) {
            console.log(`oldNetwork: ${JSON.stringify(oldNetwork)}`)
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

// const tokenAddy = '0x5dDebA6Ef00bD641c198174dC153767C40a6C743';
// const contract__addy = '0xcFDEb297643119cd58dB2e48BE7aBEA09B44F0D3';
const etherTokenAddy = '0x0DDfBF1E76F37eE8545595ce6AD772d5a326B33A';

const etherToken = new Contract(etherTokenAddy, yaadtokenAbi.abi, signer);

document.addEventListener('submit', (e)=>{
    e.preventDefault();
});

let showLoading = ()=>{

    document.getElementById('loadingpopup').classList.remove('inactive');                    

}

let hideLoading = ()=>{

    document.getElementById('loadingpopup').classList.add('inactive');                    

}

const getGas = async (trans)=>{

    return (trans)?trans.estimateGas():false;

};

const iswalletConnected = async ()=>{
    if(window.ethereum){
        
        const accounts = await window.ethereum.request({method:'eth_accounts'});
        
        // console.log(`gasPrice: ${await getGas().finally((eee)=>eee)}`);

        // let gaslimit = gasNow.add(50000)
        
        // console.log(`gas limit: ${}`);
        
        if(accounts.length  > 0){
            // const account = accounts[0];
            // console.log(`account:: ${accounts[0]}`);
            // onConnect(account)
            return accounts[0];
        }else{
            const accounts = await window.ethereum.request({method: "eth_requestAccounts"}).catch((error)=>false);
            // console.log(`account__: ${accounts}`);
            return (accounts === false)? false : accounts[0];
        }
    }else{

        alert("get metamask");
        return false;

    }
};

const readFile = async (dFile)=>{
    let reader = new FileReader();

    reader.onloadend = (e)=>{
        let content = reader.result;
        // console.log(`content:: ${content}`);
        return content;
    }

    reader.readAsText(dFile);
}

function LoadingBox(props){
    // let loading_text = "Please Wait";
    return(
        <div id='loadingpopup' className='inactive'>
            <div id='loadingbttn' >
                <img src="./loading.svg" alt=""/>
                <div className='loadingbttn_text_box'>
                    <span style={{color:"white"}}>Please Wait</span>
                </div>
            </div>
        </div>
    )
}

const checkJsonParse = (str)=>{
    if(typeof(str) !== 'string') return [true];
    // console.log(`str:: ${str}`);
    try {
        return [null, JSON.parse(str)];

    } catch (error) {
        
        return [error];
    }
}

function shuffle(arra1) {
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

function Body(props){

    // hideLoading();
    const homeSate = {state:"", data:{"createbox":"", "bet":""}, currsubState:{"createbox":"createbox", "bet":"bet"}};

    let temp_state = {state:"", data:{"createbox": "", "bet":""}, currsubState:{"createbox":"createbox", "bet":"bet"}};

    let [state, setState] = useState(homeSate);

    let [editState, setEditState] = useState(null);

    let [scrollPosition, setScrollPosition] = useState(0);
    
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

    const changeEditState = (val)=>{
        let mounted = true;
        if(mounted){
            setEditState(val);
        }
        return ()=> mounted = false;
    }

    const mintNEW = async (uri)=>{
        
        let isconnected = await iswalletConnected();
        if(isconnected !== false){
            
            console.log(`uri: ${JSON.stringify(uri)}`);
            let gasNow = await getGas(signer).finally((eee)=>eee);

            let options = {
                gasLimit: BigNumber.from(gasNow).add(5000000),
                value:utils.parseEther('.015')
            };
            try {
                await etherToken.payToMint(isconnected, JSON.stringify(uri), options).finally((res)=>{
                    console.log(res);
                    return true;
                });    
            } catch (error) {
                console.log(error);
            }
            
        }
        // IpfsHash: 'QmZuPdu8HACXJo5LUB6MUYCs2HpWndsqaZmYBSUpUFYR4M',
        // window.ethereum.on('accountsChanged', function (accounts) {
            // Time to reload your interface with accounts[0]!
        // });
        console.log(isconnected);
        return isconnected;
    }

    let deployArray =[];

    const deployContract = async (contract_array, contratct__name)=>{
        console.log(`arrayy:::>> ${contract_array[0]}`)
        let contractOptions = {
            language: "Solidity", 
            sources: {
              'all.sol': {
                // content: readFileSync('contracts/all.sol', 'utf8')
              },
              'legi.sol': {
                // content: readFileSync('contracts/legi.sol', 'utf8')
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

        for(let l = 0; l < contract_array.length; l++){
            let pisssing = await readFile(contract_array[l]);
            deployArray.push({name:'', contract: pisssing})
        }
    };
    
    const clickCreate = async (dastate)=>{
        showLoading();
        let connected = await iswalletConnected();
        
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

    function MsgBox(){
        if(state.data.createbox.msg){
            return (
                <div className='errorbox'>
                    <span className='errortextt'>
                        {state.data.createbox.msg}
                    </span>
                    <span className='closeErrorbox' onClick={hideErrBox}>
                        x
                    </span>
                </div>
            )
        }else{
            return('')
        }
    }

    const hideErrBox = (e)=>{

        e.target.parentNode.classList.add("inactive");
    
    }
    
    const nullFunc = (e)=>{
        // e.preventDefault();
        return;
    };

    function Buttonz(props){
        return (
            <button className={(props.data.class)?props.data.class:''} id={(props.data.id)?props.data.id:''} style={{zIndex: 11}} onClick={props.data.func}>
                {props.data.value}
            </button>
        )
    }

    function DaInput(props){
        let daInput;
        
        if(props.data.hidden){

            switch (props.data.type) {
                case 'file':
                    daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''} name={(props.data.name)?props.data.name:''} readOnly={(props.data.readOnly)?props.data.readOnly:false} type='file' multiple={(props.data.multiple)?props.data.multiple:''} accept={(props.data.accept)?props.data.accept:'*'} onChange={(props.data.onChange)?props.data.onChange:nullFunc} hidden/>;
                    break;
                case 'textarea':
                    daInput = <textarea className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} value={props.data.value} readOnly={(props.data.readOnly)?props.data.readOnly:false} onChange={(props.data.onChange)?props.data.onChange:nullFunc} hidden></textarea>;
                    break;
                case 'text':
                    daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} type='text' value={props.data.value} readOnly={(props.data.readOnly)?props.data.readOnly:false} onChange={(props.data.onChange)?props.data.onChange:nullFunc} hidden/>;
                    break;
                default:
                    break;
            }
            return(daInput);
        }else{
            switch (props.data.type) {
                case 'file':
                    daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''} name={(props.data.name)?props.data.name:''} type='file' multiple={(props.data.multiple)?props.data.multiple:''} accept={(props.data.accept)?props.data.accept:'*'} onChange={(props.data.onChange)?props.data.onChange:nullFunc} onClick={(props.data.onClick)?props.data.onClick:nullFunc}/>;
                    break;
                case 'textarea':
                    daInput = <textarea className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} onChange={(props.data.onChange)?props.data.onChange:nullFunc} onClick={(props.data.onClick)?props.data.onClick:nullFunc} ></textarea>;
                    break;
                case 'text':
                    daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} type='text' placeholder={(props.data.placeholder)?props.data.placeholder:''} onChange={(props.data.onChange)?props.data.onChange:nullFunc} onClick={(props.data.onClick)?props.data.onClick:nullFunc}/>;
                    break;
                case 'number':
                    daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} type='number' placeholder={(props.data.placeholder)?props.data.placeholder:''} onChange={(props.data.onChange)?props.data.onChange:nullFunc} onClick={(props.data.onClick)?props.data.onClick:nullFunc} />;
                    break;
                default:
                    break;
            }
            return( <div className={(props.data.class)?props.data.class:''} id={(props.data.id)?props.data.id:''}> {daInput} </div> );
        }
    }

    function BoxTitle(props){
        let textType;
        switch (props.data.type) {
            case 'h2':
                textType = <h2 className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''}>{props.data.text}</h2>;
                break;
            case 'span':
                textType = <span className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''}>{props.data.text}</span>;
                break;
            case 'h1':
                textType = <h1 className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''}>{props.data.text}</h1>;
                break;
            case 'h3':
                    textType = <h3 className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''}>{props.data.text}</h3>;
                    break;
            default:
                break;
        }
        return ( <div className={(props.data.class)?props.data.class:''} id={(props.data.id)?props.data.id:''}> {textType} </div> )
    }

    function Header(){
        function SearchBar(){
            return (
                <div className='search-Header-Div'>
                    <button className="headerElementSearch" type='button'>
        
                    </button>
                </div>
            )
        };
        
        function Dropdown(props) {
            
            var body = undefined;
            var init = function init() {
                body = document.querySelector('body');
                
            };
            
            let menuClick = function () {
                return toggleClass(body, 'nav-active');
            };
                
            var toggleClass = function toggleClass(element, stringClass) {
                if (element.classList.contains(stringClass)) element.classList.remove(stringClass);else element.classList.add(stringClass);
            };
            init();
            
        
            return(
                <div className='headerElementMenu'>
                    <div className="cd-header">
                        <div className="nav-but-wrap">
                            <div className="menu-icon hover-target" onClick={menuClick}>
                                <span className="menu-icon__line menu-icon__line-left"></span>
                                <span className="menu-icon__line"></span>
                                <span className="menu-icon__line menu-icon__line-right"></span>
                            </div>					
                        </div>		
                    </div>
        
                    <div className="nav">
                        <div className="nav__content">
                            <ul className="nav__list" style={{cursor:"pointer"}}>
                                <li className="nav__list-item_a" onClick={()=> changeState({state:"", data:{"createbox":"", "bet":""}, currsubState:{"createbox":"createbox", "bet":"bet"}} ) }> Home </li>
                                <li className="nav__list-item_a" onClick={()=>changeState({state:'createbox', data: { "createbox": state.data["createbox"], "bet": state.data["bet"] }, currsubState:{"createbox":state.currsubState["createbox"], "bet":state.currsubState["bet"]}})}> Create </li>
                                <li className="nav__list-item_a"> About </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        }

        const boxStyle = {
            display: "flex",
            position: "relative",
            color: "white",
            backgroundColor: "black",
            fontFamily: "Circular, -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif"
        };
        
        const logoBox = {
            
        };
    
        return (
            <header className='header' style={boxStyle}>
                <div className='headerElementlogo' onClick={()=>window.location = './'}>
                    <span>
                        Yaad
                    </span>
                </div>
                {/* <SearchBar style={logoBox}/> */}
                <Dropdown/>
            </header>
        );
    }

    function handlesingleUload(e){

        const form = e.target.parentNode;
        
        // let coll_box = doc.getElementById('collectionBox');

        let body = new FormData();

        let newItemName = (state.data["createbox"].filename)?state.data["createbox"].filename.split('.'):null;
        
        if(newItemName != null)newItemName.pop();
        
        let assetName = Date.now()+"."+e.target.files[0].name.split('.')[e.target.files[0].name.split('.').length-1];
        
        body.append('single_asset',e.target.files[0],assetName);
        
        if(state.data["createbox"].filename){
            
            body.append('name',state.data["createbox"].filename);
        
        }
        
        // console.log(e.target.files[0].name.split('.')[e.target.files[0].name.split('.').length-1])
        
        fetch(form.action, {method:form.method, body, })
        .then((res)=> res.json())
        .then((piss)=>{

            if(piss.error){
                temp_state.data.createbox = piss;
                
                return changeState(temp_state);
        
            }else{
                
                temp_state.state = "createbox";

                temp_state.data["createbox"] = piss;

                temp_state.currsubState["createbox"] = "SingleNFTDetailsForm";

                return changeState(temp_state);
        
            }
        
        });
    }

    function SelectCreateOption(props) {
        return(
            <div>
                <button className='closeBox' onClick={()=> changeState({state:"", data:{"createbox":"", "bet":""}, currsubState:{"createbox":"createbox", "bet":"bet"}})} >
                    X
                </button>
                <label className='popupBoxEle' id='createBox'>
                    <span>Single NFT</span>
                    <form action={baseServerUri+'api/upldSingle'} method="post" id='createSingleAssetUpld' encType="multipart/form-data">
                        <input type="file" id='single_asset' name='single_asset' accept="image/*,video/*,audio/*,webgl/*" style={{opacity:100, zIndex:1}} onChange={handlesingleUload} hidden/>
                    </form>
                </label>
                <div>
                    <label className='popupBoxEle' id='generateNFT_Coll' onClick={()=>changeState({state:"RandomGenerator", data: { "createbox": "", "bet": state.data["bet"]}, currsubState: {"createbox":"RandomGenerator-LayerOptions", "bet":state.currsubState["bet"]}})}>
                        <span> PFP Project </span>
                    </label>                    
                </div>
            </div>
        )
    };

    function SingleNft (props){

        temp_state.state = "createbox";
        
        function SingleNFTDetailsForm (props){
            
            function handlesingleCreate(e){
                e.target.classList.add('inactive');
                showLoading();
                e.preventDefault();
                
                const form = e.target.parentNode;
                
                const formElements = form.children;
                
                // Create a p element:
                const para = document.createElement("span");
                
                // Append text node to the p element:
                para.textContent = "'Name' cannot be empty.";
                para.classList.add('errortext');

                let n = 0;
                
                while(n < formElements.length){

                    if(formElements[n].tagName === 'TEXTAREA' || formElements[n].tagName === 'INPUT'){

                        if(formElements[n].getAttribute('name') === 'name'){

                            if(formElements[n].value === null || formElements[n].value === "" || formElements[n].value === undefined){

                                if(!formElements[n].classList.contains('errorbox')){

                                    formElements[n].classList.add('errorbox');

                                    formElements[n].after(para);

                                }
                                hideLoading();
                                e.target.classList.remove('inactive');
                                return false;
                            }

                        }
                    }

                    n++;
                }

                let body = new FormData(form);
                
                body.append('filename',state.data["createbox"].filename);
                
                body.append('filepath',state.data["createbox"].path);
                
                fetch(form.action, {method:form.method, body})
                .then((res)=> res.json())
                .then((piss)=>{



                    if(piss.error){

                        // temp_state.state = "createbox";
                        
                        if(piss.error.message === "duplicate"){
                            // Create a p element:
                            const para = document.createElement("span");
                            
                            // Append text node to the p element:
                            para.textContent = "'Name' cannot be empty.";
                            para.classList.add('errortext');
                            // state.data.createbox = {};

                            temp_state.currsubState["createbox"] = "createbox";

                            temp_state.data.createbox.msg = "This item was already uploaded to chain, please upload an original file"
                            
                            hideLoading();
                            
                            return changeState(temp_state);

                        }
                        // temp_state.state = "SingleNFTDetailsForm";
                        
                        temp_state.currsubState.createbox = "SingleNFTDetailsForm";
                        temp_state.data["createbox"] = state.data["createbox"]
                        hideLoading();
                        
                        return changeState(temp_state);
                    
                    }
                    
                    console.log(`state.data: ${JSON.stringify(piss)}`);

                    if(piss.results){

                        mintNEW(piss.results.IpfsHash)
                        .finally((resp)=>{

                            e.target.classList.remove('inactive');
                            if (resp === false){
                                
                                temp_state.currsubState.createbox = "SingleNFTDetailsForm";

                                // temp_state.state = "SingleNFTDetailsForm";

                                changeState(temp_state);
                            
                            }

                            e.target.classList.remove('inactive');
                            
                            hideLoading();
                            
                            temp_state.state = "";
                            
                            temp_state.currsubState.createbox = "createbox"
                            
                            return changeState(temp_state);

                        });
                    }
                });
                
            }

            return(
                <div>
                    <MsgBox/>
                    <form action={baseServerUri+"api/upldSingle"} method="post" id='createSingleAssetUpld' encType="multipart/form-data">
                        <input type="file" id='single_asset' name='single_asset' accept="image/*,video/*,audio/*,webgl/*,.glb,.gltf" style={{opacity:100, zIndex:1}} onChange={state.data["createbox"].func} hidden/>
                    </form>
                    <label className='popupBoxEleDetailsLabel' id='createSingleBoxPreview' htmlFor="createSingleAssetUpld" onClick={()=>{document.querySelector('#single_asset').click()}}>
                        <div className='popupBoxEleDetails'>
                            <img src={baseServerUri+state.data["createbox"].path} style={{objectFit:"cover", height: "100%", width:"100%"}} alt=""/>
                        </div>
                    </label>
                    <form  action={baseServerUri+"api/createone"} method="post" encType="multipart/form-data" >
                        <input className='popupBoxTextEle' placeholder='Name' type="text" name='name' id='singleNFTName' onChange={function(event){if(event.target.value !== ""){ event.target.classList.remove('errorbox'); if(event.target.parentNode.children[Array.from(event.target.parentNode.children).indexOf(event.target)+1].tagName === 'SPAN'){event.target.parentNode.children[Array.from(event.target.parentNode.children).indexOf(event.target)+1].remove();}}}} style={{opacity:100, zIndex:1}} />
                        <textarea className='popupBoxTextAreaEle' placeholder='Description' type="text" name='desc' id='singleNFTName'  style={{opacity:100, zIndex:1}} ></textarea>
                        <input className='popupBoxTextEle' placeholder='Collection' type="text" name='collection' id='singleNFTName'  style={{opacity:100, zIndex:1}} />
                        <input className='popupBoxSmallTextAreaLeftEle' placeholder='Price' type="number" name='price' id='singleNFTName'  style={{opacity:100, zIndex:1}} />
                        <input className='popupBoxSmallTextAreaRightEle' placeholder='Royalties: max 50%' type="number" name='royalties' id='singleNFTName'  style={{opacity:100, zIndex:1}} />
                        <button className='popupBoxEle' id='createBox' onClick={handlesingleCreate}>
                            create
                        </button>
                    </form>
                </div>
            )
                
        };

        function SingleNFTForm (props){
            
            if(state.currsubState["createbox"] === "SingleNFTDetailsForm"){
                (temp_state.data["createbox"] !== "")?temp_state.data["createbox"].func = handlesingleUload:temp_state.data["createbox"] = {func:handlesingleUload}
                return(<SingleNFTDetailsForm/>)
            }else{
                return('');
            }
        };

        return (
            <div className='popup' id='popup'>
                <button className='closeBox' onClick={()=> changeState({state:"", data:{"createbox":"", "bet":""}, currsubState:{"createbox":"createbox", "bet":"bet"}})} >
                    X
                </button>
                <div className='popupBox'>
                    <MsgBox/>
                    <SingleNFTForm state={state}/>
                </div>
            </div>
        )
    }

    function RandomGenerator (props){
        temp_state.state = "RandomGenerator";
        
        let imgbody = new FormData(); let da_files;

        const handleAddBGLayer = (e)=>{

            temp_state.data["createbox"] = state.data["createbox"]; 
            
            temp_state.currsubState["createbox"] = "RandomGenerator-LayerOptions-BG-Upld"; 
            
            changeState(temp_state);

        };

        function handleAddLayer(e){

            showLoading();
            let homeScrollValue = null;
            
            if(e){
                e.preventDefault();
                console.log(`class:::: ${e.target.getAttribute('class')}`);

                // e.target.classList.add('inactive');
                // let ele = e.target;

                // let eleindex = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);
                
                temp_state.data["createbox"] = state.data["createbox"];

                temp_state.currsubState["createbox"] = (e.target.getAttribute('id') === 'selectBG')?"RandomGenerator-LayerOptions-BG-Upld":"RandomGenerator-LayerOptions";
                
                e.target.setAttribute('id','generatePfps');

                // if(document.getElementById('popup')){
                //     homeScrollValue = document.getElementById('popup').scrollTop()
                // }
                return changeState(temp_state);

            }else{

                console.log(`pissing contest!`)

                temp_state = JSON.parse(JSON.stringify(state));

                temp_state.currsubState["createbox"] = "RandomGenerator-LayerOptions";
                
                // e.target.setAttribute('id','generatePfps')
                // if(document.getElementById('popup')){
                //     homeScrollValue = document.getElementById('popup').scrollTop()
                // }
                return changeState(temp_state);
            }
        }
        
        const handleAddLayerUpld = async (e)=>{
            temp_state = JSON.parse(JSON.stringify(state));
            e.target.classList.add('inactive');

            // console.log(`files: ${JSON.stringify(state)} `);
            
            showLoading();
            
            e.preventDefault();
            
            if (e.target.getAttribute('name') === 'bg_asset' && e.target.getAttribute('type') === 'file') {
                let n = 0;

                document.getElementsByClassName('layerContentBox')[0].innerHTML = "";

                document.getElementById('bg_upld').textContent = (e.target.files.length > 0)?'NEXT':'No Background';

                while(n < e.target.files.length){ 
                    // console.log(e.target.files[0]);
                    const para = document.createElement("div");
                    
                    // Append text node to the p element:
                    para.innerHTML = "<img src="+URL.createObjectURL(e.target.files[n])+" />";
    
                    para.classList.add('LayerUpldContent');

                    document.getElementsByClassName('layerContentBox')[0].appendChild(para);
                    
                    n++
                }

                da_files = (e.target.files.length === 0 )?[]:e.target.files;
                e.target.classList.remove('inactive');

                hideLoading();
                
                return;
            }

            if(e.target.getAttribute("id") === "Collection_name_button"){

                let collname = document.getElementById("CollName");

                if( collname.value === "" ){
                    temp_state.data["createbox"] = ""
                
                    e.target.classList.remove('inactive');
                    
                    console.log("enter stuff!");

                    hideLoading();
                    
                    return false;
                }

                temp_state.data["createbox"] = {coll_name : collname.value.trim(), layers:[]}
                
                temp_state.currsubState["createbox"] = "RandomGenerator-LayerOptions"

                e.target.classList.remove('inactive');
                
                console.log("enter stuff!");

                hideLoading();
                
                return changeState(temp_state);
            }

            if(e.target.getAttribute('type') === 'file' && e.target.getAttribute('name') === 'multi_asset'){

                let n = 0;
                document.getElementsByClassName('layerContentBox')[0].innerHTML = "";

                while(n < e.target.files.length){ 
                    // console.log(e.target.files[0]);
                    const para = document.createElement("div");
                    
                    // Append text node to the p element:
                    para.innerHTML = "<img src="+URL.createObjectURL(e.target.files[n])+" />";
    
                    para.classList.add('LayerUpldContent');

                    document.getElementsByClassName('layerContentBox')[0].appendChild(para);
                    
                    n++
                }

                da_files = e.target.files;
                e.target.classList.remove('inactive');

                hideLoading();
                
                return;
            
            }

            let layerName;

            if(e.target.getAttribute("id") !== "bg_upld"){

                layerName = document.getElementById("LayerName").value.trim();

                if(layerName === "" || document.getElementById("multi_asset").files.length < 1){
                    
                    e.target.classList.remove('inactive');
                    
                    console.log("enter stuff!");

                    hideLoading();
                    
                    return false;
                }

            }

            let conntd = await iswalletConnected();
            
            console.log(`conntd: ${conntd}`);
            
            if(conntd !== false){

                imgbody.append('account', conntd)
            
            }else{
                
                console.log(`Wallet not connected!!`);

                return false;
            
            }
            
            if(e.target.getAttribute("id") === "bg_upld"){
                if(!state.data["createbox"].background){
                    state.data["createbox"].background =[]
                }
                imgbody.append('background', 'background');

            }else{

                imgbody.append('layerName', layerName);

            }
            
            imgbody.append('coll_name', state.data["createbox"].coll_name);

            let n = 0;

            if((da_files === undefined || da_files.length === 0 || da_files.length === "") && e.target.getAttribute("id") === "bg_upld"){

                return closeLayerOptionsBox();
            
            }
            
            while(n < da_files.length){

                let assetName = conntd+"_"+n+"_"+Date.now()+"."+da_files[n].name.split('.')[da_files[n].name.split('.').length-1];
                
                imgbody.append("files", da_files[n], assetName);

                n++;
                
            }
            
            await fetch(baseServerUri+'api/addGenlayer', {method:"post", body:imgbody})
            .then((res)=> res.json())
            .then((piss)=>{
                if(piss.error){

                    temp_state.currsubState["createbox"] = "RandomGenerator-LayerOptions";

                    console.log("an error occured!");

                    return changeState(temp_state);
                
                }else if(piss.response.backgrounds){

                    // let dataArray = piss.response.data;

                    if(state.data["createbox"].background.length > 0){
                        
                        let p = 0; 
                            
                        while(p < piss.response.data.length){

                            state.data["createbox"].background.push(piss.response.data[p]);
                            
                            p++;
                            
                        }
                        
                        e.target.classList.remove('inactive');

                        return closeLayerOptionsBox();

                    }

                    state.data["createbox"].background = piss.response.data;
                    
                    e.target.classList.remove('inactive');

                    return closeLayerOptionsBox();

                }else{

                    let dataArray = piss.response.data;

                    // console.log(`layer name: ${JSON.stringify(piss.response.layer_name)}`);

                    if(state.data["createbox"].layers.length > 0){
                        let v = 0;

                        while(v < state.data["createbox"].layers.length){

                            if(state.data["createbox"].layers[v].name === piss.response.layer_name){

                                let p = 0; 
                                
                                while(p < piss.response.data.length){

                                    state.data["createbox"].layers[v].traits.push(piss.response.data[p]);
                                    // e.target.classList.remove('inactive');

                                    p++;
                                    
                                }
                                return closeLayerOptionsBox();
                            }

                            v++;
                        }

                        state.data["createbox"].layers.push({name:piss.response.layer_name, traits:dataArray});
                        e.target.classList.remove('inactive');

                        return closeLayerOptionsBox();

                    }

                    state.data["createbox"].layers.push({name:piss.response.layer_name, traits:dataArray});
                    
                    e.target.classList.remove('inactive');

                    return closeLayerOptionsBox();
                    // console.log(`Uploaded successfully: \n addy: ${piss.response.address}\n collection: ${piss.response.coll_name}\n layer name: ${piss.response.layer_name}\n files info: ${piss.response.data}`);
                }
            });
            
        }

        const delLayer = async (e)=>{
            showLoading();

            if(state.currsubState["createbox"] === "RandomGenerator-LayerOptions-Edit-Layer"){
                
                let tmp_stte = JSON.parse(JSON.stringify(state));
                
                tmp_stte.prev = tmp_stte.currsubState["createbox"];
                
                tmp_stte.currsubState["createbox"] = "RandomGenerator-LayerOptions-Del-Layer"
                
                hideLoading();

                changeState(tmp_stte);

            }else{

                if( state.temp_value.index !== null || state.temp_value.index !== undefined ){

                    let delVal = state.data["createbox"].layers[state.temp_value.index];
                    
                    let boddy = new FormData();
                    let conntd = await iswalletConnected();
                    
                    console.log(`conntd: ${conntd}`);
                    
                    if(conntd !== false){

                        boddy.append('account', conntd)
                    
                    }else{
                        
                        console.log(`Wallet not connected!!`);

                        return false;
                    
                    }

                    boddy.append('index',state.temp_value.index);
                    boddy.append('values', JSON.stringify(delVal))
                    // let boddy = {index:state.temp_value.index, values: delVal};

                    await fetch(baseServerUri+'api/delLayer', {method:"post", body: boddy,})
                    .then((res)=> res.json())
                    .then((piss)=>{

                        hideLoading();
                        
                        if(piss.error){
                            state.data.createbox.msg = piss.error;
                            closeLayerOptionsBox();
                        }
                        
                        state.data["createbox"].layers.splice(state.temp_value.index, 1);
                        
                        closeLayerOptionsBox();

                    })

                }else{
                    closeLayerOptionsBox();
                }
            }
        }
        
        const renameLayer = (e)=>{

            e.preventDefault();
            // state.temp_value.index
            const ele = e.target;
            if(state.currsubState["createbox"] === "RandomGenerator-LayerOptions-Edit-Layer"){
                let tmp_stte = JSON.parse(JSON.stringify(state));
                tmp_stte.prev = tmp_stte.currsubState["createbox"];
                tmp_stte.currsubState["createbox"] = "RandomGenerator-LayerOptions-Rename_Layer"
                
                return changeState(tmp_stte);

            }else{

                if(ele.value){
                    // let eleindex = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);
                    // let eleindex = parseInt(ele.getAttribute('id').split('_')[1]);
                    
                    state.data["createbox"].layers[state.temp_value.index].name = ele.value;
                    
                    ele.setAttribute('placeholder', ele.value);
                    // trait_name
                }
            }

        };

        const backToPrev = async (e)=>{
            let tmp_stte = JSON.parse(JSON.stringify(state));
            
            tmp_stte.currsubState["createbox"] = tmp_stte.prev;
            // hideLoading();
            return changeState(tmp_stte);
        }

        const closeLayerOptionsBox = (e)=>{
            temp_state = JSON.parse(JSON.stringify(state));
            
            if(e){

                switch (e.target.getAttribute('id')) {
                    case "proj_name_closer":
                        temp_state.state = "";
                        temp_state.data["createbox"] = "";
                        break;
                    case "contractState":
                        temp_state.currsubState["createbox"] = "RandomGenerator-RandomGenerated";
                        break;
                    case "generateNFT_Coll":
                        temp_state.currsubState["createbox"] = "RandomGenerator";
                        break;
                
                    default:
                        temp_state.currsubState["createbox"] = "RandomGenerator";
                        break;
                }
                hideLoading();
                return changeState(temp_state);
            }
            
            temp_state.currsubState["createbox"] = "RandomGenerator";

            hideLoading();
            return changeState(temp_state);
            
        }
        
        const expandbox = (e)=>{

            showLoading();

            let ele = e.target;
            
            let indx = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);


            let me = 0;
            while(me < document.getElementsByClassName('deatail-edit-trait-box').length){
                if(me !== indx){
                    if(!document.getElementsByClassName('deatail-edit-trait-box')[me].classList.contains('inactive')){
                        document.getElementsByClassName('deatail-edit-trait-box')[me].classList.add('inactive');
                    }
                    if(!document.getElementsByClassName('generatorRightPanelLayerBox-title-img')[me].classList.contains('rotateExpander')){
                        document.getElementsByClassName('generatorRightPanelLayerBox-title-img')[me].classList.remove('rotateExpander');
                    }
                }
                me++;
            }

            if(document.getElementsByClassName('deatail-edit-trait-box')[indx].classList.contains('inactive')){

                document.getElementsByClassName('generatorRightPanelLayerBox-title-img')[indx].classList.add('rotateExpander');

                document.getElementsByClassName('deatail-edit-trait-box')[indx].classList.remove('inactive');

            }else{

                document.getElementsByClassName('generatorRightPanelLayerBox-title-img')[indx].classList.remove('rotateExpander');

                document.getElementsByClassName('deatail-edit-trait-box')[indx].classList.add('inactive');
            }

            hideLoading();
        };

        const checkWorkInterval = (uurl, interval, callback)=>{
            if(!intervalId){
                intervalId = setInterval(() => {
                    fetch(uurl)
                    .then((res)=>res.json())
                    .then((rez)=>{
                        console.log(`da res:: ${rez}`)
                        callback(rez);
                    })
                }, interval);
            }
        };

        const stopCheckWork = ()=>{
            clearInterval(intervalId);
            intervalId = null;
        }
        
        const generate_it = async (e)=>{
            showLoading();

            let body = new FormData();
            let conntd = await iswalletConnected();
            
            if(conntd !== false){

                body.append('account', conntd);
            
            }else{
                
                console.log(`Wallet not connected!!`);

                return false;
            
            }

            body.append('currentState', state.currsubState["createbox"])

            state.data["createbox"].account = conntd;
            
            body.append('data',JSON.stringify(state.data["createbox"]));
            
            // console.log(`state: ${JSON.stringify(state.data["createbox"])}`);
            // hideLoading();
            const get_all_possible_combos =  async (input, output, n, da_path)=>{

                da_path = (da_path === null || da_path === undefined)? []: da_path;
            
                n = (n === null || n === undefined)? 0:n;
            
                if(n < input.length){
            
                    // console.log(`running in the loop!`);
                    let current_item = input[n];
                    let gogo = 0;
                    
                    while(gogo < current_item.length){
                        // console.log(`running in the loop!`);
                        let val = current_item[gogo];
            
                        da_path.push(val);
                        // console.log(`testerr!!!! n: ${n}, gogo:${gogo}`);
                        get_all_possible_combos(input, output, n+1, da_path);
                        // console.log(`da_path before: ${JSON.stringify(da_path)}\n\n`);
                        da_path.pop();
                        // console.log(`da_path after: ${JSON.stringify(da_path)}`);
                        gogo++;
            
                    }
            
                }else{
            
                    output.push(da_path.slice());
            
                }
                
            };

            const loop_and_pin_layers = async (collName, layers)=>{
                let emptyComboArray = [];
                
                layers.reverse();
            
                for(let indx = 0; indx < layers.length; indx++){
            
                    emptyComboArray.push({name: layers[indx].name, traits:[]});
                    
                    for(let pin = 0; pin < layers[indx].traits.length; pin++){
            
                        const options = {
                            pinataMetadata:{
                            name: `${layers[indx].traits[pin].trait_name}`,
                            keyvalues: {
                                description: `nft trait element from collection, generated by Yaad labs.`,
                                name: layers[indx].traits[pin].trait_name
                            }
                            },
                            pinataOptions: {
                                cidVersion: 0
                            }
                            
                        };
                        
                        let body = {
                            "description": `nft trait element from ${collName} collection. generated by Yaad labs.`,
                            "external_url": "", 
                            "image": "", 
                            "name": (layers[indx].traits[pin].trait_name)? layers[indx].traits[pin].trait_name: layers[indx].name,
                            "attributes": []
                        }
                        
                        // let pinned = await pinnit(normalize(theDir+sep+layers[indx].traits[pin].path), options);
                        let pin_body = new FormData();
                        pin_body.append('path',layers[indx].traits[pin].path);
                        pin_body.append('the_options', options);
                        await fetch(`${baseServerUri}api/pinnit`, {method:'POST', body: pin_body})
                        .then((resp)=>resp.json())
                        .then((pinned)=>{

                            console.log(`pinned:: ${JSON.stringify(pinned)}`);

                            emptyComboArray[indx].traits.push({ trait_name: layers[indx].traits[pin].trait_name, path: pinned.IpfsHash });
                        });
                    }
                }
                
                return emptyComboArray;
            };

            const loop_and_pin_background = async (backgrounds)=>{
    
                // let backgrounds = JSON.parse(req.body.data).background;
                
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
            
                    // let pinned = await pinnit(normalize(theDir+sep+backgrounds[f].path), options);
                    let pin_body = new FormData();
                    console.log(`background: ${JSON.stringify(backgrounds[f])}`)
                    pin_body.append('path',backgrounds[f].path);
                    pin_body.append('the_options', options);
                    await fetch(`${baseServerUri}api/pinnit`, {method:'POST', body: pin_body})
                    .then((resp)=>resp.json())
                    .then((pinned)=>{
                        console.log(`bg pinned: ${JSON.stringify(pinned)}`);
                        // emptyComboArray[indx].traits.push({ trait_name: layers[indx].traits[pin].trait_name, path: pinned.IpfsHash });
                        backgrounds[f].path = pinned.IpfsHash;
                    });
                    // backgrounds[f].path = pinned.IpfsHash;
                    
                }
                
                return backgrounds;
            };

            const mapTraitTypes = async (comboz) => {
                // let comboz = res.locals.comboz;
            
                let len = 0; let traitTypes = []; let ego;
            
                while(len < comboz.length){
                    // console.log(`comboz:::::::>> ${JSON.stringify(comboz)}\n`);
            
                    ego = comboz[len].traits.map((x,v,arr) => {

                        return { trait_type: comboz[len].name, trait_name: comboz[len].traits[v].trait_name, value: x.path};

                    });
            
                    traitTypes.push(ego)
            
                    len++;
                }

                ego = "";
                
                return traitTypes;
            };
            
            const traitTypesPushNA = async (traitTypes) => {
                // let traitTypes = res.locals.traitTypes;
                let endo = 0;

                while (endo < traitTypes.length) {

                    traitTypes[endo].push({trait_type: traitTypes[endo][0].trait_type, value: 'N/A'});
                    endo++;

                }

                return traitTypes
            };

            const insertBackground = async (comboz) =>{
                let d = 0;
                // let comboz = res.locals.comboz;
                let backgrounds = await loop_and_pin_background(state.data["createbox"].background)
                while(d < comboz.length){
            
                    let newBG = backgrounds[Math.floor(Math.random() * backgrounds.length)]
                    
                    comboz[d].splice(0, 0, { trait_type: "background", trait_name: newBG.trait_name, value: newBG.path });
                    
                    d++;
                }
            };

            const allPossibleCombos = async ()=> {
                let comboz = [];
                const layerz = JSON.parse(JSON.stringify(state.data["createbox"].layers));
                let loop_and_pin = await loop_and_pin_layers(state.data["createbox"].coll_name, layerz);
                let map_traits = await mapTraitTypes(loop_and_pin);
                let traittypes_fin = await traitTypesPushNA(map_traits);
                
                console.log(`final trait types: ${JSON.stringify(traittypes_fin)}`);

                await get_all_possible_combos(traittypes_fin, comboz);

                // console.log(`all possible combos: ${res.locals.comboz}`);
                
                // res.locals.comboz = comboz;
                
                await shuffle(comboz);
                await insertBackground(comboz);
                
                return comboz;
            };

            let combo =  await allPossibleCombos();
            
            let possibleCombos = combo.length;

            const pinCombo = async (combo, optns)=> {

                // let collectionName = state.data["createbox"].coll_name;
                
                let pin_body = new FormData();
                
                pin_body.append('path', JSON.stringify(combo));
                
                pin_body.append('the_options', JSON.stringify(optns));

                let pinnedCombo = await fetch(`${baseServerUri}api/pinnit`,{method:'POST', body: pin_body}).then((rezz)=>rezz.json()).then((pinned)=>pinned);
                
                return pinnedCombo;
            }

            let optns = { pinataMetadata:{ name: state.data["createbox"].coll_name, keyvalues: {} }, pinataOptions: { cidVersion: 0 } };

            let pinnedCombo = await pinCombo(combo, optns);

            console.log(JSON.stringify(pinnedCombo));
            
            const drawimage = async (traitTypes, width, height) => {
                let sampleArray = [], gateway = 'https://gateway.pinata.cloud/ipfs/', cap_it = traitTypes.length;
                
                for(let v = 0; v < cap_it; v++){
                    const options = {
                        pinataMetadata:{
                            name: `${v}`,
                            keyvalues: {
                            description: 'no',
                            name: `${v}`
                            }
                        },
                        pinataOptions: {
                            cidVersion: 0
                        }
                    };

                    const  drawableTraits = traitTypes[v].filter(x=>  x.value !== 'N/A');
                    
                    let bdy = new FormData();

                    bdy.append('width', width);
                    bdy.append('height', height);
                    bdy.append('traits', JSON.stringify(drawableTraits));
                    // bdy.append('theoptions', JSON.stringify(options));
                    bdy.append('imgindex', v);
                    bdy.append('account', conntd);
                    bdy.append('collname', state.data['createbox'].coll_name);

                    let drewimg = await fetch(`${baseServerUri}api/drawimage`, {method:'POST',body: bdy} ).then((theresponse)=>theresponse.json()).then((drewimg)=>drewimg);
                    
                    console.log(`drew image: ${JSON.stringify(drewimg)}`);
                    bdy = "";
                    bdy = new FormData();

                    bdy.append('path', drewimg.path);
                
                    bdy.append('the_options', JSON.stringify(options));

                    let pinnedSample = await fetch(`${baseServerUri}api/pinnit`,{method:'POST', body: bdy}).then((rezz)=>rezz.json()).then((pinned)=>pinned);
                
                    // let pinnedSample = await pinCombo(drewimg.path, options);

                    let metadataJSON = { name: `sample turd #${v}`, attributes: drawableTraits, path: pinnedSample.IpfsHash};

                    sampleArray.push(metadataJSON);

                }
                
                return sampleArray;
              
            };

            const getSamplesAndClearComboData = async (comboz, cap)=>{
                // const cap = 5;
                let cap_it = (cap)?cap:comboz.length;
                let sampleImgs = [];
                for(let v = 0; v < cap_it; v++){
                    sampleImgs.push(comboz[v]);
                }
                console.log(`sample img: ${JSON.stringify(sampleImgs)}`);

                
                return drawimage(sampleImgs, 1000, 1000);
            };

            let samples = await getSamplesAndClearComboData(combo, 4);

            combo = "";
            console.log(`sample img: ${JSON.stringify(samples)}`);

            const updateDB = async (data, collname, account, thesamples, combo_ipfs_hash)=>{
                temp_state = JSON.parse(JSON.stringify(state));
                
                temp_state.data["createbox"] =  {};

                temp_state.data["createbox"]["activeContract"] = null;

                temp_state.currsubState["createbox"] = "RandomGenerator-RandomGenerated";

                temp_state.data["createbox"].coll_name = state.data["createbox"].coll_name;

                temp_state.data["createbox"].samples = thesamples;

                temp_state.data["createbox"].possibleCombos = possibleCombos;

                // changeState(temp_state);

                let payload = new FormData();
                payload.append('data', JSON.stringify(state['data'].createbox));
                payload.append('collname', state.data["createbox"].coll_name);
                payload.append('account', conntd);
                payload.append('ipfs_uri', combo_ipfs_hash);
                payload.append('samples', JSON.stringify(thesamples));

                let saveCollection = await fetch(`${baseServerUri}api/savenftcollection`, {method:'POST', body:payload}).then((response)=>response.json()).then((ress)=>ress);
                
                return changeState(temp_state);
            
            };

            updateDB(state.data.createbox, state.data['createbox'].coll_name, conntd, samples, pinnedCombo.IpfsHash)

            // try {
            //     await fetch(`${baseServerUri}api/generate`, {method:"POST", body, mode:'cors'})
            //     .then((response)=>{
            //         console.log(` response type: ${response.type}, response status: ${response.status}, response headers: ${response.headers}, response url: ${response.url}, response ok: ${response.ok}`);
            //         if(response.ok){
            //             return response.json;
            //         }
            //         console.log(`generated: ${JSON.stringify(generate_it)}`);
            //         temp_state = JSON.parse(JSON.stringify(state));
            //         temp_state.data["createbox"] =  {};
            //         temp_state.data["createbox"]["activeContract"] = null;
            //         temp_state.currsubState["createbox"] = "RandomGenerator-RandomGenerated";
            //         temp_state.data["createbox"].coll_name = state.data["createbox"].coll_name;
            //         temp_state.data["createbox"].account = state.data["createbox"].account;
                    
            //         changeState(temp_state);

            //         e.target.classList.remove('inactive');

            //         hideLoading();
            //     })
            //     .then((res)=>{

            //     })
            // } catch (error) {
            //     console.log(`da try error is: ${error}`);
            // }
            
            // .then((res)=>{
            //     console.log(`generate response: ${JSON.stringify(res)}`);
            //     // if(res.status === 503){
                    
            //         // stopCheckWork();
                    
            //         temp_state = JSON.parse(JSON.stringify(state));
            //         temp_state.data["createbox"] =  {};
            //         temp_state.data["createbox"]["activeContract"] = null;
            //         temp_state.currsubState["createbox"] = "RandomGenerator-RandomGenerated";
            //         temp_state.data["createbox"].coll_name = state.data["createbox"].coll_name;
            //         temp_state.data["createbox"].account = state.data["createbox"].account;
                    
            //         changeState(temp_state);

            //         e.target.classList.remove('inactive');

            //         hideLoading();
                    
            //     // }
            //     return res.json();
            // })
            // .then((piss)=>{
            //     console.log(`success message:: ${JSON.stringify(piss)}`);
            //     if(piss.error){
                    
            //         console.log("an error occured!");
            //         console.log(piss.error.message);
            //         hideLoading();
            //         // return changeState(temp_state);
                
            //     }else{
                    
            //         console.log(`success message: ${piss.message}, JSON::: ${JSON.stringify(piss.sampleArray)}`);
                    
            //         temp_state = JSON.parse(JSON.stringify(state));
                    
            //         temp_state.data["createbox"] =  {};

            //         temp_state.data["createbox"]["activeContract"] = null;

            //         temp_state.currsubState["createbox"] = "RandomGenerator-RandomGenerated";

            //         temp_state.data["createbox"].coll_name = state.data["createbox"].coll_name;

            //         temp_state.data["createbox"].traitTypes = piss.sampleArray;

            //         temp_state.data["createbox"].samples = piss.sampleArray;

            //         temp_state.data["createbox"].possibleCombos = piss.possibleCombos;

            //         changeState(temp_state);

            //         e.target.classList.remove('inactive');

            //         hideLoading(); 
            //         // return closeLayerOptionsBox();
            //         // console.log(`Uploaded successfully: \n addy: ${piss.response.address}\n collection: ${piss.response.coll_name}\n layer name: ${piss.response.layer_name}\n files info: ${piss.response.data}`);
            //     }
            // });

        }
        
        const handleSol = async(e)=>{
            showLoading();

            let elem  = (e)?e.target:null;
            
            let elemFiles = elem.files;
            
            temp_state =  JSON.parse(JSON.stringify(state));
            
            const  readAndShowFiles = async (demFiles) => {
                let contractArray = [];
                
                for (let dafile of demFiles) {
                    let readr = new FileReader();
                    readr.onloadend = ()=>{
                        let  nameArray = dafile.name.split('.');
                        nameArray.splice((dafile.name.split('.').length-1),1);
                        contractArray.push({name: nameArray.join('.'), contract: readr.result});
                        
                        if(contractArray.length === demFiles.length){
                            
                            temp_state.data["createbox"]["contracts"] = contractArray;
                            temp_state.currsubState["createbox"] = "RandomGenerator-LayerOptions-ContractName"
                            hideLoading();
                            
                            changeState(temp_state);
                        }
                    }

                    readr.readAsText(dafile);
                }
                
            }

            readAndShowFiles(elemFiles).then(()=>{})
            
        };
        
        function LayerOptions (){
            hideLoading();
            
            if(state.currsubState["createbox"].split('-')[1] === "LayerOptions" && state.currsubState["createbox"] === "RandomGenerator-LayerOptions" && state.data["createbox"].coll_name){
                return(
                    <div className='popup'>
                        <Buttonz data={{class:"closeBox", id:'', value:'X', func: closeLayerOptionsBox}} />
                        <div className='LayerOptionsBox'>
                            <DaInput data={(typeof(state.temp_value) === "number")?{typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', hidden:true, value:state.data.createbox.layers[state.temp_value].name}:{typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:'Enter layer name.'}}/>
                            <div className='LayerUpldBox'>
                                <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:'Click the "+" to upload layer files'}}/>
                                <DaInput data={{hidden:true, type:'file', typeId:'multi_asset', class:'inactive', name:'multi_asset', multiple:'multiple', accept:'image/*', onChange:handleAddLayerUpld}}/>
                                <label className='LayerUpldBttn' htmlFor='multi_asset'>
                                    <img src='./plus.svg' alt='' />
                                </label>
                                <div className='layerContentBox'>
                                </div>
                            </div>
                            <Buttonz data={{class:"LayerUpldBttn", id:'', value: (typeof(state.temp_value) === "number")?'Add':'Create', func: handleAddLayerUpld}} />
                        </div>
                    </div>
                )
            }else if(state.currsubState["createbox"].split('-')[1] === "LayerOptions" && state.currsubState["createbox"] === "RandomGenerator-LayerOptions"){
                return(
                    <div className='popup'>
                        <Buttonz data={{class:"closeBox", id:'proj_name_closer', value:'X', func: closeLayerOptionsBox}} />
                        <div className='LayerOptionsBox'>
                            <DaInput data={{typeClass:'LayerName', typeId:'CollName', placeholder:'Enter NFT project name.', type:'text', name:'name'}}/>
                            <Buttonz data={{class:"LayerUpldBttn", id:'Collection_name_button', value: 'NEXT', func: handleAddLayerUpld}} />
                        </div>
                    </div>
                );
            }else if(state.currsubState["createbox"].split('-')[1] === "LayerOptions" && state.currsubState["createbox"] === "RandomGenerator-LayerOptions-BG-Upld"){
                return(
                    <div className='popup'>
                        <Buttonz data={{class:"closeBox", id:'', value:'X', func: closeLayerOptionsBox}} />
                        <div className='LayerOptionsBox'>
                            <BoxTitle data={{class:'LayerUpldBoxTitle', type:'h2', typeClass: 'whiteColor', text:'Background Images'}}/>
                            
                            <div className='LayerUpldBox'>
                                <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:'Click the "+" to upload background files.'}}/>
                                <DaInput data={{typeClass:'LayerName', typeId:'multi_asset', name:'bg_asset', type:'file', multiple:'multiple', hidden:true, accept:'image/*', onChange:handleAddLayerUpld}}/>
                                <label className='LayerUpldBttn' htmlFor='multi_asset'>
                                    <img src='./plus.svg' alt='' />
                                </label>
                                <div className='layerContentBox'>
                                </div>
                            </div>
                            <Buttonz data={{class:"LayerUpldBttn", id:'bg_upld', value: 'No Background', func: handleAddLayerUpld}} />
                        </div>
                    </div>
                )
            }else if( state.currsubState["createbox"].split('-')[1] === "LayerOptions" && state.currsubState["createbox"] === "RandomGenerator-LayerOptions-Edit-Layer" ){
                return(
                    <div className='popup'>
                        <Buttonz data={{class:"closeBox", id:'', value:'X', func: closeLayerOptionsBox}} />
                        <div className='LayerOptionsBox'>
                            <div className='LayerUpldBox'>
                                <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:'Rename layer.'}}/>
                                <input type="text" id='multi_asset' name='bg_asset' multiple="multiple" accept="image/*" style={{opacity:100, zIndex:1}} onChange={handleAddLayerUpld} hidden/>
                                <Buttonz data={{class:'renameLayerBttn', id:'bg_upld', value:'Rename', func: renameLayer}} />
                                
                                <div className='layerContentBox'></div>
                            </div>
                            <div>
                                <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:`Delete ${state.data.createbox.layers[state.temp_value.index].name} layer.`}}/>
                                <Buttonz data={{class:"delLayerBttn", id:'bg_upld', value: 'DELETE', func: delLayer}} />
                            </div>
                        </div>
                    </div>
                )
            }else if( state.currsubState["createbox"].split('-')[1] === "LayerOptions" && state.currsubState["createbox"] === "RandomGenerator-LayerOptions-Del-Layer" ){
                return(
                    <div className='popup'>
                        <Buttonz data={{class:"closeBox", id:'', value:'X', func: closeLayerOptionsBox}} />
                        <div className='LayerOptionsBox'>
                            <div className='LayerUpldBox'>
                                <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:`Select yes to delete ${state.data.createbox.layers[state.temp_value.index].name} layer.`}}/>
                                <Buttonz data={{class:'delLayerBttn', id:'', value:'YES', func: delLayer}} />
                                <Buttonz data={{class:'nodelLayerBttn', id:'', value:'NO', func: backToPrev}} />
                            </div>
                        </div>
                    </div>
                )
            }else if(state.currsubState["createbox"].split('-')[1] === "LayerOptions" && state.currsubState["createbox"] === "RandomGenerator-LayerOptions-Rename_Layer"){
                return(
                    <div className='popup'>
                        <Buttonz data={{class:"closeBox", id:'', value: 'X', func: closeLayerOptionsBox}} />
                        <div className='LayerOptionsBox'>
                            <div className='LayerUpldBox'>
                                <BoxTitle data={{class:'LayerUpldBoxTitle', type:'h2', text:'Change layer name.'}}/>
                                <DaInput data={{typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:state.data["createbox"].layers[state.temp_value.index].name, onChange:renameLayer}}/>
                                <Buttonz data={{class:"nodelLayerBttn", id:'', value:'SUBMIT', func: closeLayerOptionsBox}} />
                            </div>
                        </div>
                    </div>
                )
            }else if(state.currsubState["createbox"].split('-')[1] === "LayerOptions" && state.currsubState["createbox"] === "RandomGenerator-LayerOptions-ContractName"){
                // let contractBoxContent = (state.data["createbox"]["activeContract"])?<div> <span> state.data["createbox"]["contracts"][state.data["createbox"]["activeContract"]].contract </span> </div>:{theFreeContent};
                return(
                    <div className='popup'>
                        <Buttonz data={{class:"closeBox", id:'contractState', value: 'X', func: closeLayerOptionsBox}} />
                        <div className='LayerOptionsBox'>
                            <div className='LayerUpldBox'>
                                <BoxTitle data={{class:'LayerUpldBoxTitle', type:'h2', text:'enter contract name.'}}/>
                                <DaInput data={{typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:"Enter main contract name.", onChange:nullFunc}}/>
                                <ContractBox/>
                                <Buttonz data={{class:"nodelLayerBttn", id:'', value:'SUBMIT', func: nullFunc}} />
                            </div>
                        </div>
                    </div>
                )
            }else{
                return('')
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

                        initPositions.push(element.getBoundingClientRect().top);

                    });
                    
                },[elebox, initPositions])

                function swapSibling(node1, node2) {
                    node1.parentNode.replaceChild(node1, node2);
                    node1.parentNode.insertBefore(node2, node1); 
                }

                const layer_move_initializer = (event)=>{
                    
                    if(event.target.getAttribute('class') === 'generatorRightPanelLayerBox'){

                        mouseUpFired = false;
                        let div = event.target;
                        
                        let divWitdh = div.clientWidth;

                        if(event.type === 'mousedown' || event.type === 'touchstart'){
                            let popup = document.getElementById('popup');

                            popup.style.overflowY = 'hidden';
                            
                            if(mouseUpFired === true){
                                
                                return false;
                            }

                            div.classList.add("sortable-handler");

                            let indexOfSelectedItem = [].indexOf.call(document.getElementsByClassName('generatorRightPanelLayerBox'), div);
                            // setLayerIndex(indexOfSelectedItem)
                            let arrayOfEles = document.getElementsByClassName('generatorRightPanelLayerBox');
                            
                            let centerofdiv = div.clientHeight/2;

                            // console.log(`scroll height: ${document.getElementById('popup').scrollTop}, parent div location: ${div.parentNode.parentNode.getBoundingClientRect().top}`)

                            div.style.width = divWitdh+'px';
                            
                            div.style.top = (event.type === 'touchstart')?((event.touches[0].clientY + document.getElementById('popup').scrollTop) - centerofdiv)+'px':((event.clientY + document.getElementById('popup').scrollTop) - centerofdiv)+'px';
                            
                            initDivIndx = indexOfSelectedItem;

                            window.onmousemove = (e)=>{
                                
                                if(mouseUpFired === false){

                                    div.style.top = ((e.clientY + document.getElementById('popup').scrollTop)- centerofdiv)+'px';
                                    
                                    initPositions.forEach((element, i) => {

                                        if(indexOfSelectedItem > i){
                                            
                                            if((div.getBoundingClientRect().top+document.getElementById('popup').scrollTop) < (element) && (div.getBoundingClientRect().top+document.getElementById('popup').scrollTop) > (element-70)){
                                                
                                                // console.log(`${arrayOfEles[i].parentNode.getAttribute('class')}, class name 1${div.parentNode.getAttribute('class')}`);
                                                swapSibling(arrayOfEles[i].parentNode, div.parentNode);

                                                newindex = i; //[].indexOf.call(document.getElementsByClassName('generatorRightPanelLayerBox'), div);
                                                indexOfSelectedItem = i;
                                                
                                            }
                                        }
                                        if(indexOfSelectedItem < i){
                                        
                                            if((div.getBoundingClientRect().bottom+document.getElementById('popup').scrollTop) > (element+70) && (div.getBoundingClientRect().bottom+document.getElementById('popup').scrollTop) < (element+140)){

                                                swapSibling(div.parentNode,arrayOfEles[i].parentNode);

                                                newindex =i;// [].indexOf.call(document.getElementsByClassName('generatorRightPanelLayerBox'), div);
                                                
                                                indexOfSelectedItem = i;

                                            }
                                        }

                                    });
                                    
                                }
                            }
                            
                            window.ontouchmove = (e)=>{

                                if(mouseUpFired === false){

                                    div.style.top = ((e.touches[0].clientY + document.getElementById('popup').scrollTop)-centerofdiv)+'px';
                                    
                                    initPositions.forEach((element, i) => {
                                        if(indexOfSelectedItem > i){
                                            if((div.getBoundingClientRect().top+document.getElementById('popup').scrollTop) <= (element) && (div.getBoundingClientRect().top+document.getElementById('popup').scrollTop) >= (element-70)){
                                                
                                                
                                                swapSibling(arrayOfEles[i].parentNode, div.parentNode);
                                                newindex = [].indexOf.call(document.getElementsByClassName('generatorRightPanelLayerBox'), div);
                                                
                                                arrayOfEles[i+1].classList.add('betweenItem_two');
                                                
                                            }else{

                                                arrayOfEles[i+1].classList.remove('betweenItem_two');
                                            
                                            }
                                        }

                                        if(indexOfSelectedItem <= i){
                                        
                                            if((div.getBoundingClientRect().top+document.getElementById('popup').scrollTop) >= (element-70) && (div.getBoundingClientRect().top+document.getElementById('popup').scrollTop) <= (element+70)){

                                                swapSibling(div.parentNode,arrayOfEles[i].parentNode);
                                                newindex = [].indexOf.call(document.getElementsByClassName('generatorRightPanelLayerBox'), div);
                                                
                                                if(div !== arrayOfEles[i]){
                                                    
                                                    arrayOfEles[i].classList.add('betweenItem');
                                                
                                                }

                                            }else{

                                                arrayOfEles[i].classList.remove('betweenItem');
                                            
                                            }
                                        }

                                    });
                                    
                                }
                            }
                        }
                    }
                };

                const layer_move_ender = (event)=>{
                    if(event.target.getAttribute('class') === 'generatorRightPanelLayerBox'){
                        showLoading();
                    }
                    
                    mouseUpFired = true;
                    
                    if(event.type === 'mouseup' || event.type === 'touchend'){
        
                        let popup = document.getElementById('popup');
        
                        popup.style.overflowY = 'auto';
        
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
                            // console.log(`gun dung piss`);
                            // console.log(`init index: ${initDivIndx}, new index:: ${newindex}`);
                            
                            let tempArray = state.data["createbox"].layers.splice(initDivIndx,1)[0];
        
                            // console.log(`tempArray::: ${tempArray}`);
                            
                            state.data["createbox"].layers.splice(newindex, 0, tempArray);
                            
                            hideLoading();

                            changeState(state, document.getElementById('popup').scrollTop())
                            
                            // if(editState === null){
                            //     changeEditState(undefined);
                            // }else{
                            //     changeEditState(null);                           
                            // }
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
                            state.data["createbox"].layers[eleKey].traits[eleindex].trait_name = ele.value;
                            ele.setAttribute('placeholder', ele.value);
                            // trait_name
                    }
                };

                const delTrait = async (e)=>{
                    showLoading();
                    e.preventDefault();
    
                    const ele = e.target;
                    // let eleindex = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);
                    let eleindex = parseInt(ele.getAttribute('id').split('_')[1]);
                    // let key = props.obj.key;
                    let eleparentNode = ele.parentNode.parentNode.parentNode.parentNode;
                    let eleClassName = eleparentNode.getAttribute('class');
                    let eleKey = [].indexOf.call(document.getElementsByClassName(eleClassName), eleparentNode);
                    
                    console.log(`this key is ${[].indexOf.call(document.getElementsByClassName(eleClassName), eleparentNode)}`);
                    let temp_State = JSON.parse(JSON.stringify(state));
                    
                    let delVal = temp_State.data["createbox"].layers[eleKey].traits.splice(eleindex, 1);
                    
                    let boddy = new FormData();
                    let conntd = await iswalletConnected();
                    
                    console.log(`conntd: ${conntd}`);
                    
                    if(conntd !== false){

                        boddy.append('account', conntd)
                    
                    }else{
                        
                        console.log(`Wallet not connected!!`);

                        return false;
                    
                    }

                    // boddy.append('index',state.temp_value.index);
                    boddy.append('value', JSON.stringify(delVal))
                    // let boddy = {index:state.temp_value.index, values: delVal};

                    await fetch(baseServerUri+'api/delTrait', {method:"post", body: boddy,})
                    .then((res)=> res.json())
                    .then((piss)=>{

                        
                        if(piss.error){
                            state.data.createbox.msg = piss.error;

                            hideLoading();

                            closeLayerOptionsBox();
                        }

                        if(temp_State.data["createbox"].layers[eleKey].traits.length === 0){

                            temp_State.data["createbox"].layers.splice(eleKey, 1);

                        }

                        hideLoading();
                        
                        changeState(temp_State);

                    })

                    
                    // trait_name
                };

                let editLayer = (e)=>{

                    e.preventDefault();
                    let ele = e.target;
                    let eleIndex = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);
                    // console.log(`class name: ${ele.getAttribute('class')}, index of the selected: ${eleIndex}, the selected in array: ${JSON.stringify(state.data["createbox"].layers[eleIndex])}`);
                    let temp_state = JSON.parse(JSON.stringify(state));
                    temp_state.currsubState["createbox"] = "RandomGenerator-LayerOptions-Edit-Layer";
                    temp_state.temp_value = {index:eleIndex};
                    // changeEditState({index:eleIndex})
                    // editState = {index:eleIndex};
                    // console.log(JSON.stringify(editState))
                    // setEditState()
                    changeState(temp_state);
                    // changeEditState()

                }

                const DetailEditTraitBox = (e)=>{
                    
                        let indxx = 0; let boxcont = [];

                        while (indxx < state.data["createbox"].layers[props.obj.key].traits.length){
                            
                            boxcont.push(<div key={indxx} className='LayerUpldContentBx'><div className='LayerUpldContent'><img style={{backgroundColor: '#222'}} src={baseServerUri+state.data["createbox"].layers[props.obj.key].traits[indxx].path} alt=''/><div className='traitName'><input className='traitNameBox' id={"traitName_"+indxx} placeholder={state.data["createbox"].layers[props.obj.key].traits[indxx].trait_name} type="text" name='name' onChange={setTrait} /><Buttonz data={{class:"edit-trait-img-svg", id:'delele_'+indxx, value:'X', func: delTrait}} /></div></div></div>)

                            indxx++;
                        }

                        console.log(`name::>> ${state.data["createbox"].layers[props.obj.key].name}, index of box:: ${props.obj.key}`)

                        return(boxcont)

                }

                return(
                    <div className='layer-box-content' onMouseDown={layer_move_initializer} onMouseUp={layer_move_ender} onTouchStart={layer_move_initializer} onTouchCancel={layer_move_ender} onTouchEnd={layer_move_ender}>
                        <div className='generatorRightPanelLayerBox'>
                            <div className='expander-box' onClick={expandbox} >
                                <div className='generatorRightPanelLayerBox-title' >
                                    <span className='generatorRightPanelLayerBox-title-Span'> {props.obj.name} </span>
                                </div>
                                <div className='generatorRightPanelLayerBox-title-img-div' >
                                    <img height='12px' width='12px' className='generatorRightPanelLayerBox-title-img' src='./inverted-triangle.svg' alt='' />
                                </div>
                            </div>
                            <div className='edit-trait-box'>
                                <div className='edit-trait-img-div' onClick={editLayer}>
                                    <img className='edit-trait-img' src='./edit icon.svg' alt='Edit layer' />
                                </div>
                            </div>
                        </div>
                        <div className='deatail-edit-trait-box inactive'>
                            <DetailEditTraitBox/>
                            <div className='LayerUpldContentBxAdd' onClick={()=>{state.temp_value = props.obj.key; handleAddLayer();}}>
                                <div className='LayerUpldContentadd'>
                                    <img src="./plus.svg" alt=""/>
                                </div>
                                <span style={{color:"#666", float: "left", fontWeight:"700"}}> Add image. </span>
                            </div>
                        </div>
                    </div>
                )
            }

            if(state.currsubState["createbox"] === "RandomGenerator" && state.data["createbox"].layers ){

                if(state.data["createbox"].layers.length > 0){
                    
                    let layerlen = 0; let boxcont = [];

                    while (layerlen < state.data["createbox"].layers.length){
                        
                        boxcont.push(<Layerz obj={{name:state.data["createbox"].layers[layerlen].name, key:layerlen}} key={layerlen}/>)

                        layerlen++;
                    }
                    
                    return(boxcont)

                }else{
                    return('')
                }
            }else{
                return('')
            }
        }

        function Dabttn(){

            const setBGTrait = (e)=>{

                e.preventDefault();

                const ele = e.target;
                
                if(ele.value){
                    if(ele.getAttribute('id').split('_')[0] === 'BGName'){
                        
                        let eleKey = [].indexOf.call(document.getElementsByClassName('BG_traitNameBox'), ele);
                        
                        // console.log(`this key is ${[].indexOf.call(document.getElementsByClassName(eleClassName), eleparentNode)}`);
                        state.data["createbox"].background[eleKey].trait_name = ele.value;
                        ele.setAttribute('placeholder', ele.value);
                    }
                }
            };

            const delBG = async (e)=>{
                showLoading();
                e.preventDefault();
    
                const ele = e.target;
                // let eleindex = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);
                let eleindex = parseInt(ele.getAttribute('id').split('_')[1]);
                let eleIdNAme = ele.getAttribute('id').split('_')[0];
                // deleteBG_UpldContentBx
                // let key = props.obj.key;
                
                let delVal = state.data["createbox"].background.splice(eleindex, 1);
                console.log(`the id = ${ele.getAttribute('id')}, this key is ${eleindex}, gggooo ${delVal}`);
                
                let boddy = new FormData();
                let conntd = await iswalletConnected();
                
                console.log(`conntd: ${conntd}`);
                
                if(conntd !== false){
    
                    boddy.append('account', conntd)
                
                }else{
                    
                    console.log(`Wallet not connected!!`);
    
                    return false;
                
                }
    
                // boddy.append('index',state.temp_value.index);
                boddy.append('value', JSON.stringify(delVal))
                // let boddy = {index:state.temp_value.index, values: delVal};
    
                await fetch(baseServerUri+'api/delTrait', {method:"post", body: boddy,})
                .then((res)=> res.json())
                .then((piss)=>{
    
                    let temp_State = JSON.parse(JSON.stringify(state));

                    if(piss.error){
                        temp_state.data.createbox.msg = piss.error;
                        changeState(temp_State);
                        hideLoading();
                    }

    
                    if( temp_State.data["createbox"].background.length === 0 ){
    
                        delete temp_State.data["createbox"].background;
    
                    }
    
                    hideLoading();
                    
                    changeState(temp_State);
    
                })
    
                
                // trait_name
            };

            if(state.data["createbox"].layers){

                if(state.data["createbox"].layers.length > 1){
                    let bgBox = ''; 
                    
                    let Bgwords = 'Choose Backgrounds';

                    if(state.data["createbox"].background){
                        let indxx = 0; let bgstack = [];

                        function TheBGs(){

                            while (indxx < state.data["createbox"].background.length){
                            
                                bgstack.push(<div key={indxx} className='BG_UpldContentBx'><div className='BG_UpldContent'><img style={{backgroundColor: '#222'}} src={baseServerUri+state.data["createbox"].background[indxx].path} alt=''/><DaInput data={{class:'traitName', typeClass:'BG_traitNameBox', typeId:"BGName_"+indxx, placeholder:state.data["createbox"].background[indxx].trait_name, type:'text', name:'name', onChange:setBGTrait }}/></div><Buttonz data={{class:"delBG", id:'deleteBGUpldContentBx_'+indxx, value:'X', func: delBG}} /></div>)
    
                                indxx++;
                            }

                            return(
                                <div>
                                    <div className='bg_title_box'>
                                        <span style={{display:'table-cell'}}>
                                            Backgrounds
                                        </span>
                                        <div className='edit-bg-box'>
                                            <div className='edit-bg-img-div' >
                                                <img src='./edit icon.svg' alt='Edit layer' />
                                            </div>
                                        </div>
                                    </div>
                                    {bgstack}
                                    <div className='LayerbgAdd' id='selectBG' style={{zIndex:"1"}} onClick={handleAddBGLayer}>
                                        <div className='LayerbgContentadd'>
                                            <img src="./plus.svg" alt=""/>
                                        </div>
                                        <span style={{color:"#666", float: "left", fontSize: "8px", fontWeight:"500"}}> Add image. </span>
                                    </div>
                                </div>
                            )

                        }

                        bgBox = <TheBGs/>;
                        Bgwords = 'GENERATE';
                    }
                        
                    return(
                        <div style={{marginTop:"40px"}}>
                            {bgBox}
                            <Buttonz data={{class:"LayerUpldBttn", id:(state.data["createbox"].background)?'Generate-pfp':'selectBG', value: Bgwords, func: (state.data["createbox"].background)?generate_it:handleAddLayer}} />
                        </div>
                    )
                }else{
                    return("")
                }
            }
            
        }

        ////////////////////////////////////////////

        let activeContract = state.data["createbox"]["activeContract"];
        let conDetails = {};
        
        useEffect(()=>{
            console.log(`pisssing: ${activeContract}`);
            if(state.data["createbox"]["contracts"] && activeContract){
                conDetails["name"] = state.data["createbox"]["contracts"][activeContract].name;
                conDetails["contract"] = state.data["createbox"]["contracts"][activeContract].contract
                // return conDetails;
            }
            
        },[activeContract])

        ///////////////////////////////////////////////////////////
        
        function ThaSamples (){
            

            if(state.data["createbox"].samples){
                if(state.data["createbox"].samples.length > 0){
                        
                    let sampleLen = 0; let boxcont = [];
    
                    while (sampleLen < 4){
                        
                        boxcont.push(<div key={sampleLen} className='LayerUpldContentBx'><div className='LayerUpldContent'><img className='sampleImage' style={{backgroundColor: '#222'}} src={"https://gateway.pinata.cloud/ipfs/"+state.data["createbox"].samples[sampleLen].path+"?"+ new Date().getTime()} alt=''/></div></div>)

                        // console.log(`path::: zz${state.data["createbox"].samples[sampleLen].path}`)
                        sampleLen++;
                    }
                    
                    return(boxcont)
    
                }
            }else{
                showLoading();
                checkWorkInterval(`${baseServerUri}progress/generator/${state.data["createbox"].coll_name}`, 45000, (piss)=>{
                    console.log(`meeehh its done-- ${JSON.stringify(piss)}`);
                    if(piss !== null && piss !== undefined){

                        console.log(`gooogogogogogogog!! `);
                        stopCheckWork();
                        temp_state = JSON.parse(JSON.stringify(state));
                        temp_state.data["createbox"].samples = piss.data.samples;
                        changeState(temp_state);
                        hideLoading();
                    }

                    return (<span style={{color:"white"}}>homoooo: {piss}</span> )
                });
            }
        }
        
        let contractZone = (state.currsubState["createbox"] === "RandomGenerator-RandomGenerated")?true:false;
        let spanBox2  = (contractZone)?<span> Click the <span style={{color:"yellow", display:"contents"}}>"+"</span> to upload custom smart contract with <span style={{color:"white", display:"contents", verticalAlign: "middle", lineHeight: "normal",}}>".sol"</span> extention.<span style={{fontSize:"8px", fontWeight:"normal", color:"#999"}}>If you do not have one click submit, the project will be created using our contract template.</span></span>:<span> Click the "+" to create new layer </span>;
        let mainBox = (contractZone)?<ThaSamples/>:<GenLayers/>;
        let daBattn = (contractZone)?<Buttonz data={{class:"LayerUpldBttn", id:'Generate-pfp', value: 'Deploy Contract', func:nullFunc}} />:"";

        function ContractBox(){
            let boxxcont = [];
            
            if(state.data["createbox"]["contracts"]){
                if(state.data["createbox"]["contracts"].length > 0){

                    let sampleLen = 0; 
                    
                    const the_contracts = state.data["createbox"]["contracts"];
                    const showContract = (e)=>{
                        showLoading();
                        // e.target.getElementsByClassName('contractBox');
                        e.preventDefault();
                        e.stopPropagation();
                        const da_ele = e.target;
                        const daindex = parseInt(da_ele.getAttribute('id').split("_")[1]);
                        // const daindex = [].indexOf.call(document.getElementsByClassName(da_ele.getAttribute('id')), da_ele);
                        console.log(`index::: ${daindex}, name: ${state.data["createbox"]["contracts"][daindex].name}`);
                        // const para = document.createElement("div");
                    
                        // Append text node to the p element:
                        // para.innerHTML = `<div class="popupdark" style="z-index:10000 !important;"><div style="z-index:3000;position:absolute; left: calc( 50% - 200px); border-radius:10px; top:20px; background-color:#000; width: 400px; padding:30px;box-sizing:border-box; height: fit-content;"><h1 style="color:white;">${state.data["createbox"]["contracts"][daindex].name}</h1><span style="color: white;">${state.data["createbox"]["contracts"][daindex].contract}</span></div></div>`;
        
                        // para.classList.add('LayerUpldContent');
    
                        // document.getElementsByClassName('App')[0].prepend(para);

                        temp_state = JSON.parse(JSON.stringify(state));
                        temp_state.data["createbox"]["activeContract"] = daindex;
                        // state.currsubState["createbox"] = "RandomGenerator-LayerOptions-ContractDetails";
                        changeState(temp_state);
                        // state.data["createbox"]["contracts"]
                        hideLoading();
                    };
                    
                    while (sampleLen < the_contracts.length){
                            
                        boxxcont.push(
                            <div key={sampleLen} onClick={showContract} className={"contractBox"} id={"contractBox_"+sampleLen} style={{}} >
                                <img src='./solidity_icon.svg' id={"contractBoxImg_"+sampleLen} alt=''/>
                                <span id={"contractBoxSpan_"+sampleLen} >{ the_contracts[sampleLen].name }</span>
                            </div>
                        );
                        // console.log(`path::: zz${state.data["createbox"].samples[sampleLen].path}`)
                        sampleLen++;
                    }
                    
                    // let showContract = <div><BoxTitle data={{class:'generatorRightPanelTitle', type:'h1', text:(contractZone)?'Contract':'LAYERS'}}/><DaInput data={{class:'traitName', typeClass:'BG_traitNameBox', typeId:"", placeholder:"", type:'text', name:'name', onChange:nullFunc }}/></div>
                    
                    let contractDetailsBox = (typeof(activeContract) === "number")? <div style={{ zIndex: "3000", border: "solid 1px #222", borderRadius: "10px", backgroundColor: "#000", width: "100%", padding: "5px", boxSizing:"border-box", marginBottom: "10px"}}><div style={{ height: "100px", overflowY: "hidden"}}><h2 style={{color:"white", borderBottom: "solid 1px #222",}}>{state.data["createbox"]["contracts"][activeContract].name}.sol</h2><span style={{color: "#888"}}>{JSON.stringify(state.data["createbox"]["contracts"][activeContract].contract, null, 4)}</span></div><div style={{width: "100%"}}><h4 style={{color: "white", fontSize: "10px"}}>expand</h4></div></div>:"";
                    
                    return(
                        <div>
                            <div id="pissingD" style={{padding:"10px 0px", height:"52px", maxHeight:"70px", width:"100%", display:"flex", flexDirection:"row", overflowX: "hidden", overflowY: "hidden"}}>
                                {boxxcont}
                            </div>
                            {contractDetailsBox}
                        </div>
                    )
                }else{
                    return("");
                }
            }else{
                return("");
            }
        }
        if(document.getElementById('popup')) document.getElementById('popup').scrollTop = scrollPosition;

        return(
            <div>
            {/* {contractDetailsBox} */}
            <div className='popupdark' id='popup'>
                <button className='closeBox' onClick={()=> changeState(homeSate) }>
                    X
                </button>
                <div className='RandomGenerator'>
                    <div style={{width:"93vw", maxWidth: "1000px", backgroundColor:"black", padding:"10px 30px", margin: "10px auto 0px auto", boxSizing: "border-box", borderRadius:"20px"}}>
                        <h2 style={{color:"whitesmoke"}}>{state.data["createbox"].coll_name}</h2>
                    </div>
                    <div>
                        <LayerOptions/>
                        <div className='LayerGenBox'>
                            <BoxTitle data={{class:'generatorRightPanelTitle', type:'span', text:(contractZone)?'Contract':'LAYERS'}}/>
                            <ContractBox/>
                            <input type="file" id={(contractZone)?'project_contract':'single_asset'} name={(contractZone)?'project_contract':'single_asset'} accept={(contractZone)?'*':"image/*"} multiple="multiple" style={{opacity:100, zIndex:1}} onChange={(contractZone)?handleSol:state.data["createbox"].func} hidden/>
                            <label className='generatorRightPanelAddNewLayer' onClick={(!contractZone)?handleAddLayer:nullFunc} htmlFor={(contractZone)?'project_contract':''} >
                                <h1>+</h1>
                            </label>
                            <div className='LayerUpldBoxTitle'> {spanBox2} </div>
                            <div id='LayerGenBoxx'> {mainBox} </div>
                            {daBattn}
                            <Dabttn/>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        )
    };

    function Bet (props){

        temp_state.state = "bet";
        
        return (
            <div className='popup'>
                <Buttonz data={{class:'closeBox', value:'X',}}/>
                <button className='closeBox' onClick={()=>changeState({state:"", data: {"createbox": "", "bet": state.data["bet"]}, currsubState: {"createbox":state.currsubState["createbox"], "bet":""}})}>
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
                    <button className='containerbox' onClick={()=>clickCreate({state:'SelectCreateOption', data: { "createbox": state.data["createbox"], "bet": state.data["bet"] }, currsubState:{"createbox":state.currsubState["createbox"], "bet":state.currsubState["bet"]}})} >
                        <div className='title'>
                            <h1>
                                Create
                            </h1>
                        </div>
                    </button>
                </div>
                <div className="welcomeBoxElement">
                    <button className='containerbox' style={{backgroundColor: "#999"}} onClick={()=>""} >
                        <div className='title'>
                            <h1>
                                {props.data.message}
                            </h1>
                            <span style={{display:"block", textAlign:"center", }}>
                                coming soon
                            </span>
                        </div>
                    </button>
                </div>
                <div className="welcomeBoxElement">
                    <button className='containerbox' style={{backgroundColor: "#999"}} onClick={()=>''} >
                        <div className='title'>
                            <h1>
                                De-fi
                            </h1>
                            <span style={{display:"block", textAlign:"center"}}>
                                coming soon
                            </span>
                        </div>
                    </button>
                </div>
                <div className="welcomeBoxElement">
                    <button className='containerbox' style={{backgroundColor: "#999"}} onClick={()=>''} >
                        <div className='title'>
                            <h1>
                                trade
                            </h1>
                            <span style={{display:"block", textAlign:"center"}}>
                                coming soon
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }
    
    if(state.state === "bet"){

        return(<Bet/>)

    }
    
    let currentState;
    switch (state.state) {
        case 'createbox':
            currentState =<div className='popupBox'> <SingleNft/> </div>;
            break;
        case 'RandomGenerator':
            currentState = <div className='popupBox'> <RandomGenerator/> </div>;
            break;
        case 'SelectCreateOption':
            currentState = <div className='popup'> <div className='popupBox'> <SelectCreateOption state={state}/> </div> </div>;
            break;
        default:
            currentState = <div><Header data={state}/>{/* <div style={{padding:"20px", backgroundColor:"yellow", height: "fit-content", margin: "20px 0px"}}> <h1 style={{color:"#000"}}> Create & deploy assets to the blockchain! </h1> <span style={{display: "block", textAlign: "center", fontSize:"15px", fontWeight: "500"}}>-Generate and Store NFT projects(no code needed)<br></br><br></br>-Create NFTs -Create Tokens<br></br></span></div> <button className="enableEthereumButton" onClick={mintNEW}>mint</button> <button className="enableEthereumButton" onClick={iswalletConnected}>Enable Ethereum</button> */}<WelcomeBox/></div>
            break;
    }

    return(
        <div>
            <LoadingBox/>
            {currentState}
        </div>
    );
}

export default memo(Body);