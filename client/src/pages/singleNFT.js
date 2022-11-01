import React, { useContext, useState, useEffect } from 'react';
import { StateContext } from '../context/StateContext';
import { MsgContext } from '../context/msgcontext';
// import { BigNumber } from "ethers";
import { imgToBase64String, imgURLFromBase64String } from "../helpers/imgBLOBto64";
import { connectToChain, currentAddress, signer,  currentNetwork, oldNetwork, mintNFT, blockchainNetworks } from "../helpers/web3Helpers";
import { validateIMGtype } from "../helpers/imgdatahelpers";
import { imgSignature } from "../helpers/imgSignatures";
import { stringLengthRange, isAplhaNumeric, isNumeric } from "../helpers/stringValidator";
import yaadcontract from '../contracts/yaad.json';
import nftcontract from '../contracts/the_yaad.sol';
import { DaInput, BoxTitle, Buttonz } from '../components/form/formcomps';
import { LoadingBox, showLoading, hideLoading } from "../components/ui/loading";
import { Link } from 'react-router-dom';

function SingleNft (props){    
    const defaultErrorStack = { intervalId:null, formdata:[], substate:null };
    const { state, setState } = useContext( StateContext );
    const { msgStacks, setMsgStacks } = useContext( MsgContext );
    
    const handlesingleUpload = async (e)=>{
        showLoading();
        let fileLoaded = 0;
        if( e.target.files.length === 0 ) { setMsgStacks((prev)=>({...prev, messages:["No file selected!"] })); return hideLoading(); }
        // imgSignature(e.target.files[0], (fl)=>{
        //     console.log(`file signature: ${fl}`);
        // });

        const file = e.target.files[0];

        const readr = new FileReader();
        
        readr.addEventListener("load", ()=>{
            fileLoaded++;
            if ( fileLoaded === 1 ){
                setState((prev)=>({...prev, data:{ ...prev.data, path:readr.result}}));
                return hideLoading();
            }
        });
        readr.readAsDataURL(file);
        // hideLoading();
    }

    function SingleNFTDetailsForm (props){
        const handlesingleCreate = async (e)=>{
            e.target.classList.add('inactive'); showLoading(); e.preventDefault();
            if(!state.data?.name || state.data?.name === "" || state.data?.name === null || state.data?.name  === undefined || !state.data?.collection || state.data?.collection === null || state.data?.collection === "" || state.data?.collection === undefined){
                hideLoading();
                return setMsgStacks( (prev)=>({...prev, formdata:[{ id:"singleNFTName", value:"", msg:"Please enter a name & collection" }], substate:state.currsubState }));
            }
            
            let body = new FormData();
            body.append('data', JSON.stringify(state.data) );
            const createNft = await fetch(state.baseServerUri+"createone", { method:"POST", body,}).then((res)=> res.json()).then( (piss)=> piss );
            
            if(createNft.error){
                if(createNft.error.message === "duplicate"){
                    hideLoading();
                    return setMsgStacks( (prev)=>({...prev, formdata:[{ id:"createSingleBoxPreview", value:"", msg:"This NFT already exists, please select an original design." }], substate:state.currsubState }));
                }
                hideLoading();
                setState( (prev)=>( {...prev, currsubState: "SingleNFTDetailsForm" } ));                
            }
            
            if( createNft.results ){
                const minted = await mintNFT( createNft.results.IpfsHash ).finally((resp)=>resp);
                if( minted.code === "ACTION_REJECTED" ){
                    hideLoading();
                    e.target.classList.remove('inactive');
                    return setMsgStacks( (prev)=>({...prev, formdata:[{ id:"createSingleBoxPreview", value:"", msg:"Transaction rejected!" }], substate:state.currsubState }));
                }
                console.log(`minted----- ${JSON.stringify(minted)}`);
                if(minted.hash){
                    return setState( (prev)=>( {...prev, currsubState: "NFTminted" } ));
                }
                
                e.target.classList.remove('inactive'); hideLoading();
            }
        }

        const handleTextInputChanges = async (e)=>{
            const ele = e.target;
            const eleValue = ele.value;
            switch ( e.target.getAttribute('name') ) {
                case 'name':
                    state.data.name = ( stringLengthRange( eleValue, 0, 50 ) && isAplhaNumeric( eleValue, [ '.', '_', ' ' ]))?eleValue:state.data.name;
                    ele.value = state.data.name;
                    break;
                case 'collection':
                    state.data.collection = ( stringLengthRange( eleValue, 0, 50 ) && isAplhaNumeric( eleValue, [ '.', '_', ' ' ]))?eleValue:state.data.collection;
                    ele.value = state.data.collection;
                    break;
                case 'price':
                    state.data.price = ( isNumeric( eleValue ) )?eleValue:state.data.price;
                    ele.value = state.data.price;
                    break;
                case 'royalties':
                    state.data.royalties = ( isNumeric( eleValue ) )?eleValue:state.data.royalties;
                    ele.value = state.data.royalties;
                    break;
                case 'desc':
                    state.data.description = ( stringLengthRange( eleValue, 0, 200 ) )?eleValue:state.data.description;
                    ele.value = state.data.description;
                    break;
                default:
                    break;
            }
            return;
        }
        
        return(
            <>
                <label className='popupBoxEleDetailsLabel' id='createSingleBoxPreview' htmlFor="createSingleAssetUpld" onClick={ ()=>{ document.querySelector('#single_asset').click() } }>
                    <div className='popupBoxEleDetails' style={{padding:( state.data?.path )?'0px':'30px', boxSizing:'border-box'}}> <img src={( state.data?.path )? state.data?.path:'uploadimg.svg' } style={{objectFit:"cover", height: "100%", width:"100%"}} alt=""/> </div>
                </label>
                <input type="file" id='single_asset' name='single_asset' accept="image/*,video/*,audio/*,webgl/*,.glb,.gltf" style={{opacity:100, zIndex:1}} onChange={handlesingleUpload} hidden/>
                <input className='popupBoxTextEle' placeholder={ ( state.data?.name )?state.data?.name:'Name' } type="text" name='name' id='singleNFTName' onChange={ handleTextInputChanges } style={ {opacity:100, zIndex:1 } } />
                <DaInput data={{ typeId:'singleNFTDesc', typeClass:'popupBoxTextAreaEle', name:'desc', placeholder:( state.data?.description )?state.data?.description:'Description', type:'textarea', onChange:handleTextInputChanges } } />
                <input className='popupBoxTextEle' placeholder={ ( state.data?.collection )?state.data?.collection:'Collection' } type="text" name='collection' id='singleNFTColl' onChange={ handleTextInputChanges }  style={{opacity:100, zIndex:1}} />
                <div style={{ flexDirection:"row", maxWidth:'600px', width: '100%', margin: '0px auto' }}>
                    <input className='popupBoxSmallTextAreaLeftEle' placeholder={ ( state.data?.price )?state.data?.price:'Price' } type="number" name='price' id='singleNFTPrice' onChange={ handleTextInputChanges }  style={{opacity:100, zIndex:1}} />
                    <input className='popupBoxSmallTextAreaRightEle' placeholder={ ( state.data?.royalties )?state.data?.royalties:'Royalties: max 50%' } type="number" name='royalties' id='singleNFTRoyalty' onChange={handleTextInputChanges} style={{opacity:100, zIndex:1}} />
                </div>
                <Buttonz data={ { class:"popupBoxEle", id:'createBox', value:'create', func:handlesingleCreate } } />
            </>
        )
            
    };

    // let singleNFTDetailsForm = (state.currsubState === "SingleNFTDetailsForm")?<SingleNFTDetailsForm/>:"";
    return (
        <div className='popupdark'>
            <div className='popupBox'> 
                <button className='closeBoxWhite' onClick={()=> setState((prev)=>({...prev, state:"home", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:null })) } >X</button>
                <SingleNFTDetailsForm/>
            </div>
        </div>
    )
}

export default SingleNft;