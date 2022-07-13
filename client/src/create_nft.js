import './containerbox.css'
import {useState, useEffect, memo} from 'react';
function Containerbox(){
    return(
        <div className='containerbox'>
            <div className='title'>

            </div>
        </div>
    )
}
function Body(){
    return (
        <div className='welcomeBox'>
            <div className="welcomeBoxElement">
                <div className='dckcdh'>
                </div>
                <div className=''>

                </div>
                
            </div>
            <div className="welcomeBoxElement">
                <div className='dckcdh'>
                </div>
                <div className=''>

                </div>
                
            </div>
            <div className="welcomeBoxElement">
                <div className='dckcdh'>
                </div>
                <div className=''>

                </div>
                
            </div>
            <div className="welcomeBoxElement">
                <div className='dckcdh'>
                </div>
                <div className=''>

                </div>
                
            </div>
        </div>
    );
}

export default memo(Body);