import { createContext, useEffect } from 'react';

let baseServerUri = ( window.location.host  === "localhost:3000" )?'./':'https://yaadlabs.herokuapp.com/';

const homeSate = { state:null, data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:null, temp_index: null, baseServerUri,};

export const StateContext = createContext(homeSate)