import { useContext } from 'react';
import { Header } from '../components/header/header';
import { walletConnected } from "../helpers/web3Helpers";
import { showLoading, LoadingBox, hideLoading } from "../components/ui/loading";
import { StateContext } from '../context/StateContext';

function WelcomeBox({ data }){
    const { state , setState } = useContext( StateContext );

    return (
        <>
        <LoadingBox/>
        <Header/>
        <div className='welcomeBox'>
                <div className="welcomeBoxElement">
                    {/* <Link to='/selectCreateOption'> */}
                        
                        <button className='containerbox' onClick={ async()=>{ showLoading(); const conndt = await walletConnected(); if( conndt === false ){ hideLoading(); }else{ hideLoading(); setState((prev)=>({...prev, state: "SelectCreateOption"})) } }} >
                            <div className='title'>
                                <h1>Create</h1>
                                <span style={{display:"block", textAlign:"center", }}> NFTs, Tokens(ERC20, 721, 1155) </span> 
                            </div>
                        </button>
                    {/* </Link> */}
                </div>
            
            <div className="welcomeBoxElement">
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
            </div>
        </div>
        </>
    );
}

export {WelcomeBox}