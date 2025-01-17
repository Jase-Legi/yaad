import { useContext } from 'react';
import { StateContext } from '../../context/StateContext';
import { MsgContext } from '../../context/msgcontext';
import { BoxTitle }  from '../form/formcomps';
import { showLoading, hideLoading } from '../ui/loading';
import { connectToChain, blockchainNetworks, currentAddress } from '../../helpers/web3Helpers';
import '../../styles/walletModal.css';

const WalletBox = ( )=>{
    const { state, setState } = useContext( StateContext );
    const { msgStacks, setMsgStacks } = useContext( MsgContext );
    let bbx = [];
    
    const setChain = async ( e, chosenNetwork, index )=>{
        showLoading();
        //
        const chainID = await connectToChain( chosenNetwork );
        if ( chainID.code ){
            hideLoading();
            return setMsgStacks((prev)=>({...prev, messages:["Please confirm wallet connection to continue!"], substate:state.currsubState }) );
        }
        
        return hideLoading();
    }
    
    const connectWallet = async ( e )=>{
        showLoading(e)
        const account = await currentAddress();
        if( account.code ){
            console.log(`error ${JSON.stringify(account)}!`);
            hideLoading(e);
            return setMsgStacks((prev)=>({...prev, messages:( account.code === 4001 )?["You rejected connection, please confirm wallet connection to continue!"]:["An error occurred while attempting to connect wallet, please try again!"]}) );
        }

        hideLoading(e)
        return setState((prev)=>({...prev, state:( state.newState )?prev.newState:"home", newState:null, oldState:null, account, }));
    }

    blockchainNetworks.forEach( ( element, i ) => {
        let selectedChain = ( state.chainID === blockchainNetworks[i].networkParameters.chainId )?<div style={{ height:'5px', width:'100%', borderTopLeftRadius:'5px', borderTopRightRadius:'5px', borderBottomLeftRadius:'5px', borderBottomRightRadius:'5px', backgroundColor:'rgb( 255, 255, 0 )', float:'left'}}></div>:''
        
        bbx.push( <div className='networkElement' key={i} onClick={ (e)=>{ return setChain( e, blockchainNetworks[i], i ); } } >
            <img src={(blockchainNetworks[i].logo)?blockchainNetworks[i].logo:'solidity_icon.svg'} alt='' style={{ margin:'0px auto 0px auto', borderRadius: '50%' }}/>
            <span style={{ margin:'0px auto', boxSizing: 'border-box', color:( state.chainID === blockchainNetworks[i].networkParameters.chainId )?'rgb( 255, 255, 0 )':'whitesmoke' }} > { blockchainNetworks[i].name } </span>
            {selectedChain}
        </div>)
    });

    console.log(`new state: "${state.newState}"`);
    
    return(
        <div className='walletBox'>
            <button className='closeWalletBox' onClick={()=>{ return setState( ( prev )=>( {...prev, state:( state.oldState )?prev.oldState:"home", newState:null, oldState:null } ))}} >X</button>
            <div className='networkOptions scroller'>
                <BoxTitle data={{ textType:"h3", divClass:"headerStyle", textClass:"centeredText", text:'1. Select a network', divID:"divID" }} />
                <div className='networkElements'> {bbx} </div>
            </div>
            <div className='walletOptions'>
                <BoxTitle data={{ textType:"h3", divClass:"headerStyle", textClass:"centeredText", text:"2. Connect wallet", divID:"divID" }} />
                <div className='walletElement' onClick={(e)=>( state.chainID !== null )? connectWallet():false}>
                    <img src='./metamask.svg' alt='' style={{ height:'35px', width:'35px', borderRadius:'7.5px' }}/>
                    <span>Metamask Wallet</span>
                </div>
                {/* <div className='walletElement'>
                    <img src='./bravelogo.svg' alt='' style={{ height:'35px', width:'35px', borderRadius:'7.5px' }}/>
                    <span>Brave Browser</span>
                </div>
                <div className='walletElement'>
                <img src='./walletconnect.svg' alt='' style={{ height:'35px', width:'35px', borderRadius:'7.5px' }}/>
                    <span>Wallet Connect</span>
                </div> */}
            </div>
        </div>
        )
}

export default WalletBox;