import React, { useContext } from 'react'
import { StateContext } from '../context/StateContext';
import { Link, Outlet } from 'react-router-dom';
import { DaInput } from '../components/form/formcomps';
const homeSate = {state:"", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:"createbox", temp_index: null};

function SelectCreateOption( { baseServerUri } ) {
    const {state, setState} = useContext( StateContext );
    return(
        <div className='createOptions'>
            <Link to='/'> <button className='closeBox' onClick={ ()=>setState((prev)=>homeSate) } >X</button> </Link>
            <DaInput data={{ typeId:'single_asset', name:'single_asset', type:'file', hidden:true, accept:'image/*,video/*,audio/*,webgl/*', onChange:()=>false}}/>
            <button className='popupBoxEle' id='createBox' onClick={()=>{document.getElementById('single_asset').click();}}>Single NFT</button>
            <form action={baseServerUri+'api/upldSingle'} method="post" id='createSingleAssetUpld' encType="multipart/form-data"> </form>
            <Link to='/pfpgenerator'>
                <button className='popupBoxEle' id='generateNFT_Coll' onClick={()=>setState((prev)=>({...prev, state: "RandomGenerator"}))}>PFP Project</button>
            </Link>
        </div>
    )
};

export { SelectCreateOption }