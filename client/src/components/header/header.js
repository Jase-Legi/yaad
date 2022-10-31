import { useContext } from "react";
import { StateContext } from "../../context/StateContext";
import './header.css';
// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const Header = ()=>{
    const { state, setState } = useContext( StateContext );
    function SearchBar(){ return ( <div className='search-Header-Div'> <button className="headerElementSearch" type='button'> </button> </div> ) };
    
    function Dropdown(props) {
        var body = undefined;
        var init = function init() {
            body = document.querySelector('body');
        };
        
        let menuClick = function () {
            return toggleClass(body, 'nav-active');
        };
            
        var toggleClass = function toggleClass(element, stringClass) {
            if (element.classList.contains(stringClass)) element.classList.remove(stringClass);else element.classList.add(stringClass);
        };
        init();
        
    
        return(
            <div className='headerElementMenu' onClick={ ()=>{ setState( (prev)=>( {...prev, state:"connect", newState:( !state.state )?"home":state.state, oldState:null } ) ); } } >
                <div className="cd-header">
                    <img src='./wallet.svg' alt="" />	
                </div>
            </div>
        )
    }
    
    return (
        <header className='header' >
            {/* <Link to='/'> */}
                <div className='headerElementlogo'>
                    <img src='./yaad.svg' alt='home'/>
                </div>
            {/* </Link> */}
            {/* <SearchBar style={logoBox}/> */}
            <Dropdown/>
        </header>
    );
}

export default Header;