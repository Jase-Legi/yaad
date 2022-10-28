import { useState, useContext } from 'react';
import { StateContext } from '../../context/StateContext'
import { BoxTitle }  from '../form/formcomps';
import { LoadingBox, showLoading, hideLoading } from '../ui/loading';
import { walletConnected, blockchainNetworks } from '../../helpers/web3Helpers';
import '../../styles/walletModal.css';

const WalletBox = ( )=>{
    const { state, setState } = useContext( StateContext );
    let bbx = [];
    let [ networkSelected, setNetworkSelected ] = useState( { status: false, index: null } );
    
    blockchainNetworks.forEach((element, i) => {
        let selectedChain = ( networkSelected.index === i )?<div style={{ height:'5px', width:'100%', borderTopLeftRadius:'5px', borderTopRightRadius:'5px', borderBottomLeftRadius:'5px', borderBottomRightRadius:'5px', backgroundColor:'green', float:'left'}}></div>:''
        
        bbx.push( <div className='networkElement' key={i} onClick={ (e)=>{ setNetworkSelected((prev)=>({...prev, status:( prev.index !== i )?true:false, index:( prev.index !== i )?i:null })) } }>
            <img src={(blockchainNetworks[i].logo)?blockchainNetworks[i].logo:'solidity_icon.svg'} alt='' style={{ margin:'0px auto 0px auto', borderRadius: '50%' }}/>
            <span style={{ margin:'0px auto', boxSizing: 'border-box', color:( networkSelected.index === i )?'green':'whitesmoke' }} > { blockchainNetworks[i].name } </span>
            {selectedChain}
        </div>)
    });
    
    return(<div className='boxOverlay'>
        <div className='walletBox'>
            <div className='networkOptions scroller'>
                <BoxTitle data={{ textType:"h3", divClass:"headerStyle", textClass:"centeredText", text:'1. Select a network', divID:"divID" }} />
                <div className='networkElements'> {bbx} </div>
            </div>
            <div className='walletOptions'>
                <BoxTitle data={{ textType:"h3", divClass:"headerStyle", textClass:"centeredText", text:"2. Connect wallet", divID:"divID" }} />
                <div className='walletElement' onClick={ async (e)=>{ showLoading(e); if( networkSelected.status ){ console.log(`heyalll`); await walletConnected( blockchainNetworks[ networkSelected.index ] ); hideLoading(e); if ( state.newState ) setState((prev)=>({...prev, state:prev.newState, newState:null, oldState:null })) } else {  return hideLoading(e); } }}>
                    <img src='./metamask.svg' alt='' style={{ height:'35px', width:'35px', borderRadius:'7.5px' }}/>
                    <span>Metamask Wallet</span>
                </div>
                <div className='walletElement'>
                    <img src='./bravelogo.svg' alt='' style={{ height:'35px', width:'35px', borderRadius:'7.5px' }}/>
                    <span>Brave Browser</span>
                </div>
                <div className='walletElement'>
                    <img src='./walletconnect.svg' alt='' style={{ height:'35px', width:'35px', borderRadius:'7.5px' }}/>
                    <span>Wallet Connect</span>
                </div>
            </div>
        </div>
    </div>)
}

export { WalletBox };