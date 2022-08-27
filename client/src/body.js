import './body.css'; import './App.css'; import './header.css';
import {useState, memo, useEffect, useMemo} from 'react'; //useRef
import {providers, Contract, utils, BigNumber, ContractFactory} from "ethers";
import yaadtokenAbi from './contracts/ABIs/Yaad.json';
import yaadcontract from './contracts/yaad.json';

const pumpum = window.location.host;

let baseServerUri = (pumpum  === "localhost:3000")?'./':'https://yaadlabs.herokuapp.com/';
let provider = null, signer = null;
let intervalId;
let currentNetwork;

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

let showLoading = ()=>{ document.getElementById('loadingpopup').classList.remove('inactive'); }

let hideLoading = ()=>{ document.getElementById('loadingpopup').classList.add('inactive'); }

const getGas = async (trans)=>{ return (trans)?trans.estimateGas():false; };

const iswalletConnected = async ()=>{
    if(window.ethereum){
        const accounts = await window.ethereum.request({method:'eth_accounts'});
        // console.log(`gasPrice: ${await getGas().finally((eee)=>eee)}`);

        // let gaslimit = gasNow.add(50000)

        if(accounts.length  > 0){
            // const account = accounts[0];
            // console.log(`account:: ${accounts[0]}`);
            // onConnect(account)
            return accounts[0];
        }else{
            const accounts = await window.ethereum.request({method: "eth_requestAccounts"}).catch((error)=>false);
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
        return content;
    }

    reader.readAsText(dFile);
}

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

function LoadingBox(props){
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
        case 'h4':
            textType = <h4 className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''}>{props.data.text}</h4>;
            break;
        default:
            break;
    }
    return ( <div className={(props.data.class)?props.data.class:''} id={(props.data.id)?props.data.id:''}> {textType} </div> )
};

function Buttonz(props){
    return (
        <button className={(props.data.class)?props.data.class:''} id={(props.data.id)?props.data.id:''} style={{zIndex: 11}} onClick={props.data.func}>
            {props.data.value}
        </button>
    )
};

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
                daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} type='text' value={props.data.value} readOnly={(props.data.readOnly)?props.data.readOnly:false} onChange={(props.data.onChange)?(e)=>props.data.onChange(e):nullFunc} hidden/>;
                break;
            default:
                break;
        }
        return(daInput);
    }else{
        switch (props.data.type) {
            case 'file':
                daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''} name={(props.data.name)?props.data.name:''} type='file' multiple={(props.data.multiple)?props.data.multiple:''} accept={(props.data.accept)?props.data.accept:'*'} onChange={(props.data.onChange)?props.data.onChange:nullFunc} onClick={(props.data.onClick)?(e)=>props.data.onClick:nullFunc}/>;
                break;
            case 'textarea':
                daInput = <textarea className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} onChange={(props.data.onChange)?props.data.onChange:nullFunc} onClick={(props.data.onClick)?(e)=>props.data.onClick(e):nullFunc} ></textarea>;
                break;
            case 'text':
                daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} type='text' placeholder={(props.data.placeholder)?props.data.placeholder:''} onChange={(props.data.onChange)?props.data.onChange:nullFunc} onClick={(props.data.onClick)?(e)=>props.data.onClick(e):nullFunc}/>;
                break;
            case 'number':
                daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} type='number' placeholder={(props.data.placeholder)?props.data.placeholder:''} onChange={(props.data.onChange)?props.data.onChange:nullFunc} onClick={(props.data.onClick)?(e)=>props.data.onClick(e):nullFunc} />;
                break;
            default:
                break;
        }
        return( <div className={(props.data.class)?props.data.class:''} id={(props.data.id)?props.data.id:''}> {daInput} </div> );
    }
};

