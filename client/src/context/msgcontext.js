import { createContext } from 'react';
const defaultMsgStack = { intervalId:null, formdata:[], substate:null };

export const MsgContext = createContext( defaultMsgStack )