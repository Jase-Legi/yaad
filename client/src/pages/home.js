import { useContext } from 'react';
import { walletConnected, blockchainNetworks } from "../helpers/web3Helpers";
import { showLoading, LoadingBox, hideLoading } from "../components/ui/loading";
import { StateContext } from '../context/StateContext';

function WelcomeBox({ data }){
    const { state , setState } = useContext( StateContext );

    return (
        <>
        <div className='welcomeContainer'>
        <div className='headerTitle'>
            <h1>Simplifying the Blockchain.</h1>
            <span>Yaad labs is a web3 platform designed to Simplify Blockchain procedures. Generating entire NFT projects using a few layers, deploy contracts, create decentralized bets, <span style={{color:"rgb(255, 255, 0)"}}>buy, sell & send crypto </span>+ more</span>
        </div>
        <div className='welcomeBox'>
                <div className="welcomeBoxElement">
                    {/* <Link to='/selectCreateOption'> */}
                        <button className='containerbox' onClick={ ()=>{ showLoading(); setState((prev)=>({...prev, state:"SelectCreateOption" } ) ); }} > 
                        {/* setState((prev)=>({...prev, state:"connect", newState:"SelectCreateOption", oldState:null } ) );*/}
                            <div className='title'>
                                <h1>Create</h1>
                                <span style={{display:"block", textAlign:"center", }}> NFTs, Tokens(ERC20, 721, 1155) </span> 
                            </div>
                        </button>
                    {/* </Link> */}
                </div>
            {/* <div className="welcomeBoxElement">
                <button className='containerbox' onClick={()=>{return;}} >
                    <div className='title'>
                        <h1> { data?.message } </h1>
                        <span style={{display:"block", textAlign:"center", }}> coming soon </span>
                    </div>
                </button>
            </div>
            <div className="welcomeBoxElement">
                <button className='containerbox' onClick={()=>''} >
                    <div className='title'>
                        <h1> De-fi </h1>
                        <span style={{display:"block", textAlign:"center"}}> coming soon </span>
                    </div>
                </button>
            </div>
            <div className="welcomeBoxElement">
                <button className='containerbox' onClick={()=>''} >
                    <div className='title'>
                        <h1> trade </h1>
                        <span style={{display:"block", textAlign:"center"}}> coming soon </span>
                    </div>
                </button>
            </div> */}
        </div>
        </div>
        </>
    );
}

export default WelcomeBox;