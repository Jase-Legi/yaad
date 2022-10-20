import { createContext, useEffect } from 'react';

let baseServerUri = ( window.location.host  === "localhost:3000" )?'./':'https://yaadlabs.herokuapp.com/';

const homeSate = { state:"", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:"createbox", temp_index: null, baseServerUri,};

export const StateContext = createContext(homeSate)