import { useContext } from 'react'
import { Link } from 'react-router-dom';
import { StateContext } from '../context/StateContext';

function WelcomeBox({ data }){
    const currentStateContext = useContext(StateContext);
    // console.log(`current context state: ${currentStateContext}, data:: ${JSON.stringify(data)}`);

    return (
        <div className='welcomeBox'>
            
                <div className="welcomeBoxElement">
                    <Link to='/SelectCreateOption'>
                        {/* onClick={ async()=>{ showLoading(); const conndt = await iswalletConnected(); if(conndt === false){ hideLoading(); }else{ hideLoading(); setState((prev)=>({...prev, state: "SelectCreateOption"})) } }} */}
                        <button className='containerbox' >
                            <div className='title'>
                                <h1>Create</h1>
                                <span style={{display:"block", textAlign:"center", }}> NFTs, Tokens(ERC20, 721, 1155) </span> 
                            </div>
                        </button>
                    </Link>
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
    );
}

export {WelcomeBox}