function Body(props){
    const homeSate = {state:"", data:{ createbox : {coll_name : null, coll_symbol : null, layers:[] }, bet:""}, currsubState:{ createbox:"createbox", bet:"bet"}, temp_index: null};

    let temp_state = {state:"", data:{ createbox : {coll_name : null, coll_symbol : null, layers:[] }, bet:""}, currsubState:{ createbox:"createbox", bet:"bet"}, temp_index: null};

    let [state, setState] = useState(homeSate);

    const defaultErrorStack = { intervalId:null, formdata:[], substate:null };

    let [errStacks, setErrStacks] = useState(defaultErrorStack);
    
    let [scrollPosition, setScrollPosition] = useState(0);

    const ipfs_gateway = 'https://gateway.pinata.cloud/ipfs/';

    const changeStack = (val, setname)=>{
        showLoading();
        let mounted = true;
        if(mounted){
            setname((prev)=>(val));
        }
        hideLoading();
        return ()=> mounted = false;
    }

    useEffect(() => {
        return ()=>{
            // if(errStacks.substate !== state.currsubState.createbox && errStacks.substate != null){
            setErrStacks((prev)=>({ intervalId:null, formdata:[], substate:null }));
        }
    }, [state.currsubState.createbox, state.state])

    const timeOutBox = (interval, callback)=>{
        if((errStacks.intervalId === null) && (errStacks.formdata?.length > 0)){
            errStacks.intervalId = setTimeout(()=>{
                callback();
            }, interval)
        }
    }

    function MsgBox(){
        if(errStacks.formdata?.length > 0 && errStacks.substate === state.currsubState.createbox){
            let bbx = [];
            errStacks.formdata.forEach((element, i) => {
                let eleID = errStacks.formdata[i]?.id;
                let the_msg = errStacks.formdata[i]?.msg;
                let the_ele = document.getElementById(eleID);
                bbx.push(
                    <div key={i} className='errorbox' id='errorbox' style={{top: parseInt(the_ele.getBoundingClientRect().bottom)-5+"px", left: parseInt(the_ele.getBoundingClientRect().left)+15+"px"}}><BoxTitle data={{text:`${the_msg}`, type:"span", class:"errorboxEle" }}/><Buttonz data={{value:"X", class:"error-box-closer", func:()=>{setErrStacks((prev)=>(defaultErrorStack))} }} /> </div>
                )
            });
            return ( <div> {bbx} </div> )
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
    
    const deployContract = async (e)=>{
        showLoading();
        const ele = e.target;
        ele.classList.add("inactive");
        
        try {
            let contractOptions = {
                language: "Solidity", 
                sources: {
                'yaad.sol': {
                    content: yaadcontract.contract
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

            let connected = await iswalletConnected();

            if(connected === false){ hideLoading(); return false; }

            let contractData = new FormData();
            contractData.append('contractJSON', JSON.stringify(contractOptions));

            const compiledContract = await fetch(baseServerUri+"api/compileContract", {method:'POST',body: contractData} ).then((theresponse)=>theresponse.json()).then((compiled)=>compiled);
            const abi = compiledContract.abi;
            const bytecode = compiledContract.bytecode;
            
            const factory = new ContractFactory(abi, bytecode, signer);
            const nftToken = await factory.deploy(state.data.createbox.coll_name, state.data.createbox.coll_symbol);
            
            console.log(`nft address: ${nftToken.address}`);
            
            contractData = null;

            temp_state = JSON.parse(JSON.stringify(state));
            temp_state.data.createbox["contract_address"] = nftToken.address;
            temp_state.data.createbox["contract_link"] = `https://${currentNetwork.name}.etherscan.io/address/${nftToken.address}`;
            temp_state.currsubState.createbox = "RandomGenerator-ContractDeployed";
            // {"name":"ropsten","chainId":3,"ensAddress":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"}
            setState((prev)=>({}))
            hideLoading();
            ele.classList.remove("inactive");
            changeState(temp_state);
        } catch (error) {
            console.log(`error: ${error}`)
            return false;
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

    function Header(){
        function SearchBar(){ return ( <div className='search-Header-Div'> <button className="headerElementSearch" type='button'> </button> </div> ) };
        
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
                                <li className="nav__list-item_a" onClick={()=>setState((prev)=>homeSate) } > Home </li>
                                <li className="nav__list-item_a" onClick={()=>changeState({state:'createbox', data: { "createbox": state.data["createbox"], "bet": state.data["bet"] }, currsubState:{"createbox":state.currsubState["createbox"], "bet":state.currsubState["bet"]}})}> Create </li>
                                <li className="nav__list-item_a"> About </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        }
        
        return (
            <header className='header' >
                <div className='headerElementlogo' onClick={()=>window.location = './'}>
                    <img src='./yaad.svg' alt='home'/>
                    {/* <span>
                        Yaad
                    </span> */}
                </div>
                {/* <SearchBar style={logoBox}/> */}
                <Dropdown/>
            </header>
        );
    }

    function handlesingleUload(e){
        let body = new FormData();

        let newItemName = (state.data["createbox"].filename)?state.data["createbox"].filename.split('.'):null;
        
        if(newItemName != null)newItemName.pop();
        
        let assetName = Date.now()+"."+e.target.files[0].name.split('.')[e.target.files[0].name.split('.').length-1];
        
        body.append('single_asset',e.target.files[0],assetName);
        
        if ( state.data["createbox"].filename ) body.append( 'name', state.data["createbox"].filename );
        
        fetch(`${baseServerUri}api/upldSingle`, {method:"POST", body, })
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
                <button className='closeBox' onClick={()=> changeState({state:"", data:{"createbox":"", "bet":""}, currsubState:{"createbox":"createbox", "bet":"bet"}})} >X</button>
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
                    <SingleNFTForm state={state}/>
                </div>
            </div>
        )
    }

    function RandomGenerator (props){
        let [formVals, setformVals] = useState();

        // useMemo(() => {
        //     // if(document.getElementById('popup')) document.getElementById('popup').scrollTop = scrollPosition;
        //     // document.getElementById('popup').scrollTop()

        // }, [state.state, state.currsubState.createbox])
        
        temp_state.state = "RandomGenerator";
        
        let imgbody = new FormData(); let da_files;

        const handleAddBGLayer = (e)=>{

            // temp_state.data["createbox"] = state.data["createbox"];
            
            temp_state.currsubState["createbox"] = "RandomGenerator-LayerOptions-BG-Upld"; 
            
            // changeState(temp_state);
            state.currsubState.createbox = "RandomGenerator-LayerOptions-BG-Upld";
            return setState((prev)=>({...prev, currsubState:{ createbox:"RandomGenerator-LayerOptions-BG-Upld", bet: prev.currsubState.bet}}));
        };

        const handleAddLayer = (e)=>{
            // showLoading();
            
            const elementID = e.target.getAttribute('id');

            let eleIndex = [].indexOf.call(document.getElementsByClassName(e.target.getAttribute('class')), e.target);
            console.log(`index now big:::::>>>> ${state.temp_index}, id: ${elementID}`)
            switch (elementID) {
                case null:
                    state.temp_index = eleIndex;
                    state.currsubState.createbox = "RandomGenerator-LayerOptions-AddLayer";
                    break;
                case "selectBG":
                    state.currsubState.createbox = "RandomGenerator-LayerOptions-BG-Upld";
                    break;
                default:
                    state.temp_index = null;
                    state.currsubState.createbox = "RandomGenerator-LayerOptions-AddLayer";
                    break;
            }
            
            let homeScrollValue = null;
            // state.currsubState["createbox"] = (e.target.getAttribute('id') === 'selectBG')?"RandomGenerator-LayerOptions-BG-Upld":"RandomGenerator-LayerOptions-AddLayer";
            // e.target.setAttribute('id','generatePfps');
            hideLoading();
            return setState((prev)=>({...prev}));
        }
        
        const handleAddLayerUpld = async (e)=>{
            showLoading();
            temp_state = JSON.parse(JSON.stringify(state));
            e.target.classList.add('inactive');
                        
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

            if(e.target.getAttribute('type') === 'file' && e.target.getAttribute('name') === 'multi_asset'){

                let n = 0;
                document.getElementsByClassName('layerContentBox')[0].innerHTML = "";

                while( n < e.target.files.length ) {
                    const para = document.createElement("div");
                    
                    // Append text node to the p element:
                    para.innerHTML = "<img src="+URL.createObjectURL(e.target.files[n])+" />";
    
                    para.classList.add('LayerUpldContentBox');

                    document.getElementsByClassName('layerContentBox')[0].appendChild(para);
                    
                    n++
                }

                da_files = e.target.files;
                // e.target.classList.remove('inactive');

                hideLoading();
                
                return;
            }

            let layerName;

            if(e.target.getAttribute("id") !== "bg_upld"){
                layerName = document.getElementById("LayerName").value.trim();

                if(layerName === "" || document.getElementById("multi_asset").files.length < 1){
                    
                    if( (layerName === "" && document.getElementById("multi_asset").files.length < 1) || ( layerName === "" )) {
                        setErrStacks((prev)=>({...prev, substate: state.currsubState.createbox, formdata: [{id: "LayerName", value: "", msg:"This field cannot be empty!"}] }));
                    }else if( document.getElementById("multi_asset").files.length < 1 ) {
                        setErrStacks((prev)=>({...prev, substate: state.currsubState.createbox, formdata: [{id: "LayerUpldLabel", value: "", msg:"Click the '+' to upload files!"}] }));
                    }

                    e.target.classList.remove('inactive');

                    hideLoading();
                    
                    return false;
                }
            }

            let conntd = await iswalletConnected();
            showLoading();
            
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

                    temp_state.currsubState["createbox"] = "RandomGenerator-LayerOptions-AddLayer";

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
            if(state.currsubState["createbox"] === "RandomGenerator-LayerOptions-Edit-Layer"){
                state.currsubState["createbox"] = "RandomGenerator-LayerOptions-Del-Layer";
                return setState((prev)=>({...prev, previous: prev.currsubState.createbox}));
            }else{
                showLoading();
                if( state.temp_index !== null ){
                    let delVal = state.data["createbox"].layers[ state.temp_index ];
                    let boddy = new FormData();
                    let conntd = await iswalletConnected();

                    if(conntd !== false){
                        boddy.append('account', conntd)
                    }else{
                        closeLayerOptionsBox();
                        // return false;
                    }

                    boddy.append('index', state.temp_index );
                    boddy.append('values', JSON.stringify(delVal));

                    const deletedLayer = await fetch(baseServerUri+'api/delLayer', {method:"post", body: boddy,}).then((res)=> res.json()).then((piss)=>piss);
                    
                    if(deletedLayer.error){
                        state.data.createbox.msg = deletedLayer.error;
                        closeLayerOptionsBox();
                    }
                    
                    state.data["createbox"].layers.splice( state.temp_index, 1);
                    
                    state.temp_index = null;

                    hideLoading();
                    closeLayerOptionsBox();
                }else{
                    closeLayerOptionsBox();
                }
            }
        }
        
        const renameLayer = (e)=>{
            e.preventDefault();
            const ele = e.target;
            if(state.currsubState["createbox"] === "RandomGenerator-LayerOptions-Edit-Layer"){
                state.currsubState.createbox = "RandomGenerator-LayerOptions-Rename_Layer"
                setState((prev)=>({...prev}))
                // return changeState(tmp_stte);

            }else{

                if(ele.value){
                    // let eleindex = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);
                    // let eleindex = parseInt(ele.getAttribute('id').split('_')[1]);
                    
                    state.data["createbox"].layers[ state.temp_index ].name = ele.value;
                    
                    ele.setAttribute('placeholder', ele.value);
                    // trait_name
                }
            }

        };

        const backToPrev = async (e)=>{
            let tmp_stte = JSON.parse(JSON.stringify(state));
            
            state.currsubState.createbox = state.previous;
            setState((prev)=>({...prev}))
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
                    if(document.getElementsByClassName('generatorRightPanelLayerBox-title-img')[me].classList.contains('rotateExpander')){
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

        const checkWorkInterval = (url, interval, callback)=>{
            if(!intervalId){
                intervalId = setInterval(() => {
                    fetch(url)
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
            
            let conntd = await iswalletConnected();
            showLoading();
            if(conntd === false){
                
                console.log(`Wallet not connected!!`);

                return false;
            
            }
            
            state.data["createbox"].account = conntd;
            
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
                    
                    let pin_body = new FormData();
                    pin_body.append('path',backgrounds[f].path);
                    pin_body.append('the_options', options);
                    let pinnedBG = await fetch(`${baseServerUri}api/pinnit`, {method:'POST', body: pin_body}).then((resp)=>resp.json()).then((pinned)=>pinned);
                    console.log(`background: ${JSON.stringify(backgrounds[f])}`);
                    backgrounds[f].path = pinnedBG.IpfsHash;
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
                
                await get_all_possible_combos(traittypes_fin, comboz);
                await shuffle(comboz);
                await insertBackground(comboz);
                
                return comboz;
            };

            let combo =  await allPossibleCombos();
            
            let possibleCombos = combo.length;

            const pinCombo = async (combo, optns)=> {
                
                let pin_body = new FormData();
                
                pin_body.append('path', JSON.stringify(combo));
                
                pin_body.append('the_options', JSON.stringify(optns));
                console.log(`about to pin combo!`);
                let pinnedCombo = await fetch(`${baseServerUri}api/pinnit`,{method:'POST', body: pin_body}).then((rezz)=>rezz.json()).then((pinned)=>pinned);
                console.log(`pinned the combo!`)
                pin_body = null;
                return pinnedCombo;
            }

            let optns = { pinataMetadata:{ name: state.data["createbox"].coll_name, keyvalues: {} }, pinataOptions: { cidVersion: 0 } };

            let pinnedCombo = await pinCombo(combo, optns);
            
            const drawimage = async (traitTypes, width, height) => {
                let sampleArray = [], cap_it = traitTypes.length;
                
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
                    bdy.append('imgindex', v);
                    bdy.append('account', conntd);
                    bdy.append('collname', state.data['createbox'].coll_name);

                    let drewimg = await fetch(`${baseServerUri}api/drawimage`, {method:'POST',body: bdy} ).then((theresponse)=>theresponse.json()).then((drewimg)=>drewimg);
                    
                    bdy = "";
                    bdy = new FormData();
                    bdy.append('path', drewimg.path);
                    bdy.append('the_options', JSON.stringify(options));

                    let pinnedSample = await fetch(`${baseServerUri}api/pinnit`,{method:'POST', body: bdy}).then((rezz)=>rezz.json()).then((pinned)=>pinned);
                    
                    let metadataJSON = { name: `sample turd #${v}`, attributes: drawableTraits, path: pinnedSample.IpfsHash};

                    bdy = null;
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

            combo = null;

            const updateDB = async (data, collname, account, thesamples, combo_ipfs_hash)=>{
                // temp_state = JSON.parse(JSON.stringify(state));
                
                // temp_state.data.createbox =  {};

                // temp_state.data.createbox.activeContract = null;

                // temp_state.data.createbox.coll_symbol = state.data["createbox"].coll_symbol;

                // temp_state.data.createbox.coll_name = state.data["createbox"].coll_name;

                // temp_state.data.createbox.samples = thesamples;

                // temp_state.data.createbox.possibleCombos = possibleCombos;

                // temp_state.currsubState.createbox = "RandomGenerator-RandomGenerated";

                // temp_state.data["createbox"]["defaultContract"] =[ {name: "imports.721", contract: nftTokenImportsSol },  {name: "yaad", contract: nftTokenSol}]
                let payload = new FormData();
                payload.append('data', JSON.stringify(state.data.createbox));
                payload.append('collname', state.data["createbox"].coll_name);
                payload.append('collSym', state.data["createbox"].coll_symbol);
                payload.append('account', conntd);
                payload.append('ipfs_uri', combo_ipfs_hash);
                payload.append('samples', JSON.stringify(thesamples));

                let saveCollection = await fetch(`${baseServerUri}api/savenftcollection`, {method:'POST', body:payload}).then((response)=>response.json()).then((ress)=>ress);

                payload = null;
                
                let newcontract = JSON.parse(JSON.stringify(yaadcontract));
                
                newcontract.name = state.data.createbox.coll_name;
                // temp_state.data.createbox.contracts = [yaadcontract];
                return setState((prev)=>({...prev, data:{ createbox: { coll_name: prev.data.createbox.coll_name, coll_symbol: prev.data.createbox.coll_symbol, samples: thesamples, possibleCombos, contracts: [yaadcontract] }}, currsubState:{ createbox: "RandomGenerator-RandomGenerated"}}))
                // return changeState(temp_state);
            
            };

            updateDB(state.data.createbox, state.data['createbox'].coll_name, conntd, samples, pinnedCombo.IpfsHash);
        }
        
        const handleSol = async(e)=>{
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
                            state.data.createbox.contracts = contractArray;
                            state.currsubState.createbox = "RandomGenerator-LayerOptions-ContractName";
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
                if(ele.value.length > 4 || !isAplhaNumeric(ele.value)){
                    ele.value = state.data["createbox"].coll_symbol;
                    return;
                }

                state.data["createbox"]["coll_symbol"] = the_value;
                ele.setAttribute("placeholder", the_value)
            }else if(ele.getAttribute("id") === "contractName"){
                // console.log(`_ charcode: ${"_".charCodeAt(0)}`);
                if(contractZone){
                    ele.value = state.data["createbox"].coll_name;
                    return;
                }

                state.data.createbox.coll_name = the_value;
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
                            let tempArray = state.data["createbox"].layers.splice(initDivIndx,1)[0];

                            state.data["createbox"].layers.splice(newindex, 0, tempArray);
                            
                            hideLoading();

                            changeState(state, document.getElementById('popup').scrollTop());
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
                    let eleindex = parseInt(ele.getAttribute('id').split('_')[1]);
                    let eleparentNode = ele.parentNode.parentNode.parentNode.parentNode;
                    let eleClassName = eleparentNode.getAttribute('class');
                    let eleKey = [].indexOf.call(document.getElementsByClassName(eleClassName), eleparentNode);
                    let delVal = state.data.createbox.layers[eleKey].traits.splice(eleindex, 1);
                    let boddy = new FormData();
                    let conntd = await iswalletConnected();
                    
                    if(conntd !== false){
                        boddy.append('account', conntd);
                    }else{
                        console.log(`Wallet not connected!!`);
                        return false;
                    }
                    
                    boddy.append('value', JSON.stringify(delVal));

                    let deletedTrait = await fetch(baseServerUri+'api/delTrait', {method:"post", body: boddy,}).then((res)=> res.json()).then((piss)=>piss);
                    
                    if(deletedTrait.error){
                        state.data.createbox.msg = deletedTrait.error;
                        hideLoading();
                        return setState((prev)=>( prev ));
                    }

                    if(state.data.createbox.layers[eleKey].traits.length === 0) state.data.createbox.layers.splice(eleKey, 1);

                    hideLoading();
                    return setState((prev)=>({...prev}));
                };

                let editLayer = (e)=>{
                    e.preventDefault();
                    let ele = e.target;
                    let eleIndex = [].indexOf.call(document.getElementsByClassName(ele.getAttribute('class')), ele);
                    setState((prev)=>({...prev, temp_index: eleIndex, currsubState:{ createbox:"RandomGenerator-LayerOptions-Edit-Layer" } } ));
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
console.log(`props.obj.key: ${props.obj.key}`)
                return(
                    <div className='layer-box-content' onMouseDown={layer_move_initializer} onMouseUp={layer_move_ender} onTouchStart={layer_move_initializer} onTouchCancel={layer_move_ender} onTouchEnd={layer_move_ender}>
                        <div className='generatorRightPanelLayerBox'>
                            <button className='expander-box' onClick={expandbox} >
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
                        <div className='deatail-edit-trait-box inactive'>
                            <DetailEditTraitBox/>
                            <div className='LayerUpldContentBxAdd' onClick={handleAddLayer} >
                                <div className='LayerUpldContentContainerAdd'>
                                    <div className='LayerUpldContentadd'>
                                        <img className='LayerUpldContentaddimg' src="./plus.svg" alt=""/>
                                    </div>
                                    <BoxTitle data={{text:"Add image.", class:"addHeaderText", type:"h4"}} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            if(state.currsubState["createbox"] === "RandomGenerator" && state.data.createbox.layers ){

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
            }
        }
        
        console.log(`char code for space: ${" ".charCodeAt(0)}`);
        
        function Dabttn(){
            const setBGTrait = (e)=>{

                e.preventDefault();

                const ele = e.target;
                
                if(ele.value){
                    if(ele.getAttribute('id').split('_')[0] === 'BGName'){
                        let eleKey = [].indexOf.call(document.getElementsByClassName('BG_traitNameBox'), ele);
                        
                        state.data["createbox"].background[eleKey].trait_name = ele.value;
                        ele.setAttribute('placeholder', ele.value);
                    }
                }
            };

            const delBG = async (e)=>{
                showLoading();
                e.preventDefault();
    
                const ele = e.target;
                
                let eleindex = parseInt(ele.getAttribute('id').split('_')[1]);
                
                let delVal = state.data["createbox"].background.splice(eleindex, 1);
                console.log(`the id = ${ele.getAttribute('id')}, this key is ${eleindex}, gggooo ${delVal}`);
                
                let boddy = new FormData();
                let conntd = await iswalletConnected();
                
                if(conntd !== false){
                    boddy.append('account', conntd);
                }else{
                    hideLoading();
                    return false;
                }
                
                boddy.append('value', JSON.stringify(delVal))
    
                let deletedTrait = await fetch(baseServerUri+'api/delTrait', {method:"post", body: boddy,}).then((res)=>res.json()).then((piss)=>piss);
                
                if(deletedTrait.error){
                    state.data.createbox.msg = deletedTrait.error;
                    hideLoading();
                    return setState((prev)=>( prev ));
                }

                if( state.data.createbox.background?.length === 0 ) delete state.data["createbox"].background;

                hideLoading();
                return setState((prev)=>({...prev}));
            };
            
            if(state.data["createbox"].layers?.length > 1){

                let Bgwords = (state.data["createbox"].background)?'GENERATE':'Choose Backgrounds';
                
                function TheBGs(){
                    if(state.data["createbox"].background){
                        let indxx = 0; let bgstack = [];

                        while (indxx < state.data["createbox"].background.length){
                            bgstack.push(<div key={indxx} className='BG_UpldContentBx'><div className='BG_UpldContent'><img style={{backgroundColor: '#222'}} src={baseServerUri+state.data["createbox"].background[indxx].path} alt=''/><DaInput data={{class:'traitName', typeClass:'BG_traitNameBox', typeId:"BGName_"+indxx, placeholder:state.data["createbox"].background[indxx].trait_name, type:'text', name:'name', onChange:setBGTrait }}/></div><Buttonz data={{class:"delBG", id:'deleteBGUpldContentBx_'+indxx, value:'X', func: delBG}} /></div>)

                            indxx++;
                        }

                        return(
                            <div>
                                <div className='bg_title_box'> <span> Backgrounds </span> </div>
                                {bgstack}
                                <div className='LayerbgAdd' id='selectBG' style={{zIndex:"1"}} onClick={handleAddBGLayer}>
                                    <div className='LayerbgContentadd'> <img src="./plus.svg" alt=""/> </div>
                                    <span style={{color:"#666", float: "left", fontSize: "8px", fontWeight:"500", width:'100%', margin:'0px auto'}}> Add image. </span>
                                </div>
                            </div>
                        )
                    }
                }

                return(
                    <div style={{marginTop:"40px"}}>
                        <TheBGs/>
                        <Buttonz data={{class:"LayerUpldBttn", id:(state.data["createbox"].background)?'Generate-pfp':'selectBG', value: Bgwords, func: (state.data["createbox"].background)?generate_it:handleAddLayer}} />
                    </div>
                )
            }
        }
        
        let activeContract = state.data["createbox"]["activeContract"], conDetails = {};
        
        useEffect(()=>{
            // console.log(`pisssing: ${activeContract}`);
            if(state.data["createbox"]["contracts"] && activeContract){
                conDetails["name"] = state.data["createbox"]["contracts"][activeContract].name;
                conDetails["contract"] = state.data["createbox"]["contracts"][activeContract].contract;
            }
            
        },[activeContract])

        function ThaSamples (){
            if(state.data.createbox.samples?.length > 0){
                let sampleLen = 0; let boxcont = [];

                while (sampleLen < 4){
                    boxcont.push(<div key={sampleLen} className='LayerUpldContentBx'><div className='LayerUpldContent'><img className='sampleImage' src={ipfs_gateway+state.data["createbox"].samples[sampleLen].path+"?"+ new Date().getTime()} alt=''/></div></div>)
                    sampleLen++;
                }
                
                return(boxcont)
            }

            showLoading();
            checkWorkInterval(`${baseServerUri}progress/generator/${state.data["createbox"].coll_name}`, 45000, (piss)=>{
                console.log(`meeehh its done-- ${JSON.stringify(piss)}`);
                if(piss !== null && piss !== undefined){
                    stopCheckWork();
                    state.data.createbox.samples = piss.data.samples;
                    setState((prev)=>prev);
                    hideLoading();
                }

                return (<span style={{color:"white"}}>homoooo: {piss}</span> )
            });
        }
        
        let contractZone = (state.currsubState["createbox"] === "RandomGenerator-RandomGenerated")?true:false;
        
        function ContractBox(){
            let boxxcont = [];
            if(state.data.createbox.contracts?.length > 0 && state.currsubState.createbox !== "RandomGenerator-ContractDeployed"){
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
                const the_contracts = state.data.createbox.contracts;
                const showContract = (e)=>{
                    showLoading();
                    e.preventDefault();
                    e.stopPropagation();
                    const da_ele = e.target;
                    const daindex = parseInt(da_ele.getAttribute('id').split("_")[1]);
                    state.data.createbox.activeContract = daindex;
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
                
                let contractDetailsBox = (typeof(activeContract) === "number")? <div className='contract-box'><div id='contract-container' className='contract-container'><h2>{state.data["createbox"]["contracts"][activeContract].name}.sol</h2><span>{state.data["createbox"]["contracts"][activeContract].contract}</span></div><Buttonz data={{class:"expand-contract", id: "expand_contract", value: "expand", func:expandContractBox}} /></div>:"";
                return(
                    <div>
                        <div id="pissingD"> {boxxcont} </div>
                        {contractDetailsBox}
                    </div>
                )
            }
        }

        function AddLayer(){
            return(
                <div style={{marginBottom:"20px"}}>
                    <input type="file" id={(contractZone)?'project_contract':'single_asset'} name={(contractZone)?'project_contract':'single_asset'} accept={(contractZone)?'*':"image/*"} multiple="multiple" style={{opacity:100, zIndex:1}} onChange={(contractZone)?handleSol:state.data["createbox"].func} hidden/>
                    <button className='generatorRightPanelAddNewLayer' id='generatorRightPanelAddNewLayer' onClick={(e)=>{if(!contractZone){ if(state.data.createbox.coll_name?.length > 0){ state.temp_index = null; handleAddLayer(e); }else{ setErrStacks((prev)=>({...prev, formdata:[{id:"contractName", value: document.getElementById("contractName").value, msg: "Enter a project/NFT name!"}], substate:state.currsubState.createbox }) )} }else{ return nullFunc(e)}}} > + </button>
                </div>
            )
        }

        let currentSubState, LayerUpldBoxTitle, mainBox, daBattn, addLayer;

        switch (state.currsubState.createbox) {
            case "RandomGenerator-ContractDeployed":
                break;
            case "RandomGenerator-RandomGenerated":
                daBattn = <Buttonz data={{class:"LayerUpldBttn", id:'Generate-pfp', value: 'Deploy Contract', func: deployContract}} />;
                mainBox = <div id='LayerGenBoxx'><ThaSamples/></div>;
                LayerUpldBoxTitle = <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:`Click the Yaad button to view the NFT contract. \nIf you already have a contract, click "Already have a contract" to link your contract.` }}/>
                break;
            case "RandomGenerator-LayerOptions-AddLayer":
                currentSubState = <div className='LayerUpldBox'>
                    <DaInput data={( state.temp_index  !== null )? {typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', hidden:true, value:state.data.createbox.layers[ state.temp_index ]?.name} : {typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:'Enter layer name.', onChange:(e)=>{}} }/>
                    <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:`Click the "+" to upload layer files${( state.temp_index !== null)?" for: "+state.data.createbox.layers[ state.temp_index ]?.name:""}.`}}/>
                    <label className='LayerUpldBttn' id='LayerUpldLabel' htmlFor='multi_asset' onClick={(e)=>{ let ele_val = document.getElementById("LayerName").value.trim(); if(ele_val === ""){ e.preventDefault(); setErrStacks((prev)=>( {...prev, formdata:[{id:"LayerName", value: document.getElementById("LayerName").value, msg: "Enter a layer name!"}], substate:state.currsubState.createbox } )) }}}> <img src='./plus.svg' alt='' />
                        <DaInput data={{hidden:true, type:'file', typeId:'multi_asset', class:'inactive', name:'multi_asset', multiple:'multiple', accept:'image/*', onChange:handleAddLayerUpld}}/>
                    </label>
                    <div className='layerContentBox'></div>
                    <Buttonz data={{class:"LayerUpldBttn", id:'', value: (typeof( state.temp_index ) === "number")?'Add':'Create', func: handleAddLayerUpld}} />
                </div>;
                break;
            case "RandomGenerator-LayerOptions-BG-Upld":
                currentSubState = <div className='LayerUpldBox'>
                    <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:'Click the "+" to upload background files.'}}/>
                    <label className='LayerUpldBttn' htmlFor='multi_asset'> <img src='./plus.svg' alt='' />
                        <DaInput data={{typeClass:'LayerName', typeId:'multi_asset', name:'bg_asset', type:'file', multiple:'multiple', hidden:true, accept:'image/*', onChange:handleAddLayerUpld}}/>
                    </label>
                    <div className='layerContentBox'></div>
                    <Buttonz data={{class:"LayerUpldBttn", id:'bg_upld', value: 'No Background', func: handleAddLayerUpld}} />
                </div>;
                break;
            case "RandomGenerator-LayerOptions-Edit-Layer":
                currentSubState = <div className='LayerUpldBox'>
                    <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:'Rename layer.'}}/>
                    <input type="text" id='multi_asset' name='bg_asset' multiple="multiple" accept="image/*" style={{opacity:100, zIndex:1}} onChange={handleAddLayerUpld} hidden/>
                    <Buttonz data={{class:'renameLayerBttn', id:'bg_upld', value:'Rename', func: renameLayer}} />
                    <div className='layerContentBox'></div>
                    <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:`Delete ${state.data.createbox.layers[ state.temp_index ]?.name} layer.`}}/>
                    <Buttonz data={{class:"delLayerBttn", id:'bg_upld', value: 'DELETE', func: delLayer}} />
                </div>
                break;
            case "RandomGenerator-LayerOptions-Rename_Layer":
                currentSubState = <div className='LayerUpldBox'>
                    <BoxTitle data={{class:'LayerUpldBoxTitle', type:'h2', text:'Change layer name.'}}/>
                    <DaInput data={{typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:state.data["createbox"].layers[ state.temp_index ]?.name, onChange:renameLayer}}/>
                    <Buttonz data={{class:"nodelLayerBttn", id:'', value:'SUBMIT', func: closeLayerOptionsBox}} />
                </div>
                break;
            case "RandomGenerator-LayerOptions-Del-Layer":
                currentSubState = <div className='LayerUpldBox'>
                    <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:`Select yes to delete ${state.data.createbox.layers[ state.temp_index ]?.name} layer.`}}/>
                    <Buttonz data={{class:'delLayerBttn', id:'', value:'YES', func: delLayer}} />
                    <Buttonz data={{class:'nodelLayerBttn', id:'', value:'NO', func: backToPrev}} />
                </div>
                break;
            case "RandomGenerator-LayerOptions-ContractName":
                currentSubState = <div className='LayerUpldBox'>
                    <BoxTitle data={{class:'LayerUpldBoxTitle', type:'h2', text:'enter contract name.'}}/>
                    <DaInput data={{typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:"Enter main contract name.", onChange:nullFunc}}/>
                    <ContractBox/>
                    <Buttonz data={{class:"nodelLayerBttn", id:'', value:'SUBMIT', func: nullFunc}} />
                </div>
                break;
            default:
                currentSubState = "";
                addLayer = <AddLayer/>
                mainBox = <div id='LayerGenBoxx'><GenLayers/></div>;
                LayerUpldBoxTitle = <BoxTitle data={{class:'LayerUpldBoxTitle', type:'span', text:`Click the "+" icon to create new layer`}}/>;
                break;
        }
        // console.log(`temporary value:::::: ${state.temp_index}`);
        function MainContainer (){
            hideLoading();
            if(!currentSubState){
                return(
                    <div className='popupdark' id='popup'>
                        <button className='closeBox' onClick={()=> setState((prev)=>homeSate) }>X</button>
                        <div className='RandomGenerator'>
                            <div className='coll_name_box'>
                                <div className='contractNameContainer'>
                                    <BoxTitle data={{class:'contractNameText', type:'span', text:'Name:'}}/>
                                    <DaInput data={{ type:'text', typeId:'contractName', typeClass:'contractName', placeholder:(state["data"].createbox.coll_name)?state["data"].createbox.coll_name:"Enter a project name.", onChange:collNameBox, onClick:(e)=>{e.target.value = state["data"].createbox.coll_name}}}/>
                                </div>
                                <div className='contractSymbolContainer'>
                                    <BoxTitle data={{class:'contractSymbolText', type:'span', text:'Symbol:'}}/>
                                    <DaInput data={{ type:'text', typeId:'contractSymbol', typeClass:'contractSymbol', placeholder:(state["data"].createbox.coll_symbol)?state["data"].createbox.coll_symbol:'', onChange:collNameBox}}/>
                                </div>
                            </div>
                            <div className='LayerGenBox'>
                                <BoxTitle data={{class:'generatorRightPanelTitle', type:'span', text:(contractZone)?'Contract':'LAYERS'}}/>
                                <ContractBox/>
                                {LayerUpldBoxTitle}
                                {addLayer}
                                {mainBox}
                                {daBattn}
                                <Dabttn/>
                            </div>
                        </div>
                    </div>
                )
            }else{
                return(
                    <div className='popup'>
                        <Buttonz data={{class:"closeBox", id:'', value:'X', func: closeLayerOptionsBox}} />
                        <div className='LayerOptionsBox'>{currentSubState}</div>
                    </div>
                )
            }
        }
        
        return( <div> <MsgBox/> <MainContainer/> </div> )
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
                    <button className='containerbox' onClick={ async()=>{ showLoading(); let conndt = await iswalletConnected(); if(conndt === false){ hideLoading(); }else{ hideLoading(); setState((prev)=>({...prev, state: "SelectCreateOption"})) } }} >
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

    let currentState;
    switch (state.state) {
        case 'bet':
            currentState = <div className='popup'><Bet/></div>;
            break;
        case 'createbox':
            currentState =<div className='popupBox'> <SingleNft/> </div>;
            break;
        case 'RandomGenerator':
            currentState = <div className='popupBox'> <MsgBox/> <RandomGenerator/> </div>;
            break;
        case 'SelectCreateOption':
            currentState = <div className='popup'> <div className='createOptions'> <SelectCreateOption state={state}/> </div> </div>;
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