import { useState, useContext } from 'react';
import { StateContext } from '../../context/StateContext';
import { MsgContext } from '../../context/msgcontext';
import { showLoading, hideLoading } from '../ui/loading';
import { connectToChain, blockchainNetworks, currentAddress } from '../../helpers/web3Helpers';
import { expandABox } from '../../helpers/domHandlers';
import '../../styles/sideBar.css';
const {log} = console;

const WalletBox = ( )=>{
    const { state, setState } = useContext( StateContext );
    const { msgStacks, setMsgStacks } = useContext( MsgContext );
    let activeChain, inactiveChain = [];
    let daBalance = state.ethBalance, activNetwrkIndx = null;
    
    const setChain = async ( e, chosenNetwork, index )=>{
        showLoading();
        
        const walletConnected = await connectToChain( chosenNetwork );
        if ( walletConnected.code ){
            hideLoading();
            return setMsgStacks((prev)=>({...prev, messages:["Please confirm wallet connection to continue!"], substate:state.currsubState }) );
        }
        
        return hideLoading();
    }

    blockchainNetworks.forEach( ( element, i ) => {
        if( state.chainID === element.networkParameters.chainId ){
            activNetwrkIndx = i;
            activeChain = <div className='currentChain' key={i} onClick={ (e)=>{ expandABox( null, document.getElementById('inactiveNetworks'), 'expandedInactiveNetworks', 'inactiveNetworks' ) } } >
                <img src={(blockchainNetworks[i].logo)?blockchainNetworks[i].logo:'solidity_icon.svg'} alt='' style={{ height:'35px', width:'35px', borderRadius:'7.5px' }} />
                <span> { blockchainNetworks[i].name } </span>
                <img src='./inverted-triangle.svg' style={{ height:'15px', width:'15px', margin:'auto 0px auto auto' }} alt='' />
            </div>
        }else{
            inactiveChain.push(
                <div className='inactiveChains' key={i} onClick={ (e)=>{ return setChain( e, blockchainNetworks[i], i ); } } >
                    <img src={(blockchainNetworks[i].logo)?blockchainNetworks[i].logo:'solidity_icon.svg'} alt='' />
                    <span> { blockchainNetworks[i].name } </span>
                </div>
            )
        }
    });
    
    if( state.account !== null && state.sideBar === true ){
        return(
            <div id='sideBarpopup'>
                <div className='sideBar'>
                    <button className='closeSideBar' onClick={()=>{ return setState((prev)=>({...prev, sideBar:!state.sideBar })) }} >X</button>
                    <div className='currentNetwork'>
                        <span>Current Network:</span>
                        {activeChain}
                        <div id='inactiveNetworks' className='inactiveNetworks'> {inactiveChain} </div>
                        <span>Address:</span>
                        <div style={{fontSize:'9px', width:'100%', padding:'10px',margin:'10px 0px', border:'solid 1px rgb( 52, 52, 52 )', display:'flex', verticalAlign:'middle', flexDirection:'row', overflow:'hidden', borderRadius:'10px', boxSizing:'border-box'}}> <div style={{width:'calc( 100% - 35px )', display:'inline-block', boxSizing:'border-box', overflowX:'hidden', margin:'0px'}}> <span> {state.account} </span> </div> <span style={{ margin:'auto', textAlign:'right', color:'rgb( 120, 120, 120 )', fontWeight:'bold', cursor:'pointer' }} onClick={(e)=>navigator.clipboard.writeText(state.account)} > copy</span> </div>
                        <div style={{padding:'10px', boxSizing:'border-box', width:'100% !important', border:'solid 1px rgb( 52, 52, 52 )', borderRadius:'10px', margin:'10px 0px', overflow:'hidden'}}>Balance: {daBalance.split('.')[0]+'.'+daBalance.split('.')[1].substring(0, 2)+blockchainNetworks[activNetwrkIndx].networkParameters.nativeCurrency.symbol}</div>
                    </div>
                    <div className='walletOptions'>
  
                        {/* <div className='currentChain' onClick={(e)=>( networkSelected.status )? connectWallet():false}>
                            <img src='./metamask.svg' alt='' style={{ height:'35px', width:'35px', borderRadius:'7.5px' }}/>
                            <span>Metamask Wallet</span>
                        </div>
                        <div className='currentChain'>
                            <img src='./bravelogo.svg' alt='' style={{ height:'35px', width:'35px', borderRadius:'7.5px' }}/>
                            <span>Brave Browser</span>
                        </div>
                        <div className='currentChain'>
                            <img src='./walletconnect.svg' alt='' style={{ height:'35px', width:'35px', borderRadius:'7.5px' }}/>
                            <span>Wallet Connect</span>
                        </div> */}
                    </div>
                </div>
            </div>
        )
    }
}

export default WalletBox;