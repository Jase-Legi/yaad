import { useContext } from "react";
import { StateContext } from "../../context/StateContext";
import { connectToChain, blockchainNetworks, currentAddress } from '../../helpers/web3Helpers';
import './header.css';
// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const Header = ()=>{
    const { state, setState } = useContext( StateContext );

    const getChainLogo = ( netwrks, savedChainData )=>{
        if(!savedChainData){
            netwrks.forEach( ( chainData, i )=>{
                if ( chainData.networkParameters.chainId === state.chainID ){
                    setState((prev)=>({...prev, chainData, }))
                    return chainData.logo;
                }
            })
        }

        return savedChainData.logo;
    }

    function SearchBar(){ return ( <div className='search-Header-Div'> <button className="headerElementSearch" type='button'> </button> </div> ) };
    
    function ConnectButton(props) {   
        return(
            <div className='headerElementMenu' onClick={()=>{ if( state.account !== null ) { return setState((prev)=>({...prev, sideBar:!state.sideBar })) }else{ return setState( (prev)=>( {...prev, state:"connect", newState:( !state.state )?"home":state.state, oldState:null } ) ) } } } >
                <div className="cd-header" style={{backgroundColor:( state.account === null )?'rgb(255,255,0)':'rgb(255,255,255)'}}>
                    <img src={( state.account === null )?'./wallet.svg':getChainLogo( blockchainNetworks, state.chainData)}  style={{borderRadius:'20px' }} alt="" />	
                </div>
            </div>
        )
    }
    
    function HomeLogo (){
        const homeLogo = <div onClick={()=>{
            return setState((prev)=>({...prev, data: {...prev.data, state:"home", currsubState:null, temp_index: null, chainData: prev.data.chainData, chainID: prev.data.chainID, account: prev.data.account, sideBar:false} }));
        }} className='headerElementlogo'><img src='./yaad.svg' alt='home'/></div>
        return(<>{homeLogo}</>)
    }

    return (
        <header className='header' >
            {/* <Link to='/'> */}
            <HomeLogo/>
            {/* </Link> */}
            {/* <SearchBar style={logoBox}/> */}
            <ConnectButton/>
        </header>
    );
}

export default Header;