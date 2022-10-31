import React, { useContext, useState, useEffect } from 'react';
import { StateContext } from '../context/StateContext';
import { MsgContext } from '../context/msgcontext';
import { imgToBase64String, imgURLFromBase64String } from "../helpers/imgBLOBto64";
import { connectToChain, currentAddress, signer,  currentNetwork, oldNetwork, mintNFT, blockchainNetworks } from "../helpers/web3Helpers";
import { validateIMGtype } from "../helpers/imgdatahelpers";
import { imgSignature } from "../helpers/imgSignatures";
import { isAplhaNumeric } from "../helpers/stringValidator";
import yaadcontract from '../contracts/yaad.json';
import nftcontract from '../contracts/the_yaad.sol';
import { DaInput, BoxTitle, Buttonz } from '../components/form/formcomps';
import { LoadingBox, showLoading, hideLoading } from "../components/ui/loading";
import { Link } from 'react-router-dom';

function SingleNft (props){    
    const defaultErrorStack = { intervalId:null, formdata:[], substate:null };
    const { state, setState } = useContext( StateContext );
    const { msg, setMsg } = useContext( MsgContext );
    
    const handlesingleUpload = async (e)=>{
        showLoading();
        let fileLoaded = 0;
        imgSignature(e.target.files[0], (fl)=>{
            console.log(`file signature: ${fl}`);
        })
        const file = e.target.files[0];
        const readr = new FileReader();
        readr.addEventListener("load", ()=>{
            fileLoaded++;
            // console.log(`results: ${readr.result}`);
            if ( fileLoaded === 1 ){
                hideLoading();
                return;
            }

        });

        const uurl = readr.readAsDataURL( file );
        return;
        // const imgstring = await imgToBase64String(file);
        // state.data.file
        let body = new FormData();
        let newItemName = ( state.data?.filename )? state.data?.filename.split('.'):null;
        
        newItemName?.pop();
        let conntd = await connectToChain( blockchainNetworks[6] );
    
        if ( conntd !== false ) { body.append('account', conntd) } else { return false; }
        let assetName = conntd+"__"+Date.now()+"."+e.target.files[0].name.split('.')[e.target.files[0].name.split('.').length-1];
        body.append('single_asset', e.target.files[0], assetName);
        
        if ( state.data?.filename ) body.append( 'name', state.data?.filename );
        
        const singleUploaded = await fetch(`${state.baseServerUri}upldSingle`, {method:"POST", body, }).then( (res)=> res.json() ).then( (piss)=> piss );
        
        if(singleUploaded.error){
            setState( (prev)=> ( {...prev, data: singleUploaded } ) );
        }else{
            setState( (prev)=>( {...prev, state: "createbox", data: singleUploaded, currsubState: "SingleNFTDetailsForm" } ));
        }
    }

    function SingleNFTDetailsForm (props){
        const handlesingleCreate = async (e)=>{
            e.target.classList.add('inactive'); showLoading(); e.preventDefault();
            if(!state.data?.name || state.data?.name === "" || state.data?.name === null || state.data?.name  === undefined || !state.data?.collection || state.data?.collection === null || state.data?.collection === "" || state.data?.collection === undefined){
                hideLoading();
                return setMsg( (prev)=>({...prev, formdata:[{ id:"singleNFTName", value:"", msg:"Please enter a name & collection" }], substate:state.currsubState }));
            }
            
            let body = new FormData();
            body.append('data', JSON.stringify(state.data) );
            const createNft = await fetch(state.baseServerUri+"createone", { method:"POST", body,}).then((res)=> res.json()).then( (piss)=> piss );
            
            if(createNft.error){
                if(createNft.error.message === "duplicate"){
                    hideLoading();
                    return setMsg( (prev)=>({...prev, formdata:[{ id:"createSingleBoxPreview", value:"", msg:"This NFT already exists, please select an original design." }], substate:state.currsubState }));
                }
                hideLoading();
                setState( (prev)=>( {...prev, currsubState: "SingleNFTDetailsForm" } ));                
            }
            
            if( createNft.results ){
                const minted = await mintNFT( createNft.results.IpfsHash ).finally((resp)=>resp);
                if( minted.code === "ACTION_REJECTED" ){
                    hideLoading();
                    e.target.classList.remove('inactive');
                    return setMsg( (prev)=>({...prev, formdata:[{ id:"createSingleBoxPreview", value:"", msg:"Transaction rejected!" }], substate:state.currsubState }));
                }
                console.log(`minted----- ${JSON.stringify(minted)}`);
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
            <>
                <label className='popupBoxEleDetailsLabel' id='createSingleBoxPreview' htmlFor="createSingleAssetUpld" onClick={ ()=>{ document.querySelector('#single_asset').click() } }>
                    <div className='popupBoxEleDetails' style={{padding:( state.data?.path )?'0px':'30px', boxSizing:'border-box'}}> <img src={( state.data?.path )? state.data?.path:'uploadimg.svg' } style={{objectFit:"cover", height: "100%", width:"100%"}} alt=""/> </div>
                </label>
                <input type="file" id='single_asset' name='single_asset' accept="image/*,video/*,audio/*,webgl/*,.glb,.gltf" style={{opacity:100, zIndex:1}} onChange={handlesingleUpload} hidden/>
                <input className='popupBoxTextEle' placeholder={ ( state.data?.name )?state.data?.name:'Name' } type="text" name='name' id='singleNFTName' onChange={ inputChnages } style={ {opacity:100, zIndex:1 } } />
                <DaInput data={{ typeId:'singleNFTDesc', typeClass:'popupBoxTextAreaEle', name:'desc', placeholder:( state.data?.description )?state.data?.description:'Description', type:'textarea', onChange:inputChnages } } />
                <input className='popupBoxTextEle' placeholder={ ( state.data?.collection )?state.data?.collection:'Collection' } type="text" name='collection' id='singleNFTColl' onChange={ inputChnages }  style={{opacity:100, zIndex:1}} />
                <div style={{ flexDirection:"row", maxWidth:'600px', width: '100%', margin: '0px auto' }}>
                    <input className='popupBoxSmallTextAreaLeftEle' placeholder={ ( state.data?.price )?state.data?.price:'Price' } type="number" name='price' id='singleNFTPrice' onChange={ inputChnages }  style={{opacity:100, zIndex:1}} />
                    <input className='popupBoxSmallTextAreaRightEle' placeholder={ ( state.data?.royalties )?state.data?.royalties:'Royalties: max 50%' } type="number" name='royalties' id='singleNFTRoyalty' onChange={inputChnages} style={{opacity:100, zIndex:1}} />
                </div>
                <Buttonz data={ { class:"popupBoxEle", id:'createBox', value:'create', func:handlesingleCreate } } />
            </>
        )
            
    };

    // let singleNFTDetailsForm = (state.currsubState === "SingleNFTDetailsForm")?<SingleNFTDetailsForm/>:"";
    return (
        <div className='popupdark'>
            <div className='popupBox'> 
                <button className='closeBox' onClick={()=> setState((prev)=>({...prev, state:"home", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:null })) } >X</button>
                <SingleNFTDetailsForm/>
            </div>
        </div>
    )
}

export default SingleNft;