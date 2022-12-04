import React, { useContext } from 'react'
import { StateContext } from '../context/StateContext';
import { Link, Outlet } from 'react-router-dom';

function SelectCreateOption( { baseServerUri } ) {
    const { state, setState } = useContext( StateContext );
    return(
        <div className='createOptions'>
            <button className='closeBox' onClick={ ()=>setState((prev)=>({...prev, state:"", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:null, temp_index: null })) } >X</button>
            
            <button className='popupBoxEle' id='createBox' onClick={()=>{setState( (prev)=>( {...prev, state: "create_std_token", data: { folder:null, filename:null, path:null }, currsubState: "" } ));}}>TOKEN</button>

            {/* <button className='popupBoxEle' id='createBox' onClick={()=>{document.getElementById('single_asset').click();}}>Single NFT</button> */}
            {/* <Link to='/createnft'> */}
            <button className='popupBoxEle' id='createBox' onClick={()=>{setState( (prev)=>( {...prev, state: "createnft", data: { folder:null, filename:null, path:null }, currsubState: "SingleNFTDetailsForm" } ));}}>NFT</button>
            {/* </Link> */}
            {/* <form action={baseServerUri+'api/upldSingle'} method="post" id='createSingleAssetUpld' encType="multipart/form-data"> </form> */}
            {/* <Link to='/pfpgenerator'> */}
                <button className='popupBoxEle' id='generateNFT_Coll' onClick={()=>setState((prev)=>({...prev, state: "RandomGenerator"}))}>PFP Project</button>
            {/* </Link> */}
        </div>
    )
};

export default SelectCreateOption;