import React, { useContext, useState, useEffect, useMemo } from 'react'
import { StateContext } from '../context/StateContext';
import { imgToBase64String, imgURLFromBase64String, base64ToBlob } from "../helpers/imgBLOBto64";
import { ContractFactory } from "ethers";
import { connectToChain, signer,  currentNetwork, blockchainNetworks, currentAddress } from "../helpers/web3Helpers";
import { validateIMGtype } from "../helpers/imgdatahelpers";
import { isAplhaNumeric, stringLengthRange } from "../helpers/stringValidator";
import { shuffle, get_all_possible_array_combos } from "../helpers/generatorhelpers";
import { expandABox, divSwapper } from "../helpers/domHandlers";
import yaadcontract from '../contracts/yaad.json';
import nftcontract from '../contracts/the_yaad.sol';
import { DaInput, BoxTitle, Buttonz } from '../components/form/formcomps';
import { LoadingBox, showLoading, hideLoading } from "../components/ui/loading";
import { MsgContext } from "../context/msgcontext";
import { Link } from 'react-router-dom';
import  './generator.css'

function RandomGenerator (props){
    const pumpum = window.location.host;
    let baseServerUri = ( pumpum  === "localhost:3000")?'api/':'https://yaadlabs.herokuapp.com/api/';
    const homeState = { state:"home", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:null, temp_index: null, baseServerUri: baseServerUri,};
    const defaultErrorStack = { intervalId:null, formdata:[], substate:null };
    const { msgStacks, setMsgStacks } = useContext( MsgContext );
    const { state, setState } = useContext( StateContext );
    // useEffect(()=>{
    //     if ( state.data.layers?.length > 0 ){
    //         state.data.possibleCombos = 1;
    //         state.data.layers.forEach((val, indx, arr)=>{
    //             state.data.possibleCombos *= ( val.priority )?(val.traits.length):(val.traits.length+1) 
    //         });

    //         console.log(`possible combos: ${state.data.possibleCombos}`);
    //     }
    // }, [ state.data ] )
const possblCombos = ( arrays )=>{
    let combos = 1;
    arrays.forEach((val, indx, arr)=>{
        combos *= ( val.priority )?(val.traits.length):(val.traits.length+1) 
    });
    return combos;
}
    var wrongFiles = [];
    state.data.activeContract = 0;

    const closeLayerOptionsBox = (e)=>{
        showLoading();
        let gotTo;
        switch (state.currsubState) {
            case "RandomGenerator":
                localStorage.clear();
                gotTo = { state:"home", data:"" };
                break;
            case "RandomGenerator-LayerOptions-Write-Contract":
                state.formVals =  null;
                gotTo = { currsubState:"RandomGenerator-RandomGenerated"};
                break;
            default:
                delete state.data?.tempFiles;
                gotTo = { currsubState: "RandomGenerator" };
                break;
        }

        return setState((prev)=>({...prev, ...gotTo }));
    };

    const deployContract = async (e)=>{
        showLoading(e);
        const address = await currentAddress();
        if(!state.data.coll_name || state.data.coll_name.trim() === ""){
            return setMsgStacks( (prev)=>({...prev, messages:[ "Enter a project/NFT name!" ], substate:state.currsubState }) );
        }
        
        if(!state.data.coll_symbol || state.data.coll_symbol.trim() === ""){
            return setMsgStacks( (prev)=>({...prev, messages:[ "Enter a symbol!" ], substate:state.currsubState }) );
        }

        try {
            fetch(nftcontract).then( r=>r.text()).then( async (contract)=>{
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
                console.log(`chain data: ${JSON.stringify(state.chainData)}`);
                const connected = await connectToChain( blockchainNetworks[6] );
                let contractData = new FormData();
                if( connected === false ) { hideLoading(); return false; }
                contractData.append('contractJSON', JSON.stringify(contractOptions));
                const compiledContract = await fetch( state.baseServerUri+"compileContract", { method:'POST',body: contractData} ).then((theresponse)=>theresponse.json()).then((compiled)=>compiled);
                const abi = compiledContract.abi;
                const bytecode = compiledContract.bytecode;
                const factory = new ContractFactory(abi, bytecode, signer);
                const nftToken = await factory.deploy(state.data.coll_name, state.data.coll_symbol).then((tx)=>tx).catch((e)=>e);
                console.log(`address: ${address}, nft token: ${JSON.stringify(nftToken.reason)}`);
                contractData = null;
                if( nftToken.code ){
                    hideLoading(e);
                    return;
                }

                // {"name":"ropsten","chainId":3,"ensAddress":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"}
                if(nftToken.address){
                    hideLoading(e);
                    return setState( (prev)=>( { ...prev, currsubState: "RandomGenerator-ContractDeployed", data:{...prev.data, contract_address: nftToken.address, contract_link: `https://${currentNetwork.name}.etherscan.io/address/${nftToken.address}`} } ));
                }
            });
        } catch (error) {
            console.log(`error: ${error}`)
            return error;
        }
    };
    
    const handleAddLayerUpld = async ( e, layerindex )=>{
        showLoading(e);
        let layerName, bgElement = false;
        
        if( e.target.getAttribute('type') === 'file' && ( e.target.getAttribute('name') === 'multi_asset' || e.target.getAttribute('name') === 'bg_asset' ) ){
            let currentFiles;
            if ( e.target.files.length < 1 && state.data.tempFiles !== null ){
                return hideLoading(e);
            }else{
                currentFiles = e.target.files;
            }
            if ( currentFiles.length < 1 ) { e.target.classList.remove('inactive'); return hideLoading(e); }

            await validateIMGtype( currentFiles, 'LayerUpldContentBox', 'layerContentBox', [], ([ err, wrongfiles, imgfiles ])=>{
                wrongFiles = wrongfiles;
                if( err !== null || ( wrongfiles.length === currentFiles.length )) {
                    hideLoading(e);
                    return setMsgStacks((prev)=>({...prev, substate: state.currsubState, messages:(err !== null)?[err]:[ "Images too large Max height: 2000px, max width: 2000px." ] }));
                }

                if( document.getElementById('bg_upld') ) document.getElementById('bg_upld').textContent = ( currentFiles.length > 0)?'NEXT':'No Background';
                state.data.tempFiles = imgfiles;
                return hideLoading(e);
            });
            
            return;
        }
        
        if( e.target.getAttribute("id") !== "bg_upld" ){
            layerName = ( state.temp_index === null )? state.formVals:document.getElementById("LayerName").value.trim();
            let msgs = [];
            console.log(`indx: ${ layerindex }`)
            if( layerindex === null ){
                state.data.layers?.forEach((val,indx, arr)=>{
                    if( val.name === layerName ){
                        msgs.push( "This layer name is already in use, enter another!" )
                    }
                })
            }
            // console.log(`indexxxx: ${layerindex}`)
            if ( !layerName ){ msgs.push( "Enter a layer name!" ) }
            if ( !state.data.tempFiles ){ msgs.push( "Click the '+' to upload files!" ) }
            if ( msgs?.length > 0 ) { hideLoading(e); return setMsgStacks((prev)=>({...prev, substate: state.currsubState, messages:msgs, } ) ) }
        }

        bgElement=(e.target.getAttribute("id") === "bg_upld")&& true;

        if(( !state.data.tempFiles ) && e.target.getAttribute("id") === "bg_upld" ){
            state.data.background = ( !state.data.background || state.data.background?.length === 0 )?[]:state.data.background;
            return closeLayerOptionsBox();
        }

        let file_len = state.data.tempFiles.length;
        if ( layerindex === null && !bgElement ) { state.data.layers.push({ name: layerName, traits: [] }); layerindex = state.data.layers.length-1 }

        for ( let n = 0; n < file_len; n++ ){
            const imgURL = state.data.tempFiles[n].path
            const ext = state.data.tempFiles[n].ext
            
            if(bgElement){
                if( Array.isArray(state.data.background) ){
                    state.data.background.push({trait_name: n, path: imgURL, ext, });
                }else{
                    state.data.background = [{trait_name: n, path: imgURL, ext, }]
                }
            }else{
                await state.data.layers[ layerindex ].traits.push({ trait_name: n, path: imgURL, ext, });
            }
        }

        return closeLayerOptionsBox();
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
        showLoading(e);
        const the_value = state.formVals;
        if(state.currsubState === "RandomGenerator-LayerOptions-Edit-Layer"){
            return setState((prev)=>({...prev, currsubState: "RandomGenerator-LayerOptions-Rename_Layer" }));
        }else{
            let alreadyExists = false;
            if ( !isAplhaNumeric( the_value, [ "_", " ","." ] ) || !stringLengthRange( the_value, 1, 50 ) ) { hideLoading(e); return; }
            state.data.layers.forEach((val, indx, arr)=>{
                if ( val.name === the_value.trim() ){
                    alreadyExists = true;
                }
            });

            if ( alreadyExists === true ) {
                hideLoading(e);
                return setMsgStacks((prev)=>({...prev, messages:[ "Layer name is already in use, Enter another name." ] }));
            }

            state.data.layers[ state.temp_index ].name = state.formVals;
            // ele.setAttribute('placeholder', state.formVals);
            return closeLayerOptionsBox();
        }
    };
    
    const prioritizeLayer = async (e)=>{
        let isPriority = state.data.layers[ state.temp_index ].priority;
        document.getElementById("priorityLayerBttn").classList.toggle("disablepriorityLayerBttn");
        document.getElementById("priorityLayerBttn").classList.toggle("makepriorityLayerBttn");
        document.getElementById("makepriorityLayerOption").classList.toggle('ispriorityLayerOption');
        document.getElementById("makepriorityLayerOption").classList.toggle('notpriorityLayerOption');
        document.getElementById("makepriorityLayerOptionSpan").innerText =( isPriority === true )?"NO":"YES";
        state.data.layers[ state.temp_index ].priority = !state.data.layers[ state.temp_index ].priority;
        setState((prev)=>prev)
    };

    const expandbox = ( e, indx )=>{
        showLoading();
        let me = 0;
        while( me < document.getElementsByClassName('layer-images-box' ).length){
            if(me !== indx){
                if(!document.getElementsByClassName('layer-images-box')[me].classList.contains('inactive')){
                    document.getElementsByClassName('layer-images-box')[me].classList.add('inactive');
                }
                if(document.getElementsByClassName('triangle-icon')[me].classList.contains('rotateExpander')){
                    document.getElementsByClassName('triangle-icon')[me].classList.remove('rotateExpander');
                }
            }
            me++;
        }

        if(document.getElementsByClassName('layer-images-box')[indx].classList.contains('inactive')){
            document.getElementsByClassName('triangle-icon')[indx].classList.add('rotateExpander');
            document.getElementsByClassName('layer-images-box')[indx].classList.remove('inactive');
            document.getElementsByClassName("expander-box")[indx].style.backgroundColor = "rgb(129, 129, 129)";
        }else{
            document.getElementsByClassName('triangle-icon')[indx].classList.remove('rotateExpander');
            document.getElementsByClassName('layer-images-box')[indx].classList.add('inactive');
            document.getElementsByClassName("expander-box")[indx].style.backgroundColor = "rgb(190, 190, 190)";
        }

        hideLoading();
    };
    
    const generate_it = async ( e, printCap )=>{
        showLoading(e);
        const psblecmbz = possblCombos( state.data.layers );
        if ( psblecmbz < printCap ){
            hideLoading(e)
            return setMsgStacks((prev)=>({...prev, messages: [ `Add more images to existing layers or create more layers. Your current layers only generate ${psblecmbz} possible unique images.` ], substate: state.currentSubState}));
        }
        let conntd = await connectToChain( blockchainNetworks[6] );
        if( conntd === false ){ return false; }
        
        state.data.account = conntd;

        const loop_and_pin_layers = async ( collName, layers )=>{
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
                    const newimgBlob = await base64ToBlob(imgURLFromBase64String(layers[indx].traits[pin].path));
                    pin_body.append( 'img', newimgBlob, assetName );
                    pin_body.append( 'the_options', JSON.stringify(options) );
                    const pinnedItem = await fetch( `${state.baseServerUri}pinnit`, {method:'POST', body: pin_body} ).then((resp)=>resp.json()).then((pinned)=> pinned );
                    layers[indx].traits[pin].ipfsHash = pinnedItem.IpfsHash;
                    state.data.newlayers.push({ trait_name: layers[indx].traits[pin].trait_name, layer_index:indx, trait_index:pin, ipfsHash:pinnedItem.IpfsHash })
                    emptyComboArray[indx].traits.push({ trait_name: layers[indx].traits[pin].trait_name, layer_index:indx, trait_index:pin, ipfsHash:pinnedItem.IpfsHash });
                }
            }
            
            return emptyComboArray;
        };

        const loop_and_pin_background = async ( backgrounds )=>{
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
                const pinnedBG = await fetch( `${state.baseServerUri}pinnit`, {method:'POST', body: pin_body}).then((resp)=>resp.json()).then((pinned)=>pinned);
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
        
        const traitTypesPushNA = async ( traitTypes, priorities ) => {
            let endo = 0;
            while ( endo < traitTypes.length ) {
                if(!priorities.includes(traitTypes[endo][0].trait_type)){
                    traitTypes[endo].push({trait_type: traitTypes[endo][0].trait_type, value: 'N/A'});
                }
                endo++;
            }
            return traitTypes
        };

        const insertBackground = async ( comboz, backgroundArray ) =>{
            let d = 0; const backgrounds = await loop_and_pin_background( backgroundArray );
            while( d < comboz.length ){
                let newBG = backgrounds[ Math.floor(Math.random() * backgrounds.length) ];
                comboz[d].splice(0, 0, { trait_type: "background", trait_name: newBG.trait_name, value: newBG.ipfsHash });
                d++;
            }
        };

        const allPossibleCombos = async ( collectionName, layersArray, bgArray )=> {
            let comboz = [];
            // let layerz = JSON.parse( JSON.stringify(state.data.layers) );
            const loop_and_pin = await loop_and_pin_layers( collectionName, layersArray );
            const map_traits = await mapTraitTypes(loop_and_pin);
            const traittypes_fin = await traitTypesPushNA(map_traits[0], map_traits[1]);
            
            await get_all_possible_array_combos(traittypes_fin, comboz);
            await shuffle(comboz);
            // console.log(`bg: ${JSON.stringify(bgArray)}`)
            if ( bgArray?.length > 0 ) { await insertBackground( comboz, bgArray ); }
            return comboz;
        };

        let combo =  await allPossibleCombos( state.data.coll_name, state.data.layers, state.data.background );
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
            pinnedCombo = await pinCombo( combo, optns, `${state.baseServerUri}pinnitcombo` );
            console.log(`pinning combo!`)
        }
        else{
            pinnedCombo = {IpfsHash: null};
        }

        const drawimage = async (traitTypes, width, height) => {
            let sampleArray = []; const cap_it = traitTypes.length;
            for( let v = 0; v < cap_it; v++ ){
                const  drawableTraits = traitTypes[v].filter( x=> x.value !== 'N/A');
                const drawableTraits_length = drawableTraits.length;
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext( '2d'  );
                let loadedimgs = 1;
                for(let p = 0; p < drawableTraits_length; p++) {
                    let  drawableTrait = drawableTraits[p];
                    try {
                        // newlayers =  { trait_name: layers[indx].traits[pin].trait_name, layer_index:indx, trait_index:pin, ipfsHash:pinnedItem.IpfsHash }
                        let iterlength = ( ( p === 0 ) && state.data.background.length > 0 )?state.data.background.length:state.data.newlayers.length;
                        loop1:
                        for( let i = 0; i < iterlength; i++ ) {
                            const traitinfo = ( ( p === 0 ) && state.data.background.length > 0 )?state.data.background[i]:state.data.newlayers[i];
                            if( traitinfo.ipfsHash === drawableTrait.value ){
                                console.log(`drawing images: ${p}`)

                                // console.log(`trait ipfsHash: ${traitinfo.ipfsHash}, drawableTrait value: ${ drawableTrait.value }, name:: ${JSON.stringify(state.data.layers[traitinfo.layer_index].traits[traitinfo.trait_index].trait_name)}`);
                                let img = new Image();
                                let base4path = ( ( p === 0 ) && state.data.background.length > 0 )?traitinfo.path:state.data.layers[traitinfo.layer_index].traits[traitinfo.trait_index].path;
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
                                            // let saveCollection = await fetch(`${state.baseServerUri}/savenftcollection`, {method:'POST', body:payload}).then((response)=>response.json()).then((ress)=>ress);
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
                    } catch (error) {
                        console.log(`drawing error occurred: ${JSON.stringify(error)}`)
                        // return res.json({error, current_state: `looping through attributes, failed to draw index ${p}. Details: ${JSON.stringify(traits[p])}`})
                    }
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
            
            return drawimage(sampleImgs, 1000, 1000);
        };

        const samples = await getSamplesAndClearComboData(combo, printCap);
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

    const formDataHandler = (e)=>{
        const ele = e.target;
        const eleID = ele.getAttribute("id");
        const the_value = ele.value.trim();
        
        if ( contractZone ) { ele.value = state.data.coll_name; return; }
        if ( the_value === "" ) return false;
        
        switch ( eleID ) {
            case "contractName":
                if ( !isAplhaNumeric( the_value, [ "_", " " ] ) || !stringLengthRange( the_value, 1, 30 ) ) { ele.value = state.data.coll_name; return; }
                state.data.coll_name = the_value;
                ele.setAttribute("placeholder", the_value);
                break;
            case "contractSymbol":
                if ( !isAplhaNumeric( the_value, [ "_", " " ] ) || !stringLengthRange( the_value, 1, 4 ) ) { ele.value = state.data.coll_symbol; return; }
                state.data.coll_symbol = the_value;
                ele.setAttribute("placeholder", the_value);
                break;
            default:
                if ( !isAplhaNumeric( the_value, [ "_", " " ] ) || !stringLengthRange( the_value, 1, 50 ) ) { ele.value = state.formVals; return; }
                state.formVals = the_value;
                ele.setAttribute("placeholder", the_value);
                break;
        }
        return;
    }
    
    function GenLayers (){
        function Layerz( { layerData } ){
            let mouseUpFired, initPositions = [], elebox = document.getElementById('LayerGenBoxx'), newindex = null;

            useEffect(()=>{
                [].forEach.call(document.getElementsByClassName('layerBox'), (element) => {
                    initPositions.push( element.getBoundingClientRect().top + document.getElementById('popup').scrollTop );
                });
            },[ elebox, initPositions ])

            const layer_move_initializer = ( event, layerIndex )=>{
                if(event.target.getAttribute('class') === 'layerBox'){
                    mouseUpFired = false;

                    if(event.type === 'mousedown' || event.type === 'touchstart'){
                        if(mouseUpFired === true){ return false; }
                        let div = event.target, divWitdh = div.clientWidth, popup = document.getElementById('popup'), indexOfSelectedItem = layerIndex, arrayOfEles = document.getElementsByClassName('layerBox'), centerofdiv = div.clientHeight/2;
                        div.classList.add("sortable-handler");
                        newindex = indexOfSelectedItem;
                        div.style.width = divWitdh+'px';
                        div.style.top = (event.type === 'touchstart')?((event.touches[0].clientY + popup.scrollTop) - centerofdiv)+'px':((event.clientY + popup.scrollTop) - centerofdiv)+'px';
                        
                        window.onmousemove = (e)=>{
                            if(mouseUpFired === false){
                                div.style.top = ((e.clientY + popup.scrollTop) - centerofdiv)+'px';
                                initPositions.forEach((element, i) => {
                                    if ( indexOfSelectedItem > i ) {
                                        if ( ( ( e.clientY + popup.scrollTop ) - 35 ) < ( element ) && ( ( e.clientY + popup.scrollTop ) - 35 ) > ( element - 70 ) ) {
                                            divSwapper(arrayOfEles[i].parentNode, div.parentNode);
                                            newindex = i;
                                            indexOfSelectedItem = i;
                                        }
                                    }

                                    if( indexOfSelectedItem < i ) {
                                        if ( ( ( e.clientY + popup.scrollTop ) + 35 ) > ( element + 70 ) && ( ( e.clientY + popup.scrollTop ) + 35 ) < ( element + 140 ) ) {
                                            divSwapper(div.parentNode, arrayOfEles[i].parentNode);
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
                                            divSwapper(arrayOfEles[i].parentNode, div.parentNode);
                                            newindex = i;
                                            indexOfSelectedItem = i;
                                        }
                                    }

                                    if ( indexOfSelectedItem < i ) {
                                        if( ( ( e.touches[0].clientY + popup.scrollTop ) + 35 ) > ( element + 70 ) && ( ( e.touches[0].clientY + popup.scrollTop ) + 35 ) < ( element + 140 )){
                                            divSwapper( div.parentNode, arrayOfEles[i].parentNode );
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

            const layer_move_ender = ( event, initIndex )=>{
                if(event.target.getAttribute('class') === 'layerBox'){ showLoading(); }
                
                mouseUpFired = true;
                
                if( event.type === 'mouseup' || event.type === 'touchend' || event.type === 'touchcancel'){
                    let div = event.target;
                    div.classList.remove("sortable-handler");
                    let arrayOfEles = document.getElementsByClassName('layerBox');
                    let p = 0;
    
                    while ( p < arrayOfEles.length ) {
                        arrayOfEles[p].classList.remove('betweenItem_two');
                        arrayOfEles[p].classList.remove('betweenItem');
                        p++;
                    }
    
                    mouseUpFired = true;
    
                    if( event.target.getAttribute('class') === 'layerBox' ){
                        if( initIndex !== newindex){
                            let tempArray = state.data.layers.splice( initIndex, 1 )[0];
                            state.data.layers.splice(newindex, 0, tempArray);
                        }
                        setState((prev)=>({...prev}));
                        return hideLoading();
                    }
                }
                
            };

            const setTrait = async ( e, parentIndx, indx )=>{
                e.preventDefault();
                const ele = e.target;
                if(ele.value){
                    state.data.layers[ parentIndx ].traits[ indx ].trait_name = ele.value;
                    ele.setAttribute( 'placeholder', ele.value );
                }
            };

            const delTrait = ( e, parentIndx, indxx )=>{
                showLoading();
                state.data.layers[ parentIndx ].traits.splice( indxx, 1 );
                if ( state.data.layers[ parentIndx ].traits.length === 0 ) state.data.layers.splice( parentIndx, 1 );

                hideLoading();
                return setState((prev)=>({...prev}));
            };
    
            const LayerImagesBox = ()=>{
                let boxcont = [], traitLength = state.data.layers[ layerData.index ].traits.length;
                for ( let indxx = 0; indxx < traitLength; indxx++ ) {
                    let imgsrc = `data:image/${state.data.layers[ layerData.index ].traits[ indxx ].ext};base64,${state.data.layers[ layerData.index ].traits[ indxx ].path}`,
                    traitName = state.data.layers[ layerData.index ].traits[ indxx ].trait_name;
                    boxcont.push(<div key={indxx} className='layer-image-container'>
                        <div className='img-box'>
                            <img src={imgsrc} alt=''/>
                        </div>
                        <div className='traitName'>
                            <input className='traitNameBox' id={"traitName_"+indxx} placeholder={ traitName } type="text" name='name' onClick={(e)=>{ e.target.value = traitName}} onChange={(e)=>setTrait( e, layerData.index, indxx )} />
                            <button className="del-trait" onClick={ (e)=>delTrait( e, layerData.index, indxx ) } >X</button>
                        </div>
                    </div>)                             
                };
                return(boxcont);
            }
            
            return(
                <div className='layer-box-content' onMouseDown={(e)=>layer_move_initializer( e, layerData.index )} onMouseUp={(e)=>layer_move_ender( e, layerData.index )} onTouchStart={(e)=>layer_move_initializer( e, layerData.index )} onTouchCancel={(e)=>layer_move_ender( e, layerData.index )} onTouchEnd={(e)=>layer_move_ender( e, layerData.index )}>
                    <div className='layerBox'>
                        <button className='expander-box' onClick={(e)=>expandbox( e, layerData.index )} >
                            <div className="prioBox" style={{width:"10px", float: "left", height:"10px", borderRadius:"5px", left:"-10px", top:"-10px", boxSizing:"border-box", backgroundColor:"rgb(140, 140, 140)"}} onClick={()=>{return false}}>
                                <div className="prioBoxx" style={{width:"70%", height:"70%", margin:"15%", borderRadius:"35%", backgroundColor:(state.data.layers[ layerData.index ].priority)?"rgb(0, 172, 7)":"#F0000", boxSizing:"border-box", borderLeft:(state.data.layers[ layerData.index ].priority)?"1px solid rgb(159, 255, 162)":"1px solid rgb(190, 190, 190)", borderTop:(state.data.layers[ layerData.index ].priority)?"1px solid rgb(159, 255, 162)":"1px solid rgb(190, 190, 190)"}}>
                                    <div className="prioBoxxx" style={{width:"30%", height:"30%", top:"1px", right:"1px", borderRadius:"35%", backgroundColor:(state.data.layers[ layerData.index ].priority)?"rgb(159, 255, 162)":"rgb(190, 190, 190)", boxSizing:"border-box",}}>
                                    </div>
                                </div>
                            </div>
                            <div className='layer-name' >
                                <span> { state.data.layers[ layerData.index ].name } </span>
                            </div>
                            <div className='triangle-icon-container' >
                                <img className='triangle-icon' src='./inverted-triangle.svg' alt='' />
                            </div>
                        </button>
                        <div className='edit-layer-box'>
                            <div className='edit-layer-icon-div' onClick={(e)=>setState((prev)=>({...prev, temp_index:layerData.index, currsubState: "RandomGenerator-LayerOptions-Edit-Layer" } )) }>
                                <img src='./edit icon.svg' alt='Edit layer' />
                            </div>
                        </div>
                    </div>
                    <div className='layer-images-box inactive'>
                        <button className='add-Layer-imgs' onClick={()=>setState((prev)=>({...prev, temp_index:layerData.index, currsubState: "RandomGenerator-LayerOptions-AddLayer" })) } >+</button>
                        <LayerImagesBox/>
                    </div>
                </div>
            )
        }
        
        if(state.data.layers.length > 0){
            let layerlen = state.data.layers.length, layerindx = 0, boxcont = [];
            for ( layerindx; layerindx < layerlen; layerindx++ ){
                boxcont.push(<Layerz layerData={{ index:layerindx }} key={layerindx}/>);
            }
            return(boxcont)
        }
    }
    
    // console.log(`char code for space: ${" ".charCodeAt(0)}`);
    
    function TheBGs(){
        const setBGTrait = ( e, bgtraitIndex )=>{
            e.preventDefault(); const ele = e.target;
            
            if( ele.value ){
                state.data.background[ bgtraitIndex ].trait_name = ele.value;
                ele.setAttribute('placeholder', ele.value);
            }
        };

        const delBG = ( e, bgtraitIndex )=>{
            showLoading();
            state.data.background.splice( bgtraitIndex, 1);
            if( state.data.background?.length === 0 ) { delete state.data.background; }
            setState((prev)=>({...prev}));
            return hideLoading()
        };
        
        if(state.data.layers?.length > 1){
            if(state.data.background){
                const bglength = state.data.background.length; let bgstack = [];
                
                for ( let indxx = 0; indxx < bglength; indxx++ ){
                    const imgURL = `data:image/${ state.data.background[indxx].ext };base64,`+state.data.background[indxx].path;
                    bgstack.push( <div key={indxx} className='BG_UpldContentBx'><div className='BG_UpldContent'><img src={imgURL} alt=''/><div className='traitName'><input className='BG_traitNameBox' type={'text'} placeholder={ state.data.background[ indxx ].trait_name } onClick={ (e)=> { e.target.value = state.data.background[ indxx ].trait_name} } onChange={(e)=>setBGTrait( e, indxx )} /></div></div><button className="delBG" id={'deleteBGUpldContentBx_'+indxx} onClick={ (e)=>delBG( e, indxx )}>X</button></div> )
                }

                return( <> <div className='bg_title_box'> <span> Backgrounds </span> </div> {bgstack} <div className='LayerbgAdd' id='selectBG' onClick={(e)=>setState((prev)=>({...prev, currsubState:"RandomGenerator-LayerOptions-BG-Upld" }))}> <div className='LayerbgContentadd'> <span>+</span> </div> <span> Add image. </span> </div> </> )
            }
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
                const imgurl = imgURLFromBase64String(state.data.samples[sampleLen].path);
                boxcont.push(<div key={sampleLen} className='layer-image-container'><div className={"img-box"}><img className='sampleImage' src={imgurl} alt=''/></div></div>);
                sampleLen++;
            }
            
            return(<div className='contracted-box'>
                <div id='nftSamples-container' className='contracted-container'>
                    <h3>Generated Samples</h3>
                    { boxcont }
                </div>
                <button className="expander-div" onClick={(e)=>{ expandABox( e, document.getElementById( 'nftSamples-container' ), 'nftSamples-expanded-container', 'nftSamples-contracted-container' ); }} >expand</button>
            </div>)
        }

        // showLoading();
        // checkWorkInterval(`${state.baseServerUri}progress/generator/${state.data.coll_name}`, 45000, (piss)=>{
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
            const the_contracts = state.data.contracts; let contractLen = the_contracts.length;
            
            // const showContract = ( e, daindex )=>{
            //     showLoading(); e.preventDefault();
            //     state.data.activeContract = daindex;
            //     setState((prev)=>({...prev}));
            //     hideLoading();
            // };
            
            // for ( let sampleLen = 0; sampleLen < contractLen; sampleLen++ ){
            //     boxxcont.push(
            //         <button key={sampleLen} onClick={ (e)=>showContract( e, sampleLen ) } className={"contractBox"} >
            //             <img src='./solidity_icon.svg' id={"contractBoxImg_"+sampleLen} alt=''/>
            //             <span id={"contractBoxSpan_"+sampleLen}>{ the_contracts[sampleLen].name }</span>
            //         </button>
            //     );
                
            //     sampleLen++;
            // }
            
            let contractDetailsBox = <div className='contracted-box'>
                <div style={{ height:'20px', width:'20px', margin:'0px 0px -30px auto', cursor:'pointer'}} onClick={(e)=>fetch(nftcontract).then( r=>r.text()).then( async (contract)=>{ return setState((prev)=>({...prev, formVals:{contract}, currsubState:"RandomGenerator-LayerOptions-Write-Contract" })); })}>
                    <img src='./edit icon.svg' alt=''/>
                </div>
                <div id='contracted-container' className='contracted-container'>
                    <h3>{state.data.contracts[0]?.name}.sol</h3>
                    <span>{state.data.contracts[0]?.contract}</span>
                </div>
                <button className="expander-div" onClick={(e)=>expandABox( e, document.getElementById('contracted-container'), 'contracted-container-expanded', 'contracted-container') } >expand</button>
            </div>;
            return( <> {/* <div id="pissingD"> {boxxcont} </div> */} {contractDetailsBox} </> )
        }
    }

    function AddLayer(){
        return(
            <div style={{marginBottom:"20px"}}>
                <input type="file" id={(contractZone)?'project_contract':'single_asset'} name={(contractZone)?'project_contract':'single_asset'} accept={(contractZone)?'*':"image/*"} multiple="multiple" style={{opacity:100, zIndex:1}} onChange={(contractZone)?handleSol:state.data.func} hidden/>
                <button className='generatorRightPanelAddNewLayer' id='generatorRightPanelAddNewLayer' onClick={(e)=>{ if( state.data.coll_name?.length > 0 && state.data.coll_symbol?.length > 0 ){ return setState((prev)=>({...prev, temp_index:null, currsubState: "RandomGenerator-LayerOptions-AddLayer" })); }else{ let messages = []; if( !state.data.coll_symbol ){ messages.push("Enter a project/NFT symbol!") } if( !state.data.coll_name ){ messages.push( "Enter a project/NFT name!" ) } if( messages.length > 0 ){ return setMsgStacks( (prev)=>({...prev, messages, substate:state.currsubState }) ) } } }} > + </button>
            </div>
        )
    }

    function CollNameBox(){
        return(<div className='coll_name_box'>
            <div className='contractNameContainer'>
                <BoxTitle data={{divClass:'contractNameText', textType:'span', text:'Name:'}}/>
                <DaInput data={{ type:'text', typeId:'contractName', typeClass:'contractName', placeholder:(state.data.coll_name)?state.data.coll_name:"Enter your project name.", onChange:formDataHandler, onClick:(e)=>{e.target.value = state.data.coll_name}}}/>
            </div>
            <div className='contractSymbolContainer'>
                <BoxTitle data={{divClass:'contractSymbolText', textType:'span', text:'Symbol:'}}/>
                <DaInput data={{ type:'text', typeId:'contractSymbol', typeClass:'contractSymbol', placeholder:(state.data.coll_symbol)?state.data.coll_symbol:"Enter project symbol.", onChange:formDataHandler}}/>
            </div>
        </div>)
    }

    const setNumbers = async ( e, inputText )=>{
        document.getElementById("solidityEditor").value = inputText;
        let numberOfLines = inputText.split('\n').length;
        let newlen;

        if ( numberOfLines > document.getElementById('lineNumbers')?.childElementCount && document.getElementById('lineNumbers')?.childElementCount !== 0 ){
            newlen = document.getElementById('lineNumbers')?.childElementCount;
            for ( newlen; newlen < numberOfLines; newlen++ ) {
                document.getElementById('lineNumbers').innerHTML += `<span></span>`;
            }
        }

        if( numberOfLines < document.getElementById('lineNumbers')?.childElementCount ){
            newlen = document.getElementById('lineNumbers')?.childElementCount - numberOfLines;
            // for ( numberOfLines; numberOfLines < newlen; numberOfLines++ ) {
            let indx = 0;
            while ( indx < newlen ) {
                document.getElementById('lineNumbers').childNodes[numberOfLines].remove();
                indx++;
            }
        }

        if ( document.getElementById('lineNumbers')?.childElementCount === 0 ){
            let indx = 0;
            while ( indx < numberOfLines ) {
                document.getElementById('lineNumbers').innerHTML += `<span></span>`;
                indx++;
            }
        }

        document.getElementById("solidityEditor").style.height = (document.getElementById('lineNumbers').clientHeight+20)+"px";
        return hideLoading();
    }

    let currentSubState, LayerUpldBoxTitle, mainBox, submitButton, addLayer, coll_Name_Box;
    useEffect( ()=>{
        if ( state.currsubState === "RandomGenerator-LayerOptions-Write-Contract" ){
            document.getElementById('solidityEditor').value = state.formVals.contract;
            setNumbers( null, state.formVals.contract );
            return hideLoading();
        }
    },[ state.currsubState ])

    // useEffect( ()=>{
    //     if ( document.getElementById('lineNumbers')?.childElementCount !==  document.getElementById('solidityEditor')?.value.split('\n').length  ){
    //         setNumbers( null, document.getElementById('solidityEditor')?.value );
    //     }
    // },[ state.formVals.contract ])
    
    switch ( state.currsubState ) {
        case "RandomGenerator-ContractDeployed":
        // case "RandomGenerator-RandomGenerated":
            let contractDeployed = state.currsubState === "RandomGenerator-ContractDeployed";
            coll_Name_Box = ( !contractDeployed )?<CollNameBox/>:"";
            mainBox = <div className='contracted-box' id='LayerGenBoxx'> 
                <div className='contract-deployed-container'>
                    <BoxTitle data={{divClass:'optionsTitle', textType:'h2', text:'Contract Deployed.'}}/>
                    <a href={state.data.contract_link} target="_blank" rel="noreferrer"><BoxTitle data={{divClass:'regularText', textType:'span', text:`Contract address: ${state.data.contract_address}`}}/></a>
                </div>
                <ThaSamples/>
            </div>;
            break;
        case "RandomGenerator-RandomGenerated":
            coll_Name_Box = <CollNameBox/> ;
            mainBox = <div id='LayerGenBoxx'>
                <BoxTitle data={{divClass:'contractTitle', textType:'h2', text:'Deploy contract.'}}/>
                <ContractBox/>
                <ThaSamples/>
                <Buttonz data={{class:"submitBttn", id:'Generate-pfp', value: 'Deploy Contract', func: deployContract}} />;
            </div>;
            break;
        case "RandomGenerator-LayerOptions-AddLayer":
        case "RandomGenerator-LayerOptions-BG-Upld":
            let addLayerIMG = state.currsubState === 'RandomGenerator-LayerOptions-AddLayer';
            let pissoffbox = ( addLayerIMG && state.temp_index === null )?<DaInput data={( state.temp_index !== null )? { typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', hidden:true, value:state.data.layers[ state.temp_index ]?.name } : { typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:(state.formVals !== null)?state.formVals:'Enter layer name.', onChange:formDataHandler, onClick:(e)=>{ e.target.value = state.formVals;} } }/>:<BoxTitle data={{ divClass:"editBoxTitle", textType:'h2', text:`Upload ${( addLayerIMG )?'':"background"} images.`}}/>;
            currentSubState = <div className='LayerUpldBox'>
                { pissoffbox }
                <BoxTitle data={{ divClass:"optionsTitle", textType:'span', text:( addLayerIMG )?(`Click the "+" to upload layer images${( state.temp_index !== null)?" for: "+state.data.layers[ state.temp_index ]?.name:""}.`):`Click the "+" to upload background images.`}}/>
                <button className='plusBttn' id='LayerUpldLabel' htmlFor='multi_asset' style={{ fontSize: '50px !important'}} onClick={( addLayerIMG )?(e)=>{ showLoading(e); let ele_val = state.formVals; if( !ele_val && state.temp_index === null ) { e.preventDefault(); setMsgStacks((prev)=>( {...prev, messages:[ "Enter a layer name!" ], substate:state.currsubState } )); return hideLoading(e); } document.getElementById('multi_asset').click(); return hideLoading(e); }:(e)=>{ showLoading(e); document.getElementById('multi_asset').click(); return hideLoading(e);}} >+
                    <input type={'file'} id='multi_asset' name={( addLayerIMG )?'multi_asset':'bg_asset'} multiple='multiple' onChange={ (e)=>handleAddLayerUpld( e, state.temp_index ) } hidden/>
                    {/* <DaInput data={{hidden:true, type:'file', typeId:'multi_asset', class:'inactive', name:( addLayerIMG )?'multi_asset':'bg_asset', multiple:'multiple', accept:'image/*', onChange:handleAddLayerUpld}}/> */}
                </button>
                <div id='layerContentBox'></div>
                <button className="submitBttn" id={( addLayerIMG )?'addLayerImages':'bg_upld'} onClick={ (e)=>handleAddLayerUpld( e, state.temp_index ) } >
                    {( addLayerIMG )?((typeof( state.temp_index ) === "number")?'Add':'Create'):'No Background'}
                </button>
            </div>;
            break;
        case "RandomGenerator-LayerOptions-Edit-Layer":
            currentSubState = <div className='LayerUpldBox'>
                <BoxTitle data={{divClass:"editBoxTitle", textType:'h2', text:`Edit '${state.data.layers[ state.temp_index ]?.name}' layer.`}}/>
                <div style={{ padding:"0px 10px 10px 10px"}}>
                    <BoxTitle data={{divClass:"optionsTitle", textType:'h4', text:`Rename layer.`}}/>
                    <Buttonz data={{class:'renameLayerBttn', id:'bg_upld', value:'Rename', func: renameLayer}} />
                </div>
                <div style={{ padding: "0px 10px 10px 10px", width: "30%", boxSizing: "border-box", display: "inline-block"}}>
                    <BoxTitle data={{divClass:"optionsTitle", textType:'h4', text:`Prioritized.`}}/>
                    <button id="priorityLayerBttn" className={( state.data.layers[ state.temp_index ].priority === true )?'disablepriorityLayerBttn':'makepriorityLayerBttn'} onClick={(e)=>{ prioritizeLayer(e) }}>
                        <div id='makepriorityLayerOption' className={( state.data.layers[ state.temp_index ].priority === true )?'ispriorityLayerOption':'notpriorityLayerOption'}>
                            <span id='makepriorityLayerOptionSpan'>{( state.data.layers[ state.temp_index ].priority === true )?"YES":"NO"}</span>
                        </div>
                    </button>
                </div>
                <div style={{ padding: "0px 10px 10px 10px", width: "70%", boxSizing: "border-box", display: "inline-block", float:"right"}}>
                    <BoxTitle data={{divClass:"optionsTitle", textType:'h4', text:`Delete layer.`}}/>
                    <Buttonz data={{class:"delLayerBttn", id:'bg_upld', value: 'DELETE', func: delLayer}} />
                </div>
            </div>
            break;
        case "RandomGenerator-LayerOptions-Rename_Layer":
        case "RandomGenerator-LayerOptions-Del-Layer":
            let renameBox = state.currsubState === "RandomGenerator-LayerOptions-Rename_Layer"
            let newLayerName = ( renameBox )?<DaInput data={{typeClass:'LayerName', typeId:'LayerName', name:'name', type:'text', placeholder:state.data.layers[ state.temp_index ].name, onChange:formDataHandler}}/>:<Buttonz data={{class:'delLayerBttn', id:'', value:'YES', func: delLayer}} />;

            currentSubState = <div className='LayerUpldBox'>
                <BoxTitle data={{divClass:"optionsTitle", textType:'h4', text:( renameBox )?'Change layer name.':`Select yes to delete ${state.data.layers[ state.temp_index ]?.name} layer.`}}/>
                { newLayerName }
                <button className="nodelLayerBttn" onClick={( renameBox )?renameLayer:closeLayerOptionsBox}>{(renameBox)?'RENAME':'NO'}</button>
            </div>
            break;
        case "RandomGenerator-LayerOptions-Write-Contract":
            showLoading();
            
            const newlineLen = state.formVals.contract.split('\n').length;
            let boxxcont = [];
            for ( let indx = 0; indx < newlineLen; indx++ ){
                boxxcont.push(<span key={indx}></span>);
                indx++;
            }
            
            let numberSideBar = <div className="lineNumbers" id="lineNumbers" >{boxxcont}</div>
            currentSubState = <div className='LayerUpldBox' style={{padding:"20px"}}>
                <BoxTitle data={{divClass:"contractEditorTitle", textType:'h2', text:'Edit or paste contract.'}}/>
                <BoxTitle data={{divClass:"contractEditorTitle", textType:'span', text:'Changing contract may affect NFT contract deploy.'}}/>
                <div className="editor" id="editor" >
                    {numberSideBar}
                    <textarea className='solidityEditor' id='solidityEditor' onKeyUp={(e)=>{ if( e.key === "Enter" || e.key === "Backspace" || e.key === "Delete" || e.ctrlKey ){ return setNumbers( e, e.target.value ) }}} onChange={(e)=>state.formVals.contract = e.target.value } />
                </div>
                <Buttonz data={{class:"nodelLayerBttn", id:'', value:'SUBMIT', func: ()=>{return false}}} />
            </div>
            break;
        default:
            currentSubState = null;
            state.formVals = null; state.temp_index = null;
            submitButton = ( state.data.layers.length > 1 )?<button id={(state.data.background)?'Generate-pfp':'selectBG'} className="submitBttn" onClick={(e)=>{ if ( state.data.background ) { return generate_it( e, 40 ) }else{ return setState((prev)=>({...prev, currsubState:"RandomGenerator-LayerOptions-BG-Upld" })); } }} >{ (state.data.background)?'GENERATE':'Choose Backgrounds' }</button>:'';
            coll_Name_Box = <CollNameBox/>; addLayer = <AddLayer/>;
            mainBox = <> <div id='LayerGenBoxx'><GenLayers/></div><TheBGs/>{submitButton}</>;
            LayerUpldBoxTitle = <><BoxTitle data={{divClass:'optionsTitle', textType:'h2', text:'LAYERS'}}/> <BoxTitle data={{divClass:'optionsTitle', textType:'span', text:`Click the "+" icon to create new layer`}}/></>;
            break;
    }

    function MainContainer (){
        if(!currentSubState){
            return(
                <div className='RandomGenerator'>
                    <button className='closeBox' onClick={()=> setState( (prev)=>({...prev, state:"home", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:null, temp_index: null }) ) }>X</button>
                    {coll_Name_Box}
                    <div className='LayerGenBox'>
                        { LayerUpldBoxTitle }
                        { addLayer }
                        { mainBox }
                    </div>
                </div>
            )
        }else{
            return(
                <div className={( state.currsubState === 'RandomGenerator-LayerOptions-Write-Contract')?'RandomGenerator':'LayerOptionsBox'} >
                    <button className='closeBox' onClick={closeLayerOptionsBox} >X</button>
                    {currentSubState}
                </div>
            )
        }
    }
    
    return( <div className='popupdark' id='popup'> <MainContainer/> </div> )
};

export default RandomGenerator;